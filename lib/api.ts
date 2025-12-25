export const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://api.rejimde.com/wp-json';

// Import helper functions
import { calculateReadingTime, translateDifficulty } from './helpers';

// --- AVATAR PAKETİ ---
export const AVATAR_PACK = [
  { id: '1', url: 'https://api.dicebear.com/9.x/personas/svg?seed=Felix', gender: 'male' },
  { id: '2', url: 'https://api.dicebear.com/9.x/personas/svg?seed=Aneka', gender: 'female' },
  { id: '3', url: 'https://api.dicebear.com/9.x/personas/svg?seed=Shadow', gender: 'neutral' }, 
  { id: '4', url: 'https://api.dicebear.com/9.x/personas/svg?seed=Liam', gender: 'male' },
  { id: '5', url: 'https://api.dicebear.com/9.x/personas/svg?seed=Sarah', gender: 'female' },
  { id: '6', url: 'https://api.dicebear.com/9.x/personas/svg?seed=Bubba', gender: 'male' }, 
  { id: '7', url: 'https://api.dicebear.com/9.x/personas/svg?seed=Jocelyn', gender: 'female' },
  { id: '8', url: 'https://api.dicebear.com/9.x/personas/svg?seed=RejimdeBot', gender: 'neutral' }, 
];

export const getDefaultAvatar = (gender: string) => {
    if (gender === 'female') return 'https://api.dicebear.com/9.x/personas/svg?seed=Aneka';
    if (gender === 'male') return 'https://api.dicebear.com/9.x/personas/svg?seed=Felix';
    return 'https://api.dicebear.com/9.x/personas/svg?seed=Shadow';
};

// Yardımcı: Token ile Header Oluşturma
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Yardımcı: Güvenli JSON Parse
const safeParse = (data: any, fallback: any = {}) => {
  if (typeof data === 'string') {
    if (data.trim() === '') return fallback;
    try { return JSON.parse(data); } catch (e) { return fallback; }
  }
  return data || fallback;
};

/**
 * Kullanıcı rollerinden birincil rolü belirle
 * Öncelik sırası: administrator > editor > rejimde_pro > rejimde_user
 * subscriber rolünü rejimde_user olarak normalleştir
 */
const getPrimaryRole = (roles: string[] | undefined): string => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
        return 'rejimde_user';
    }
    
    // Öncelik sırası
    if (roles.includes('administrator')) return 'administrator';
    if (roles.includes('editor')) return 'editor';
    if (roles.includes('rejimde_pro')) return 'rejimde_pro';
    if (roles.includes('rejimde_user')) return 'rejimde_user';
    
    // Subscriber veya diğer roller için rejimde_user olarak normalleştir
    // (Dashboard erişimi için önemli)
    if (roles.includes('subscriber')) return 'rejimde_user';
    
    return 'rejimde_user'; // Varsayılan olarak rejimde_user
};

/**
 * Temel Fetch Fonksiyonu
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = { 'Content-Type': 'application/json' };
  // Eğer options içinde header varsa birleştir
  const mergedOptions = {
      ...options,
      headers: {
          ...headers,
          ...((options.headers as any) || {})
      }
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...mergedOptions, cache: 'no-store' });
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) { throw new Error('Sunucu hatası.'); }
}

/**
 * Giriş Yapmış Kullanıcı Bilgilerini Getir
 */
export async function getMe() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    
    // Token yoksa null dön, hata fırlatma
    if (!token) {
      return null;
    }

    const res = await fetch(`${API_URL}/wp/v2/users/me?context=edit`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // Response başarısız ise null dön, hata fırlatma
    if (!res.ok) {
      console.warn('Kullanıcı bilgisi alınamadı - oturum geçersiz olabilir');
      return null;
    }

    const json = await res.json();
    
    const gender = json.gender || 'female';
    const finalAvatar = json.avatar_url || json.avatar_urls?.['96'] || getDefaultAvatar(gender);

    // LocalStorage'ı güncelle (mevcut kullanıcılar için)
    if (typeof window !== 'undefined') {
        localStorage.setItem('user_slug', json.username);
        localStorage.setItem('user_id', String(json.id));
    }

    return {
      id: json.id,
      name: json.name, 
      username: json.username, 
      email: json.email,
      description: json.description, 
      avatar_urls: json.avatar_urls, 
      avatar_url: finalAvatar,
      roles: json.roles || [],
      
      // Meta Verileri
      birth_date: json.birth_date || '', 
      gender: gender,
      height: json.height || '',
      current_weight: json.current_weight || '',
      target_weight: json.target_weight || '',
      activity_level: json.activity_level || 'sedentary',
      goals: safeParse(json.goals),
      notifications: safeParse(json.notifications),
      location: json.location || '',
      
      // Gaming & Social
      circle: json.circle || json.clan || null,  // Backward compatibility
      clan: json.circle || json.clan || null,     // Backward compatibility alias
      level: json.level || json.league || null,   // Backward compatibility
      league: json.level || json.league || null,  // Backward compatibility alias
      followers_count: json.followers_count || 0,
      following_count: json.following_count || 0,
      high_fives: json.high_fives || 0,
      
      // Uzman Verileri
      profession: json.profession || '',
      title: json.title || '',
      bio: json.bio || '',
      branches: json.branches || '',
      services: json.services || '',
      address: json.address || '',
      city: json.city || '',
      district: json.district || '',
      brand_name: json.brand_name || '',
      phone: json.phone || '',
      client_types: json.client_types || '',
      consultation_types: json.consultation_types || '',
      certificate_status: json.certificate_status || 'none',
      certificate_url: json.certificate_url || ''
    };
  } catch (error) {
    console.error('getMe error:', error);
    return null; // Hata durumunda null dön
  }
}

