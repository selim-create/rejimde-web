import { API_URL } from './api';

export interface CommentUser {
  name: string;
  slug?: string;
  avatar: string;
  level?: number;
  role?: string;
  profession?: string;
  is_expert?: boolean;
  is_online?: boolean;
  is_verified?: boolean;
  score?: number;
  league?: string;
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
  context?: string;
  status?: 'approved' | 'pending';
  replies?: CommentData[];
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const mapSafeComment = (c: any): CommentData => {
    // 1. Yazar Adı Çözümleme
    let authorName = 'Anonim Kullanıcı';
    let authorSlug = '';
    let authorRole = 'guest';
    let isExpertUser = false;
    let authorLevel = 1;
    let authorProfession = 'Üye';
    let isOnline = false;
    let isVerified = false;
    let level = 'Begin';
    let score = 0;
    
    if (c.author && typeof c.author === 'object') {
        authorName = c.author.name || c.author.username || 'Anonim Kullanıcı';
        authorSlug = c.author.slug || c.author.username || '';
        authorRole = c.author.role || 'rejimde_user';
        isExpertUser = c.author.is_expert || c.author.role === 'rejimde_pro' || false;
        authorLevel = c.author.level || 1;
        authorProfession = c.author.profession || '';
        isOnline = c.author.is_online || false;
        isVerified = c.author.is_verified || false;
        level = c.author.level || '';
        score = c.author.score || 0;
    } 
    else if (c.author_name) {
        authorName = c.author_name;
    }
    
    // 2. Avatar Çözümleme
    let avatarUrl = `https://api.dicebear.com/9.x/personas/svg?seed=${authorName}`;
    
    if (c.author && typeof c.author === 'object' && c.author.avatar) {
        avatarUrl = c.author.avatar;
    } else if (c.avatar) {
        avatarUrl = c.avatar;
    }
    
    if (avatarUrl.includes('gravatar.com')) {
       avatarUrl = `https://api.dicebear.com/9.x/personas/svg?seed=${authorName}`;
    }

    const contentText = c.content?.rendered || c.content || c.text || c.comment_content || '';
    const likes = typeof c.likes === 'number' ? c.likes : (parseInt(c.likes_count || '0'));
    
    let parentId = 0;
    if (c.parent !== undefined && c.parent !== null) {
        parentId = typeof c.parent === 'number' ? c.parent : parseInt(c.parent);
    } else if (c.comment_parent !== undefined && c.comment_parent !== null) {
        parentId = typeof c.comment_parent === 'number' ? c.comment_parent : parseInt(c.comment_parent);
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
        context: c.context,
        status: c.status || 'approved',
        author: {
            name: authorName,
            slug: authorSlug,
            avatar: avatarUrl,
            role: authorRole,
            is_expert: isExpertUser,
            level: authorLevel,
            profession: authorProfession,
            is_online: isOnline,
            is_verified: isVerified,
            level: level,
            score: score
        },
        replies: Array.isArray(c.replies) ? c.replies.map(mapSafeComment) : []
    };
};

export async function fetchComments(postId: number, context: string): Promise<{ comments: CommentData[], stats?: any }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/comments?post=${postId}&context=${context}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
        return { comments: [] }; 
    }
    const data = await res.json();
    const rawComments = Array.isArray(data) ? data : (data.comments || []);
    const stats = !Array.isArray(data) ? data.stats : null;
    
    return { 
        comments: rawComments.map(mapSafeComment),
        stats: stats 
    };
  } catch (error) {
    console.error("Comment fetch error:", error);
    return { comments: [] };
  }
}

export async function fetchExpertReviews(): Promise<{ comments: CommentData[], stats?: any }> {
    try {
      const res = await fetch(`${API_URL}/rejimde/v1/expert/reviews`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
  
      if (!res.ok) return { comments: [] }; 
      const data = await res.json();
      
      const rawComments = Array.isArray(data) ? data : (data.comments || []);
      const stats = !Array.isArray(data) ? data.stats : null;
      
      return { 
          comments: rawComments.map(mapSafeComment),
          stats: stats 
      };
    } catch (error) {
      return { comments: [] };
    }
}

export async function approveComment(commentId: number) {
    const res = await fetch(`${API_URL}/rejimde/v1/comments/${commentId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Onaylama işlemi başarısız');
    return await res.json();
}

// YENİ: Reddet
export async function rejectComment(commentId: number) {
    const res = await fetch(`${API_URL}/rejimde/v1/comments/${commentId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Reddetme işlemi başarısız');
    return await res.json();
}

// YENİ: Spam
export async function spamComment(commentId: number) {
    const res = await fetch(`${API_URL}/rejimde/v1/comments/${commentId}/spam`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Spam bildirimi başarısız');
    return await res.json();
}

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
  
  const result = await res.json();
  if (result.data) {
      result.data = mapSafeComment(result.data);
  }
  return result;
}

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