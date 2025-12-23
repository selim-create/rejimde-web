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
    // Backend 'user', 'author_name' veya 'comment_author' dönebilir.
    const authorName = c.author?.name || c.author_name || c.user || c.comment_author || 'Anonim Kullanıcı';
    
    // 2. Avatar Çözümleme
    let avatarUrl = c.author?.avatar || c.author_avatar_urls?.['96'] || c.author_avatar || c.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${authorName}`;
    
    // Gravatar veya bozuk URL düzeltmesi
    if (avatarUrl.includes('gravatar') && !avatarUrl.includes('d=') && !avatarUrl.includes('dicebear')) {
       avatarUrl = `https://api.dicebear.com/9.x/personas/svg?seed=${authorName}`;
    }

    // 3. Uzmanlık ve Rol Çözümleme
    // Backend 'isExpert' (boolean) veya role string dönebilir.
    const isExpertUser = c.author?.is_expert || c.isExpert || c.is_expert || false;
    const userRole = c.author?.role || c.role || (isExpertUser ? 'rejimde_pro' : 'rejimde_user');

    // 4. İçerik Çözümleme
    // WordPress REST API 'content.rendered' dönerken, custom endpoint 'text' veya 'content' dönebilir.
    const contentText = c.content?.rendered || c.content || c.text || '';

    // 5. Beğeni Sayısı Çözümleme
    const likes = typeof c.likes === 'number' ? c.likes : (parseInt(c.likes_count || '0'));

    return {
        id: c.id,
        content: contentText,
        date: c.date,
        timeAgo: c.human_date || c.timeAgo || 'Az önce', // Backend human_date dönmüyorsa frontend halledebilir
        rating: c.rating,
        parent: c.parent || 0,
        likes_count: likes, 
        is_liked: !!c.is_liked, // Boolean'a çevir
        author: {
            name: authorName,
            slug: c.author?.slug || c.author_slug || '#',
            avatar: avatarUrl,
            role: userRole,
            is_expert: isExpertUser,
            level: c.author?.level || c.level || 1 // Varsayılan level
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