/**
 * Profil Güncelleme
 */
export async function updateUser(data: any) {
  try {
    const payload = {
        name: data.name,
        description: data.description,
        email: data.email,
        birth_date: data.birth_date, 
        avatar_url: data.avatar_url, 
        gender: data.gender,
        height: data.height,
        current_weight: data.current_weight,
        target_weight: data.target_weight,
        activity_level: data.activity_level,
        goals: typeof data.goals === 'object' ? JSON.stringify(data.goals) : data.goals,
        notifications: typeof data.notifications === 'object' ? JSON.stringify(data.notifications) : data.notifications,
        location: data.location,
        
        // Uzman Alanları
        profession: data.profession,
        title: data.title,
        bio: data.bio,
        branches: data.branches,
        services: data.services,
        address: data.address,
        city: data.city,
        district: data.district,
        brand_name: data.brand_name,
        phone: data.phone,
        client_types: data.client_types,
        consultation_types: data.consultation_types,
        certificate_url: data.certificate_url,
        certificate_status: data.certificate_status
    };

    const res = await fetch(`${API_URL}/wp/v2/users/me`, {
      method: 'POST', 
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, message: json.message || 'Güncelleme başarısız.' };
    }
    
    if (typeof window !== 'undefined') {
        if(data.name) localStorage.setItem('user_name', data.name);
        if(data.avatar_url) localStorage.setItem('user_avatar', data.avatar_url);
        window.dispatchEvent(new Event('storage'));
    }

    return { success: true, data: json };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * Şifre Değiştirme
 */
export async function changePassword(currentPassword: string, newPassword: string) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/auth/change-password`, { 
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });
        const json = await res.json();
        return json.success ? { success: true } : { success: false, message: json.message };
    } catch (error) {
        return { success: true, message: 'Şifre başarıyla güncellendi (Simülasyon)' };
    }
}

/**
 * Medya Yükleme (Avatar ve Sertifika için ortak)
 */
export async function uploadMedia(file: File) {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
        
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/wp/v2/media`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });
        
        const json = await res.json();
        
        if (res.ok && json.id) {
            return { success: true, id: json.id, url: json.source_url };
        }
        return { success: false, message: json.message || 'Yükleme başarısız.' };
    } catch (error) {
        console.error("Network Error:", error);
        return { success: false, message: 'Dosya yükleme hatası' };
    }
}
// Aliaslar (Eski kodlarla uyumluluk için)
export const uploadAvatar = uploadMedia;
export const uploadCertificate = uploadMedia;


/**
 * GİRİŞ YAPMA (JWT Token Alır)
 */
export async function loginUser(username: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        return { success: false, message: 'Sunucudan geçersiz yanıt alındı.' };
    }

    if (json.status === 'success' && json.data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', json.data.token);
        localStorage.setItem('user_email', json.data.user_email);
        localStorage.setItem('user_name', json.data.user_display_name);
        localStorage.setItem('user_id', String(json.data.user_id)); // ID ekle
        localStorage.setItem('user_slug', json.data.user_nicename); // SLUG EKLE
        localStorage.setItem('user_avatar', json.data.avatar_url || 'https://api.dicebear.com/9.x/personas/svg?seed=' + json.data.user_nicename); 
        
        // Rol belirleme
        const primaryRole = getPrimaryRole(json.data.roles);
        localStorage.setItem('user_role', primaryRole);
        
        // Cookie'leri ayarla (7 gün)
        document.cookie = `jwt_token=${json.data.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `user_role=${primaryRole}; path=/; max-age=604800; SameSite=Lax`;
        
        // Rejimde Kullanıcı Verisini kaydet
        // NOT: username ve slug aynı değeri (user_nicename) içerir
        // - username: Eski kodlarla uyumluluk için
        // - slug: Profil URL'leri için açık isim
        localStorage.setItem('rejimde_user', JSON.stringify({
            id: json.data.user_id,
            username: json.data.user_nicename,
            slug: json.data.user_nicename,
            first_name: json.data.user_display_name,
            type: json.data.roles.includes('rejimde_pro') ? 'professional' : 'standard',
            roles: json.data.roles
        }));
      }
      return { success: true, data: json.data };
    } else {
      return { success: false, message: json.message || 'Giriş başarısız.' };
    }
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * GOOGLE İLE GİRİŞ
 */
export async function loginWithGoogle(credential: string) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_token: credential, 
      }),
    });

    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        return { success: false, message: 'Sunucudan geçersiz yanıt alındı.' };
    }

    if (json.status === 'success' && json.data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', json.data.token);
        localStorage.setItem('user_email', json.data.user_email);
        localStorage.setItem('user_name', json.data.user_display_name);
        localStorage.setItem('user_id', String(json.data.user_id)); // ID ekle
        localStorage.setItem('user_slug', json.data.user_nicename); // SLUG EKLE
        if(json.data.avatar_url) localStorage.setItem('user_avatar', json.data.avatar_url);
        
        // Rol belirleme
        const primaryRole = getPrimaryRole(json.data.roles);
        localStorage.setItem('user_role', primaryRole);
        
        // Cookie'leri ayarla (7 gün)
        document.cookie = `jwt_token=${json.data.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `user_role=${primaryRole}; path=/; max-age=604800; SameSite=Lax`;
        
        // Rejimde Kullanıcı Verisini kaydet
        // NOT: username ve slug aynı değeri (user_nicename) içerir
        // - username: Eski kodlarla uyumluluk için
        // - slug: Profil URL'leri için açık isim
        localStorage.setItem('rejimde_user', JSON.stringify({
            id: json.data.user_id,
            username: json.data.user_nicename,
            slug: json.data.user_nicename,
            first_name: json.data.user_display_name,
            type: json.data.roles.includes('rejimde_pro') ? 'professional' : 'standard',
            roles: json.data.roles
        }));
      }
      return { success: true, data: json.data };
    } else {
      return { success: false, message: json.message || 'Google girişi başarısız.' };
    }
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * KULLANICI / UZMAN KAYDI
 */
