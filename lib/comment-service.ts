import { API_URL } from './api';

export interface CommentUser {
  name: string;
  slug?: string;
  avatar: string;
  level?: number;
  role?: string;
  is_expert?: boolean;
  badge?: {
    name: string;
    icon: string;
    color: string;
  };
}

export interface CommentData {
  id: number;
  author: CommentUser;
  content: string;
  date: string;
  timeAgo?: string;
  rating?: number | null;
  parent: number;
  likes_count: number;
  is_liked: boolean;
  replies?: CommentData[];
}

// Yardımcı: Auth Header
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Backend verisini frontend formatına güvenli bir şekilde çevirir.
 * "Anonim" sorununu çözmek için `c.user`, `c.text` gibi alternatif alanları da kontrol eder.
 */
const mapSafeComment = (c: any): CommentData => {
    // 1. Yazar Adı Çözümleme
    // Backend'den gelen veri yapıları: c.author (object), c.author_name (string), c.user (string) 
    let authorName = 'Anonim Kullanıcı';
    let authorSlug = '';
    let authorRole = 'guest';  // Default to 'guest' for unknown/anonymous users
    let isExpertUser = false;
    let authorLevel = 1;
    
    // Eğer author bir object ise
    if (c.author && typeof c.author === 'object') {
        authorName = c.author.name || c.author.username || 'Anonim Kullanıcı';
        authorSlug = c.author.slug || c.author.username || '';
        authorRole = c.author.role || 'rejimde_user';  // Known user, default to rejimde_user
        isExpertUser = c.author.is_expert || c.author.role === 'rejimde_pro' || false;
        authorLevel = c.author.level || 1;
    } 
    // Eğer author_name string olarak geliyorsa (registered user)
    else if (c.author_name) {
        authorName = c.author_name;
        authorSlug = c.author_slug || '';
        authorRole = c.author_role || 'rejimde_user';  // Has author_name, likely a registered user
        isExpertUser = c.is_expert || c.author_role === 'rejimde_pro' || false;
        authorLevel = c.author_level || 1;
    }
    // Eğer user string olarak geliyorsa (registered user)
    else if (c.user) {
        authorName = c.user;
        authorSlug = c.user_slug || '';
        authorRole = c.user_role || 'rejimde_user';  // Has user field, likely a registered user
        isExpertUser = c.is_expert || c.user_role === 'rejimde_pro' || false;
        authorLevel = c.user_level || 1;
    }
    // WordPress standart comment_author alanı (often anonymous/guest comments)
    else if (c.comment_author) {
        authorName = c.comment_author;
        authorSlug = '';
        authorRole = 'guest';  // WordPress comments are typically guest users
        isExpertUser = false;
        authorLevel = 1;
    }
    
    // 2. Avatar Çözümleme
    let avatarUrl = `https://api.dicebear.com/9.x/personas/svg?seed=${authorName}`;
    
    if (c.author && typeof c.author === 'object' && c.author.avatar) {
        avatarUrl = c.author.avatar;
    } else if (c.author_avatar) {
        avatarUrl = c.author_avatar;
    } else if (c.author_avatar_urls && c.author_avatar_urls['96']) {
        avatarUrl = c.author_avatar_urls['96'];
    } else if (c.avatar) {
        avatarUrl = c.avatar;
    } else if (c.avatar_url) {
        avatarUrl = c.avatar_url;
    }
    
    // Gravatar veya bozuk URL düzeltmesi
    if (avatarUrl.includes('gravatar') && !avatarUrl.includes('d=')) {
       avatarUrl = `https://api.dicebear.com/9.x/personas/svg?seed=${authorName}`;
    }

    // 3. İçerik Çözümleme
    // WordPress REST API 'content.rendered' dönerken, custom endpoint 'text' veya 'content' dönebilir.
    const contentText = c.content?.rendered || c.content || c.text || c.comment_content || '';

    // 4. Beğeni Sayısı Çözümleme
    const likes = typeof c.likes === 'number' ? c.likes : (parseInt(c.likes_count || '0'));
    
    // 5. Parent ID validation
    let parentId = 0;
    if (c.parent !== undefined && c.parent !== null) {
        const parsedParent = typeof c.parent === 'number' ? c.parent : parseInt(c.parent);
        parentId = !isNaN(parsedParent) && parsedParent >= 0 ? parsedParent : 0;
    } else if (c.comment_parent !== undefined && c.comment_parent !== null) {
        const parsedParent = typeof c.comment_parent === 'number' ? c.comment_parent : parseInt(c.comment_parent);
        parentId = !isNaN(parsedParent) && parsedParent >= 0 ? parsedParent : 0;
    }

    return {
        id: c.id || c.comment_ID,
        content: contentText,
        date: c.date || c.comment_date,
        timeAgo: c.human_date || c.timeAgo || 'Az önce',
        rating: c.rating,
        parent: parentId,
        likes_count: likes, 
        is_liked: !!c.is_liked,
        author: {
            name: authorName,
            slug: authorSlug,
            avatar: avatarUrl,
            role: authorRole,
            is_expert: isExpertUser,
            level: authorLevel
        },
        replies: Array.isArray(c.replies) ? c.replies.map(mapSafeComment) : []
    };
};

// Yorumları Getir
export async function fetchComments(postId: number, context: string): Promise<CommentData[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/comments?post=${postId}&context=${context}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
        console.error(`Yorum yükleme hatası: ${res.status}`);
        return []; 
    }
    const data = await res.json();
    
    // API response yapısına göre data'yı al
    // Backend { comments: [...] } veya direkt [...] dönebilir.
    const rawComments = Array.isArray(data) ? data : (data.comments || []);
    
    return rawComments.map(mapSafeComment);
  } catch (error) {
    console.error("Comment fetch error:", error);
    return [];
  }
}

// Yorum Gönder
export async function postComment(data: {
  post: number;
  content: string;
  parent?: number;
  context: string;
  rating?: number;
}) {
  const res = await fetch(`${API_URL}/rejimde/v1/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Yorum gönderilemedi');
  }
  
  return await res.json();
}

// Yorum Beğen
export async function toggleLikeComment(commentId: number) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/comments/${commentId}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!res.ok) throw new Error('İşlem başarısız');
    return await res.json();
  } catch (error) {
    console.error("Like error:", error);
    return null;
  }
}