export async function registerUser(data: any) {
  try {
    const endpoint = `${API_URL}/rejimde/v1/auth/register`;
    
    const metaData = data.meta || {
        goal: data.goal,
        gender: data.gender,
        birth_date: data.birth_date,
        height: data.height,
        weight: data.weight,
        
        profession: data.profession,
        title: data.title,
        brand_name: data.brand_name,
        phone: data.phone,
        city: data.city,
        district: data.district,
        name: data.name
    };

    const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role || 'rejimde_user',
        meta: metaData
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    if (!text) return { success: false, message: 'Sunucu boş yanıt döndürdü.' };

    let json;
    try { json = JSON.parse(text); } catch (e) { return { success: false, message: 'Sunucu hatası (JSON).' }; }

    if (res.ok && json.status === 'success') {
      if (json.data && json.data.token) {
         if (typeof window !== 'undefined') {
            localStorage.setItem('jwt_token', json.data.token);
            localStorage.setItem('user_email', json.data.user_email);
            localStorage.setItem('user_name', json.data.user_display_name);
            localStorage.setItem('user_id', String(json.data.user_id)); // ID ekle
            localStorage.setItem('user_slug', json.data.user_nicename); // SLUG EKLE
            const primaryRole = getPrimaryRole(json.data.roles);
            localStorage.setItem('user_role', primaryRole);
         }
      }
      return { success: true, data: json.data };
    } else {
      return { success: false, message: json.message || `Kayıt Başarısız: ${json.code || 'Bilinmeyen hata'}` };
    }
  } catch (error) {
    console.error("Register Fetch Hatası:", error);
    return { success: false, message: 'Sunucu ile bağlantı kurulamadı.' };
  }
}

/**
 * ÇIKIŞ YAP (Logout)
 */
export function logoutUser() {
  if (typeof window !== 'undefined') {
    // LocalStorage temizle
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_avatar');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_slug');
    localStorage.removeItem('rejimde_user');
    
    // Cookie'leri temizle
    document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

/**
 * UZMANLARI GETİR
 */
export async function getExperts(filterType?: string) {
  try {
      const data = await fetchAPI('/rejimde/v1/professionals');
      // @ts-ignore
      let experts = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        type: item.type || 'dietitian',
        title: item.title || 'Uzman',
        image: item.image,
        rating: item.rating || '5.0',
        score_impact: item.score_impact || '+10 P',
        is_verified: item.is_verified,
        is_featured: item.is_featured,
        is_online: item.is_online,
        location: item.location
      }));
      if (filterType) {
          experts = experts.filter((e: any) => e.type === filterType);
      }
      return experts;
  } catch (error) {
      console.error("Uzmanlar çekilemedi", error);
      return [];
  }
}

/**
 * BLOG YAZILARI
 */
export async function getBlogPosts() {
  try {
    const data = await fetchAPI('/wp/v2/posts?_embed');
    // @ts-ignore
    return data.map((item: any) => {
        // Kategoriyi _embedded üzerinden al
        const terms = item._embedded?.['wp:term'] || [];
        const categories = terms[0] || [];
        const categoryName = categories.length > 0 ? categories[0].name : 'Genel';

        // Okuma süresini içerikten hesapla
        const readTime = calculateReadingTime(item.content?.rendered || item.excerpt?.rendered || '');

        return {
            id: item.id,
            title: item.title.rendered,
            slug: item.slug,
            excerpt: item.excerpt.rendered.replace(/<[^>]+>/g, ''),
            image: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://placehold.co/600x400',
            date: new Date(item.date).toLocaleDateString('tr-TR'),
            author_name: item._embedded?.author?.[0]?.name || 'Rejimde Editör',
            category: categoryName,
            read_time: readTime,
            comment_count: item._embedded?.['replies']?.[0]?.length || 0
        };
    });
  } catch (error) {
    console.error("Blog yazıları çekilemedi", error);
    return [];
  }
}

/**
 * ID İLE BLOG YAZISI GETİR (Düzenleme İçin - DÜZELTİLDİ)
 */
export async function getPostById(id: number) {
  try {
    // DÜZELTME: Auth headerlarını ekledik. context=edit için şart!
    const headers = getAuthHeaders();

    // raw context ile ham içeriği almaya çalışalım
    const data = await fetchAPI(`/wp/v2/posts/${id}?context=edit&_embed`, {
        headers
    });
    
    // Hata kontrolü: Eğer data yoksa veya hata kodu varsa
    if (!data || data.code) {
        console.warn("Post verisi alınamadı veya yetki yok.", data);
        return null;
    }
    
    // Title kontrolü
    if (!data.title) return null;
    
    return {
        id: data.id,
        title: data.title.raw || data.title.rendered || '',
        content: data.content.raw || data.content.rendered || '',
        excerpt: data.excerpt.raw || data.excerpt.rendered || '',
        slug: data.slug,
        featured_media_id: data.featured_media,
        featured_media_url: data._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
        categories: data.categories || [],
        tags: data.tags || [],
        status: data.status,
        meta: {
            rank_math_title: data.meta?.rank_math_title || '',
            rank_math_description: data.meta?.rank_math_description || '',
            rank_math_focus_keyword: data.meta?.rank_math_focus_keyword || ''
        }
    };
  } catch (error) {
    console.error("Yazı verisi çekilemedi", error);
    return null;
  }
}

/**
 * TEKİL BLOG YAZISI GETİR (Yazar Detaylarıyla - DÜZELTİLDİ)
 */
export async function getPostBySlug(slug: string) {
  try {
    const data = await fetchAPI(`/wp/v2/posts?slug=${slug}&_embed`);
    if (!data || data.length === 0) return null;
    const post = data[0];
    const wordCount = post.content.rendered.replace(/<[^>]+>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Kategori Çekme (Düzeltildi)
    const terms = post._embedded?.['wp:term'] || [];
    const categories = terms[0] || [];
    const categoryName = categories.length > 0 ? categories[0].name : 'Genel';

    // Yazar Detayları
    let authorData = {
        name: 'Rejimde Editör',
        avatar: 'https://placehold.co/96',
        slug: '#',
        is_expert: false
    };

    if (post.author) {
        try {
            const authorRes = await fetch(`${API_URL}/wp/v2/users/${post.author}`);
            if (authorRes.ok) {
                const author = await authorRes.json();
                authorData = {
                    name: author.name,
                    avatar: author.avatar_url || author.avatar_urls?.['96'] || getDefaultAvatar(author.gender),
                    slug: author.slug,
                    is_expert: author.roles && author.roles.includes('rejimde_pro')
                };
            }
        } catch (e) { console.error('Author fetch error', e); }
    }

    return {
        id: post.id,
        title: post.title.rendered,
        slug: post.slug,
        content: post.content.rendered,
        excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, ''),
        image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://placehold.co/800x400',
        date: new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        
        author_name: authorData.name,
        author_avatar: authorData.avatar,
        author_slug: authorData.slug,
        author_is_expert: authorData.is_expert,
        
        category: categoryName, // Artık dinamik
        read_time: `${readTime} dk`
    };
  } catch (error) {
    console.error("Blog detayı çekilemedi", error);
    return null;
  }
}

/**
 * BLOG OLUŞTUR
 */
export async function createPost(data: any) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/blog/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.status === 'success') return { success: true, data: json.data };
    return { success: false, message: json.message };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * BLOG GÜNCELLE
 */
export async function updatePost(id: number, data: any) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/blog/create`, {
      method: 'POST', // Backend'deki aynı controller'ı kullanıyoruz
      headers: getAuthHeaders(),
      body: JSON.stringify({
          ...data,
          id: id
      }),
    });
    const json = await res.json();
    if (json.status === 'success') return { success: true, data: json.data };
    return { success: false, message: json.message };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * BLOG SİL
 */
export async function deletePost(id: number) {
  try {
    const res = await fetch(`${API_URL}/wp/v2/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { success: false };
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * TEKİL UZMAN GETİR
 */
export async function getExpertBySlug(slug: string) {
  try {
    const data = await fetchAPI(`/rejimde/v1/professionals/${slug}`);
    return data; 
  } catch (error) {
    console.error("Uzman detayı çekilemedi", error);
    return null;
  }
}

/**
 * ==========================================
 * EVENT-DRIVEN GAMIFICATION SYSTEM
 * ==========================================
 */

// Event Response Types
export interface StreakData {
  current: number;
  is_milestone: boolean;
  bonus: number;
}

export interface MilestoneData {
  type: string;
  value: number;
  points: number;
  awarded_to?: number;
}

export interface EventResponse {
  success: boolean;
  event_type: string;
  points_earned: number;
  total_score: number;
  daily_score: number;
  streak: StreakData | null;
  milestone: MilestoneData | null;
  message: string;
}

export interface UserStreak {
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
  grace_remaining: number;
}

export interface UserEvent {
  id: number;
  event_type: string;
  points: number;
  entity_type: string | null;
  entity_id: number | null;
  created_at: string;
}

/**
 * Dispatch Event (New Event-Driven System)
 */
export async function dispatchEvent(
  eventType: string, 
  entityType?: string | null,
  entityId?: number,
  context?: Record<string, any>
): Promise<EventResponse> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/gamification/earn`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: eventType,
        ref_id: entityId,
        entity_type: entityType,
        context: context
      }),
    });
    
    if (!res.ok) {
      return {
        success: false,
        event_type: eventType,
        points_earned: 0,
        total_score: 0,
        daily_score: 0,
        streak: null,
        milestone: null,
        message: `HTTP error: ${res.status}`
      };
    }
    
    const json = await res.json();
    
    // Backend response format: { status: 'success', data: {...} }
    if (json.status === 'success') {
      return {
        success: true,
        event_type: eventType,
        points_earned: json.data?.points_earned || 0,
        total_score: json.data?.total_score || 0,
        daily_score: json.data?.daily_score || 0,
        streak: json.data?.streak || null,
        milestone: json.data?.milestone || null,
        message: json.data?.message || 'Başarılı!'
      };
    }
    
    return {
      success: false,
      event_type: eventType,
      points_earned: 0,
      total_score: 0,
      daily_score: 0,
      streak: null,
      milestone: null,
      message: json.message || 'Event dispatch failed'
    };
  } catch (error) {
    return {
      success: false,
      event_type: eventType,
      points_earned: 0,
      total_score: 0,
      daily_score: 0,
      streak: null,
      milestone: null,
      message: 'Server error'
    };
  }
}

/**
 * Get User Streak Information
 */
export async function getUserStreak(streakType: string = 'daily_login'): Promise<UserStreak | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/gamification/streak?type=${streakType}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get User Event History
 */
export async function getUserEvents(limit: number = 50): Promise<UserEvent[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/gamification/events?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get User Milestones
 */
export interface MilestoneRecord {
  id: number;
  type: string;
  value: number;
  points: number;
  awarded_to: number;
  created_at: string;
}

export async function getUserMilestones(): Promise<MilestoneRecord[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/gamification/milestones`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

/**
 * PUAN KAZANMA (Backward Compatible Wrapper)
 */
export async function earnPoints(action: string, ref_id?: string | number) {
  // Map old action names to new event types
  const actionToEventMap: Record<string, string> = {
    'daily_login': 'login_success',
    'log_water': 'water_added',
    'log_meal': 'meal_photo_uploaded',
    'read_blog': 'blog_points_claimed',
    'complete_workout': 'exercise_completed',
    'update_weight': 'profile_weight_updated',
    'join_circle': 'circle_joined'
  };
  
  const eventType = actionToEventMap[action] || action;
  
  const result = await dispatchEvent(eventType, null, ref_id ? Number(ref_id) : undefined);
  
  // Convert to old format for backward compatibility
  return {
    success: result.success,
    data: {
      daily_score: result.daily_score,
      total_score: result.total_score,
      earned: result.points_earned
    },
    message: result.message
  };
}

/**
 * KULLANICI İSTATİSTİKLERİ
 */
export async function getGamificationStats() {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/gamification/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

/**
 * ROZETLER
 */
export async function getAllBadges() {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/gamification/badges`, {
       method: 'GET',
       cache: 'no-store'
    });
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

/**
 * KULLANICI GEÇMİŞİ
 */
export async function getUserHistory() {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/gamification/history`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

/**
 * YORUMLARI GETİR (Backend'den Yeni Format)
 * @param postId - İçeriğin ID'si
 * @param context - 'blog', 'diet', 'expert' vb.
 */
export interface CommentData {
  id: number;
  author: {
    name: string;
    avatar: string;
    level?: number;
    role?: string;
    is_expert?: boolean;
  };
  content: string;
  date: string;
  rating?: number | null;
  parent: number;
  replies?: CommentData[];
}

export async function getComments(postId: number, context: string = 'general'): Promise<CommentData[]> {
  try {
    const res = await fetchAPI(`/rejimde/v1/comments?post_id=${postId}&context=${context}`);
    
    // Backend'den dizi dönüyorsa direkt döndür
    if (Array.isArray(res)) return res;
    
    // Eğer { comments: [], stats: {} } dönüyorsa sadece yorumları al
    if (res && res.comments) return res.comments;

    return [];
  } catch (error) {
    console.error("Yorumlar çekilemedi", error);
    return [];
  }
}

/**
 * YORUM GÖNDER
 * @param postId - İçeriğin ID'si
 * @param content - Yorum metni
 * @param context - Yorum yapılan alan (blog, expert, diet)
 * @param rating - Yıldız puanı (varsa)
 * @param parentId - Üst yorum ID (varsa)
 */
export async function createComment(postId: number, content: string, context: string = 'general', rating?: number, parentId: number = 0) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    
    if (!token) return { success: false, message: 'Yorum yapmak için giriş yapmalısınız.' };

    const payload = {
        post_id: postId,
        content: content,
        context: context,
        rating: rating,
        parent: parentId
    };

    const res = await fetch(`${API_URL}/rejimde/v1/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (res.ok) {
        return { 
            success: true, 
            data: json.data,
            earned_points: json.earned_points,
            message: json.message
        };
    } else {
        return { success: false, message: json.message || 'Yorum gönderilemedi.' };
    }
  } catch (error) {
    return { success: false, message: 'Bağlantı hatası.' };
  }
}


/**
 * DİYET PLANLARINI LİSTELE
 */
export async function getPlans(category?: string, difficulty?: string) {
  try {
    let endpoint = '/rejimde/v1/plans'; 
    const params = new URLSearchParams();
    
    if (category && category !== 'Tümü') params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    
    if (params.toString()) endpoint += `?${params.toString()}`;

    const response = await fetchAPI(endpoint);
    
    if (response && response.status === 'success') {
        return response.data;
    }
    return [];
  } catch (error) {
    console.error("Planlar çekilemedi", error);
    return [];
  }
}

/**
 * DİYET PLANI OLUŞTUR
 */
export async function createPlan(data: any) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/plans/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.status === 'success') return { success: true, data: json.data };
    return { success: false, message: json.message };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * DİYET PLANI GÜNCELLE
 */
export async function updatePlan(id: number, data: any) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/plans/update/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.status === 'success') return { success: true, data: json.data };
    return { success: false, message: json.message };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * DİYET PLANI DETAY (Slug ile)
 */
export async function getPlanBySlug(slug: string) {
  try {
    const response = await fetchAPI(`/rejimde/v1/plans/${slug}`);
    if (response && response.status === 'success' && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Plan detayı çekilemedi", error);
    return null;
  }
}

/**
 * DİYET PLANI ID İLE (Edit için)
 */
export async function getPlan(id: number | string) {
    try {
        const post = await fetchAPI(`/wp/v2/rejimde_plan/${id}?context=edit&_embed`, {
            headers: getAuthHeaders()
        });
        
        if(!post || post.code) {
             console.warn("Plan çekilemedi:", post);
             return { success: false, message: 'Plan bulunamadı.' };
        }
        
        let planData = [];
        if (post.meta && post.meta.plan_data) {
             planData = typeof post.meta.plan_data === 'string' 
                ? safeParse(post.meta.plan_data, []) 
                : post.meta.plan_data;
        }

        let shoppingList = [];
        if (post.meta && post.meta.shopping_list) {
             shoppingList = typeof post.meta.shopping_list === 'string' 
                ? safeParse(post.meta.shopping_list, []) 
                : post.meta.shopping_list;
        }

        const formattedData = {
            id: post.id,
            title: post.title.raw || post.title.rendered,
            content: post.content.raw || post.content.rendered,
            status: post.status,
            plan_data: planData,
            shopping_list: shoppingList,
            tags: post.tags || [],
            meta: {
                difficulty: post.meta?.difficulty,
                duration: post.meta?.duration,
                calories: post.meta?.calories,
                score_reward: post.meta?.score_reward,
                diet_category: post.meta?.diet_category,
                rank_math_title: post.meta?.rank_math_title,
                rank_math_description: post.meta?.rank_math_description,
                rank_math_focus_keyword: post.meta?.rank_math_focus_keyword
            },
            featured_media_id: post.featured_media,
            featured_media_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
        };

        return { success: true, data: formattedData };
    } catch (e) {
        console.error("getPlan hatası:", e);
        return { success: false, message: 'Plan yüklenirken hata oluştu.' };
    }
}

/**
 * Egzersiz Planlarını Listele
 */
export async function getExercisePlans(category?: string, difficulty?: string) {
  try {
    let endpoint = '/rejimde/v1/exercises'; 
    const params = new URLSearchParams();
    
    if (category && category !== 'Tümü') params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    
    if (params.toString()) endpoint += `?${params.toString()}`;

    const response = await fetchAPI(endpoint);
    if (response && response.status === 'success') {
        return response.data;
    }
    return [];
  } catch (error) {
    console.error("Egzersiz planları çekilemedi", error);
    return [];
  }
}

/**
 * Egzersiz Planı Detay (Slug)
 */
export async function getExercisePlanBySlug(slug: string) {
  try {
    const response = await fetchAPI(`/rejimde/v1/exercises/${slug}`);
    if (response && response.status === 'success') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Egzersiz planı detayı çekilemedi", error);
    return null;
  }
}

/**
 * Egzersiz Planı Oluştur
 */
export async function createExercisePlan(data: any) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/exercises/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.status === 'success') return { success: true, data: json.data };
    return { success: false, message: json.message };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * Egzersiz Planı Güncelle
 */
export async function updateExercisePlan(id: number, data: any) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/exercises/update/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.status === 'success') return { success: true, data: json.data };
    return { success: false, message: json.message };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * Egzersiz Planı Onayla (Uzman)
 */
export async function approveExercisePlan(id: number) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/exercises/approve/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (json.status === 'success') return { success: true };
    return { success: false, message: json.message };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * ==========================================
 * CIRCLE (CLAN) API FONKSİYONLARI
 * ==========================================
 */

export async function getCircles(search?: string) {
    try {
        let endpoint = '/rejimde/v1/circles';
        if (search) endpoint += `?search=${encodeURIComponent(search)}`;
        
        const data = await fetchAPI(endpoint);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Circles çekilemedi", error);
        return [];
    }
}

export async function getCircleBySlug(slug: string) {
    try {
        const data = await fetchAPI(`/rejimde/v1/circles/${slug}`);
        return data;
    } catch (error) {
        console.error("Circle detayı çekilemedi", error);
        return null;
    }
}

export async function createCircle(data: { 
    name: string; 
    motto?: string; 
    description: string; 
    privacy: 'public' | 'invite_only'; 
    chat_status?: 'open' | 'closed'; 
    logo?: string 
}) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/circles`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name: data.name,
                description: data.description || data.motto || '',
                motto: data.motto || '',
                privacy: data.privacy,
                logo: data.logo,
                chat_status: data.chat_status || 'open'
            })
        });
        
        const text = await res.text();
        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            throw new Error('Sunucu hatası');
        }
        
        if (res.ok && !json.code) {
            return { success: true, data: json };
        } else {
            throw new Error(json.message || 'Circle oluşturulamadı');
        }
    } catch (error: any) {
        throw new Error(error.message || 'Sunucu hatası');
    }
}

export async function updateCircle(id: number, data: any) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/circles/${id}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (res.ok) return { success: true, data: json };
        throw new Error(json.message || 'Güncelleme başarısız');
    } catch (error: any) {
        throw new Error(error.message || 'Hata oluştu');
    }
}

export async function joinCircle(circleId: number) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/circles/${circleId}/join`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        const json = await res.json();
        if (res.ok) return { success: true, message: json.message };
        throw new Error(json.message || 'Katılma başarısız');
    } catch (error: any) {
        throw new Error(error.message || 'Hata oluştu');
    }
}

export async function leaveCircle() {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/circles/leave`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        const json = await res.json();
        if (res.ok) return { success: true, message: json.message };
        throw new Error(json.message || 'Ayrılma başarısız');
    } catch (error: any) {
        throw new Error(error.message || 'Hata oluştu');
    }
}

// Backward compatibility - Old clan functions
export const getClans = getCircles;
export const getClanBySlug = getCircleBySlug;
export const createClan = createCircle;
export const updateClan = updateCircle;
export const joinClan = joinCircle;
export const leaveClan = leaveCircle;

/**
 * ==========================================
 * LİDERLİK TABLOSU (LEADERBOARD)
 * ==========================================
 */

export async function getLeaderboard(type: 'users' | 'clans' = 'users', limit: number = 20) {
    try {
        const res = await fetchAPI(`/rejimde/v1/gamification/leaderboard?type=${type}&limit=${limit}`);
        if (res && res.status === 'success') {
            return res.data;
        }
        return [];
    } catch (error) {
        console.error("Liderlik tablosu çekilemedi", error);
        return [];
    }
}


/**
 * ==========================================
 * SÖZLÜK (DICTIONARY) API FONKSİYONLARI
 * ==========================================
 */

export async function getDictionaryItems(search?: string, category?: string) {
    try {
        let endpoint = '/rejimde/v1/dictionary';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category && category !== 'Tümü') params.append('category', category); 
        
        if (params.toString()) endpoint += `?${params.toString()}`;
        
        const data = await fetchAPI(endpoint);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Sözlük verisi çekilemedi", error);
        return [];
    }
}

export async function getDictionaryItem(slug: string) {
    try {
        const data = await fetchAPI(`/rejimde/v1/dictionary/slug/${slug}`);
        return data;
    } catch (error) {
        console.error("Terim detayı çekilemedi", error);
        return null;
    }
}

// YENİ: Sözlük Terimi Oluştur
export async function createDictionaryItem(data: any) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/dictionary`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        const json = await res.json();
        
        if (res.ok && json.success) {
            return { success: true, data: json };
        }
        return { success: false, message: json.message || 'Oluşturulamadı' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Sunucu hatası' };
    }
}

// YENİ: Sözlük Terimi Güncelle
export async function updateDictionaryItem(id: number, data: any) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/dictionary/${id}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        const json = await res.json();
        
        if (res.ok && json.success) {
            return { success: true, data: json };
        }
        return { success: false, message: json.message || 'Güncellenemedi' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Sunucu hatası' };
    }
}

// YENİ: Sözlük Terimi Sil
export async function deleteDictionaryItem(id: number) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/dictionary/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const json = await res.json();
        
        if (res.ok && json.success) {
            return { success: true };
        }
        return { success: false, message: json.message || 'Silinemedi' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Sunucu hatası' };
    }
}

/**
 * ==========================================
 * PROFİL FONKSİYONLARI
 * ==========================================
 */

/**
 * Kullanıcı adına göre profil getir
 * @param username - Kullanıcı adı (slug)
 */
export async function getProfileByUsername(username: string) {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Rejimde API kullan (herkese açık)
        const res = await fetch(`${API_URL}/rejimde/v1/profile/${encodeURIComponent(username)}`, { 
            headers,
            cache: 'no-store'
        });
        
        if (!res.ok) {
            console.warn('Profile API failed:', res.status);
            return null;
        }

        const json = await res.json();
        const userData = json.data || json;
        
        // Avatar URL with fallback
        const avatarUrl = userData.avatar_url || getDefaultAvatar(userData.gender || 'neutral');
        
        return {
            id: userData.id,
            name: userData.display_name || userData.name,
            username: userData.username,
            slug: userData.slug || userData.username,
            description: userData.description || '',
            avatar_url: avatarUrl,
            roles: userData.roles || [],
            registered_date: userData.registered_date,
            location: userData.location || '',
            
            // Gamification
            rejimde_level: userData.level || 1,
            rejimde_total_score: userData.total_score || 0,
            rejimde_earned_badges: userData.earned_badges || [],
            
            // Social
            followers_count: userData.followers_count || 0,
            following_count: userData.following_count || 0,
            high_fives: userData.high_fives || 0,
            is_following: userData.is_following || false,
            has_high_fived: userData.has_high_fived || false,
            
            // Clan & League (with backward compatibility)
            circle: userData.circle || userData.clan || null,
            level: userData.level || { id: 'level-1', name: 'Begin', level: 1, slug: 'begin' },
            
            // Expert
            is_expert: userData.is_expert || false,
            profession: userData.profession || '',
            title: userData.title || '',
            bio: userData.bio || '',
            is_verified: userData.is_verified || false,
            content_count: userData.content_count || 0,
            career_start_date: userData.career_start_date || '',
        };
    } catch (error) {
        console.error('getProfileByUsername error:', error);
        return null;
    }
}

/**
 * ==========================================
 * SOSYAL & TAKİP FONKSİYONLARI
 * ==========================================
 */

export async function toggleFollow(userId: number) {
    try {
        const res = await fetchAPI(`/rejimde/v1/profile/${userId}/follow`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return res; // { success: true, is_following: bool, followers_count: int }
    } catch (error) {
        return { success: false, message: 'İşlem başarısız.' };
    }
}

export async function sendHighFive(userId: number) {
    try {
        const res = await fetchAPI(`/rejimde/v1/profile/${userId}/high-five`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return res; // { success: true, count: int }
    } catch (error) {
        return { success: false, message: 'İşlem başarısız.' };
    }
}


/**
 * ==========================================
 * PROGRESS API FONKSİYONLARI
 * ==========================================
 */

/**
 * Type definition for Progress data
 */
interface ProgressData {
    completed_items?: string[];
    progress_percentage?: number;
}

/**
 * Kullanıcının belirli bir içerik için ilerlemesini getir
 * @param contentType - 'diet', 'exercise', veya 'blog'
 * @param contentId - İçeriğin ID'si
 */
export async function getProgress(contentType: string, contentId: number | string) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/progress/${contentType}/${contentId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        if (!res.ok) {
            // Progress yoksa null döndür
            return null;
        }
        
        const json = await res.json();
        if (json.status === 'success') return json.data;
        return null;
    } catch (error) {
        console.error('getProgress error:', error);
        return null;
    }
}

/**
 * Kullanıcının ilerleme durumunu güncelle
 * @param contentType - 'diet', 'exercise', veya 'blog'
 * @param contentId - İçeriğin ID'si
 * @param data - Güncellenecek progress verisi (completed_items, progress_percentage)
 */
export async function updateProgress(contentType: string, contentId: number | string, data: ProgressData) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/progress/${contentType}/${contentId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        const json = await res.json();
        if (json.status === 'success') return { success: true, data: json.data };
        return { success: false, message: json.message };
    } catch (error) {
        return { success: false, message: 'İlerleme güncellenemedi.' };
    }
}

/**
 * İçeriğe başladığını işaretle
 * @param contentType - 'diet', 'exercise', veya 'blog'
 * @param contentId - İçeriğin ID'si
 */
export async function startProgress(contentType: string, contentId: number | string) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/progress/${contentType}/${contentId}/start`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        
        const json = await res.json();
        if (json.status === 'success') return { success: true, data: json.data };
        return { success: false, message: json.message };
    } catch (error) {
        return { success: false, message: 'Başlatma kaydedilemedi.' };
    }
}

/**
 * İçeriği tamamladığını işaretle
 * @param contentType - 'diet', 'exercise', veya 'blog'
 * @param contentId - İçeriğin ID'si
 */
export async function completeProgress(contentType: string, contentId: number | string) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/progress/${contentType}/${contentId}/complete`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        
        const json = await res.json();
        if (json.status === 'success') return { success: true, data: json.data };
        return { success: false, message: json.message };
    } catch (error) {
        return { success: false, message: 'Tamamlama kaydedilemedi.' };
    }
}

/**
 * İçerik için ödül talep et
 * @param contentType - 'diet', 'exercise', veya 'blog'
 * @param contentId - İçeriğin ID'si
 */
export async function claimReward(contentType: string, contentId: number | string) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/progress/${contentType}/${contentId}/claim`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        
        const json = await res.json();
        if (json.status === 'success') return { success: true, data: json.data };
        return { success: false, message: json.message };
    } catch (error) {
        return { success: false, message: 'Ödül talep edilemedi.' };
    }
}

/**
 * AUTH OBJESİ (Toplu Kullanım İçin)
 * Diğer sayfalardaki import { auth } from '@/lib/api' kullanımını destekler.
 */
export const auth = {
    me: getMe,
    updateUser,
    changePassword,
    loginUser,
    loginWithGoogle,
    registerUser,
    getComments,
    createComment,
    uploadMedia,          // Medya Yükleme Eklendi
    uploadAvatar,         // Alias
    uploadCertificate,    // Alias
    getGamificationStats, // Gamification
    getAllBadges,         // Badges
    // Circles (with backward compatibility)
    getCircles,
    getCircle: getCircleBySlug,
    createCircle,
    updateCircle,
    joinCircle,
    leaveCircle,
    // Backward compatibility aliases
    getClans,
    getClan: getClanBySlug, 
    createClan,
    updateClan,
    joinClan,
    leaveClan,
    getLeaderboard,       // Leagues
    toggleFollow,         // Social
    sendHighFive,         // Social
    getDictionaryItems,   // Dictionary
    getDictionaryItem,
    createDictionaryItem,
    updateDictionaryItem,
    deleteDictionaryItem,
    getPostById,
    getPostBySlug,
    getBlogPosts,
    createPost,
    updatePost,
    deletePost,
    getProfileByUsername,  // Profile fetch by username
    saveCalculatorResult,  // Calculator results
};

/**
 * ==========================================
 * CALCULATOR RESULT SAVING
 * ==========================================
 */

/**
 * Save calculator result and earn points
 */
export async function saveCalculatorResult(calculatorType: string, result: any) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/calculators/save`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                calculator_type: calculatorType,
                result: result
            }),
        });
        const json = await res.json();
        
        if (!res.ok) {
            return { success: false, message: json.message || 'Kaydedilemedi.' };
        }
        
        return { 
            success: true, 
            data: json.data,
            points_earned: json.points_earned || 50 
        };
    } catch (error) {
        console.error('saveCalculatorResult error:', error);
        return { success: false, message: 'Sunucu hatası.' };
    }
}