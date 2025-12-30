export const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://api.rejimde.com/wp-json';

// Import types
import type { PlanListItem, PlanDetail, PlanEditData, BackendResponse, ApiResponse } from '@/types';

// Import helper functions
import { calculateReadingTime, translateDifficulty } from './helpers';

// --- TYPE GUARDS ---
/**
 * Type guard to check if response is a BackendResponse with success status
 */
function isSuccessBackendResponse<T>(response: any): response is BackendResponse<T> & { status: 'success'; data: T } {
  return response && response.status === 'success' && response.data !== undefined;
}

/**
 * Type guard to check if response has data property
 */
function hasDataProperty<T>(response: any): response is { data: T } {
  return response && response.data !== undefined && typeof response.data === 'object';
}

/**
 * Type guard to check if response is a valid plan object
 */
function isPlanObject(response: any): boolean {
  return response && typeof response === 'object' && 'id' in response && typeof response.id === 'number';
}

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
 * Tüm API çağrıları için merkezi hata yönetimi ve tutarlı yanıt formatı sağlar
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

  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...mergedOptions, cache: 'no-store' });
    
    // HTTP hata kodlarını kontrol et
    if (!res.ok) {
      console.warn(`API Error: ${res.status} ${res.statusText} - ${endpoint}`);
      // Hata yanıtını ayrıştırmaya çalış
      const text = await res.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          return errorData; // Backend hata formatını koru
        } catch (e) {
          // JSON parse edilemezse null dön
          return null;
        }
      }
      return null;
    }
    
    const text = await res.text();
    if (!text) return null;
    
    try { 
      return JSON.parse(text); 
    } catch (e) { 
      console.error('JSON parse error:', e, 'Response:', text.substring(0, 200));
      throw new Error('Sunucu hatası.'); 
    }
  } catch (error) {
    console.error('fetchAPI error:', endpoint, error);
    throw error;
  }
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
      certificate_url: json.certificate_url || '',
      
      // Kimlik & Profil (YENİ)
      motto: json.motto || '',
      
      // Lokasyon (country eksikti)
      country: json.country || 'TR',
      
      // Hizmet & Dil (YENİ)
      service_languages: safeParse(json.service_languages, ['tr']),
      
      // Mesleki Deneyim (YENİ)
      career_start_date: json.career_start_date || '',
      education: safeParse(json.education, []),
      certificates: safeParse(json.certificates, []),
      
      // Uzmanlık & Etiketler (YENİ)
      expertise_tags: safeParse(json.expertise_tags, []),
      goal_tags: safeParse(json.goal_tags, []),
      level_suitability: safeParse(json.level_suitability, []),
      age_groups: safeParse(json.age_groups, []),
      
      // Danışan Bilgileri (YENİ)
      client_type: json.client_type || '',
      
      // Çalışmadığı Durumlar (YENİ)
      excluded_cases: safeParse(json.excluded_cases, []),
      referral_note: json.referral_note || '',
      
      // Çalışma & İletişim (YENİ)
      working_hours: safeParse(json.working_hours, { weekday: '', weekend: '' }),
      response_time: json.response_time || '24h',
      communication_preference: safeParse(json.communication_preference, ['both']),
      
      // Görünürlük & Mahremiyet (YENİ)
      privacy_settings: safeParse(json.privacy_settings, {
        show_phone: false,
        show_address: false,
        show_location: true,
      }),
      kvkk_consent: Boolean(json.kvkk_consent),
      emergency_disclaimer: Boolean(json.emergency_disclaimer),
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
    const payload: any = {
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
        certificate_status: data.certificate_status,
        
        // Kimlik & Profil
        motto: data.motto,
        
        // Lokasyon (country eksikti)
        country: data.country,
        
        // Hizmet & Dil
        service_languages: data.service_languages,
        
        // Mesleki Deneyim
        career_start_date: data.career_start_date,
        education: data.education,
        certificates: data.certificates,
        
        // Uzmanlık & Etiketler
        expertise_tags: data.expertise_tags,
        goal_tags: data.goal_tags,
        level_suitability: data.level_suitability,
        age_groups: data.age_groups,
        
        // Danışan Bilgileri
        client_type: data.client_type,
        
        // Çalışmadığı Durumlar
        excluded_cases: data.excluded_cases,
        referral_note: data.referral_note,
        
        // Çalışma & İletişim
        working_hours: data.working_hours,
        response_time: data.response_time,
        communication_preference: data.communication_preference,
        
        // Görünürlük & Mahremiyet
        privacy_settings: data.privacy_settings,
        kvkk_consent: data.kvkk_consent,
        emergency_disclaimer: data.emergency_disclaimer,
    };

    // undefined değerleri temizle (sadece gönderilen alanları güncelle)
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

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
 * TEKİL BLOG YAZISI GETİR (Yazar Detaylarıyla + Okuyucular - GÜNCELLENDİ)
 */
export async function getPostBySlug(slug: string) {
  try {
    const data = await fetchAPI(`/wp/v2/posts? slug=${slug}&_embed`);
    if (!data || data.length === 0) return null;
    const post = data[0];
    const wordCount = post.content.rendered.replace(/<[^>]+>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Kategori Çekme
    const terms = post._embedded?.['wp:term'] || [];
    const categories = terms[0] || [];
    const categoryName = categories.length > 0 ?  categories[0].name : 'Genel';

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
                    avatar: author. avatar_url || author.avatar_urls?. ['96'] || getDefaultAvatar(author.gender),
                    slug: author.slug,
                    is_expert: author.roles && author.roles.includes('rejimde_pro')
                };
            }
        } catch (e) { 
            console.error('Author fetch error', e); 
        }
    }

    // Sticky kontrolü
    const isSticky = post. sticky || false;
    
    // Rejimde API'den ek verileri al (readers, is_sticky doğrulaması)
    let readers:  Array<{ id: number; name: string; avatar: string; slug: string }> = [];
    let readersCount = 0;
    
    try {
        const rejimdeRes = await fetch(`${API_URL}/rejimde/v1/blog/${slug}`, {
            cache: 'no-store'
        });
        if (rejimdeRes.ok) {
            const rejimdeJson = await rejimdeRes.json();
            const blogData = rejimdeJson.data || rejimdeJson;
            
            if (blogData.readers && Array.isArray(blogData.readers)) {
                readers = blogData.readers;
                readersCount = blogData.readers_count || blogData.readers.length;
            }
        }
    } catch (e) {
        console.error('Rejimde blog data fetch error:', e);
    }

    return {
        id: post.id,
        title: post.title. rendered,
        slug: post.slug,
        content: post.content.rendered,
        excerpt: post.excerpt.rendered. replace(/<[^>]+>/g, ''),
        image: post._embedded?.['wp:featuredmedia']?.[0]?. source_url || 'https://placehold.co/800x400',
        date: new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        
        author_name: authorData. name,
        author_avatar: authorData.avatar,
        author_slug: authorData.slug,
        author_is_expert: authorData. is_expert,
        
        category:  categoryName,
        read_time: `${readTime} dk`,
        
        // Sticky ve dinamik puan bilgileri
        is_sticky: isSticky,
        score_reward: isSticky ? 50 : 10,
        
        // Okuyucu bilgileri
        readers:  readers,
        readers_count: readersCount
    };
  } catch (error) {
    console. error("Blog detayı çekilemedi", error);
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
  already_earned?: boolean;
}

export interface UserStreak {
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
  grace_remaining: number;
}

/**
 * User Event Type
 * Basic event structure returned by gamification system
 * Used by getUserEvents()
 * See also: ActivityItem (extended version with context and label)
 */
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
        message: json.data?.message || 'Başarılı!',
        already_earned: json.data?.already_earned || false
      };
    }
    
    // 400 error but already earned situation
    if (res.status === 400 && json.message?.includes('already')) {
      return {
        success: true, // Not an error, already earned
        event_type: eventType,
        points_earned: 0,
        total_score: 0,
        daily_score: 0,
        streak: null,
        milestone: null,
        message: json.message || 'Already earned',
        already_earned: true
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
      message: json.message || 'Event dispatch failed',
      already_earned: false
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
      message: 'Server error',
      already_earned: false
    };
  }
}
// --- AI TİPLERİ ---
export interface GenerateDietParams {
  gender: string;
  age: string | number;
  height: string | number;
  weight: string | number;
  activity_level: string;
  goal: string;
  diet_type: string;
  meals_count: string;
  budget?: string;
  allergies?: string;
  days: string | number; // YENİ: Mutlaka eklenmeli
  cuisine: string;       // YENİ: Mutlaka eklenmeli
}

export interface GenerateExerciseParams {
  gender: string;
  age: string | number;
  weight: string | number;
  height: string | number;
  fitness_level: string;
  goal: string;
  equipment: string;
  duration: string | number;
  limitations?: string;
}

/**
 * ==========================================
 * YAPAY ZEKA (AI) SERVİSLERİ
 * ==========================================
 */

/**
 * AI Diyet Planı Oluştur
 */
export async function generateDiet(data: GenerateDietParams) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/ai/generate-diet`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (json.status === 'success') {
      return { 
        success: true, 
        data: json.data, 
        redirect_url: json.redirect_url 
      };
    }
    
    return { success: false, message: json.message || 'Diyet oluşturulamadı.' };
  } catch (error: any) {
    console.error("AI Diet Error:", error);
    return { success: false, message: error.message || 'Sunucu hatası.' };
  }
}

/**
 * AI Egzersiz Planı Oluştur
 */
export async function generateExercise(data: GenerateExerciseParams) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/ai/generate-exercise`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (json.status === 'success') {
      return { 
        success: true, 
        data: json.data 
      };
    }
    
    return { success: false, message: json.message || 'Egzersiz planı oluşturulamadı.' };
  } catch (error: any) {
    console.error("AI Exercise Error:", error);
    return { success: false, message: error.message || 'Sunucu hatası.' };
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
 * Backend'den gelen planları alır ve tutarlı format sağlar
 */
export async function getPlans(category?: string, difficulty?: string): Promise<PlanListItem[]> {
  try {
    let endpoint = '/rejimde/v1/plans'; 
    const params = new URLSearchParams();
    
    // Parametreleri valide et ve ekle
    if (category && category !== 'Tümü' && category.trim() !== '') {
      params.append('category', category);
    }
    if (difficulty && difficulty.trim() !== '') {
      params.append('difficulty', difficulty);
    }
    
    if (params.toString()) endpoint += `?${params.toString()}`;

    const response = await fetchAPI(endpoint);
    
    // Backend yanıt formatlarını destekle - Type guard kullan
    // Format 1: { status: 'success', data: [...] }
    if (isSuccessBackendResponse<PlanListItem[]>(response)) {
      return Array.isArray(response.data) ? response.data : [];
    }
    
    // Format 2: Direkt array dönüyorsa
    if (Array.isArray(response)) {
      return response;
    }
    
    // Format 3: { data: [...] } (status olmadan)
    if (hasDataProperty<PlanListItem[]>(response) && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error("Planlar çekilemedi:", error);
    return [];
  }
}

/**
 * DİYET PLANI OLUŞTUR
 * Plan verilerini valide eder ve backend'e gönderir
 */
export async function createPlan(data: any) {
  try {
    // Temel veri validasyonu
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Geçersiz plan verisi.' };
    }
    
    if (!data.title || data.title.trim() === '') {
      return { success: false, message: 'Plan başlığı gerekli.' };
    }
    
    const res = await fetch(`${API_URL}/rejimde/v1/plans/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const text = await res.text();
    let json;
    
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('createPlan: JSON parse hatası', e);
      return { success: false, message: 'Sunucu yanıtı işlenemedi.' };
    }
    
    // Başarılı yanıt kontrolü
    if (res.ok && json.status === 'success') {
      return { success: true, data: json.data };
    }
    
    // Hata mesajını döndür
    return { 
      success: false, 
      message: json.message || json.error || 'Plan oluşturulamadı.' 
    };
  } catch (error) {
    console.error('createPlan error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * DİYET PLANI GÜNCELLE
 * Plan verilerini valide eder ve backend'e gönderir
 */
export async function updatePlan(id: number, data: any) {
  try {
    // ID validasyonu
    if (!id || isNaN(id) || id <= 0) {
      return { success: false, message: 'Geçersiz plan ID.' };
    }
    
    // Temel veri validasyonu
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Geçersiz plan verisi.' };
    }
    
    const res = await fetch(`${API_URL}/rejimde/v1/plans/update/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const text = await res.text();
    let json;
    
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('updatePlan: JSON parse hatası', e);
      return { success: false, message: 'Sunucu yanıtı işlenemedi.' };
    }
    
    // Başarılı yanıt kontrolü
    if (res.ok && json.status === 'success') {
      return { success: true, data: json.data };
    }
    
    // Hata mesajını döndür
    return { 
      success: false, 
      message: json.message || json.error || 'Plan güncellenemedi.' 
    };
  } catch (error) {
    console.error('updatePlan error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * DİYET PLANI DETAY (Slug ile)
 * Backend'den plan detayını alır ve tutarlı format sağlar
 */
export async function getPlanBySlug(slug: string): Promise<PlanDetail | null> {
  try {
    // Slug validasyonu
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      console.warn('getPlanBySlug: Geçersiz slug parametresi');
      return null;
    }
    
    const response = await fetchAPI(`/rejimde/v1/plans/${encodeURIComponent(slug)}`);
    
    // Backend yanıt formatlarını destekle - Type guard kullan
    // Format 1: { status: 'success', data: {...} }
    if (isSuccessBackendResponse<PlanDetail>(response)) {
      return response.data;
    }
    
    // Format 2: { data: {...} } (status olmadan)
    if (hasDataProperty<PlanDetail>(response)) {
      return response.data;
    }
    
    // Format 3: Direkt obje dönüyorsa (id varsa geçerli plan objesi)
    if (isPlanObject(response)) {
      return response as PlanDetail;
    }
    
    // Hata yanıtı kontrolü
    if (response && (response.code || response.error)) {
      console.warn('getPlanBySlug: Backend hatası', response.message || response.code);
      return null;
    }
    
    return null;
  } catch (error) {
    console.error("Plan detayı çekilemedi:", error);
    return null;
  }
}

// Default values for plan metadata
const DEFAULT_PLAN_META = {
    difficulty: 'medium' as const,
    duration: '7',
    calories: '',
    score_reward: '100',
    diet_category: '',
};

/**
 * DİYET PLANI ID İLE (Edit için)
 * WordPress REST API'den plan detayını alır ve düzenleme için hazırlar
 */
export async function getPlan(id: number | string): Promise<ApiResponse<PlanEditData>> {
    try {
        // ID validasyonu
        if (!id || (typeof id === 'string' && id.trim() === '')) {
            return { success: false, message: 'Geçersiz plan ID.' } as ApiResponse<PlanEditData>;
        }
        
        const post = await fetchAPI(`/wp/v2/rejimde_plan/${id}?context=edit&_embed`, {
            headers: getAuthHeaders()
        });
        
        // Hata kontrolü
        if (!post || post.code || post.error) {
             console.warn("Plan çekilemedi:", post?.message || post?.code);
             return { 
               success: false, 
               message: post?.message || 'Plan bulunamadı veya erişim yetkiniz yok.' 
             } as ApiResponse<PlanEditData>;
        }
        
        // Plan verisi parse et
        let planData = [];
        if (post.meta && post.meta.plan_data) {
             planData = typeof post.meta.plan_data === 'string' 
                ? safeParse(post.meta.plan_data, []) 
                : (Array.isArray(post.meta.plan_data) ? post.meta.plan_data : []);
        }

        // Alışveriş listesi parse et
        let shoppingList = [];
        if (post.meta && post.meta.shopping_list) {
             shoppingList = typeof post.meta.shopping_list === 'string' 
                ? safeParse(post.meta.shopping_list, []) 
                : (Array.isArray(post.meta.shopping_list) ? post.meta.shopping_list : []);
        }

        const formattedData: PlanEditData = {
            id: post.id,
            title: post.title?.raw || post.title?.rendered || '',
            content: post.content?.raw || post.content?.rendered || '',
            status: post.status || 'draft',
            plan_data: planData,
            shopping_list: shoppingList,
            tags: Array.isArray(post.tags) ? post.tags.map(String) : [],
            meta: {
                difficulty: post.meta?.difficulty || DEFAULT_PLAN_META.difficulty,
                duration: post.meta?.duration || DEFAULT_PLAN_META.duration,
                calories: post.meta?.calories || DEFAULT_PLAN_META.calories,
                score_reward: post.meta?.score_reward || DEFAULT_PLAN_META.score_reward,
                diet_category: post.meta?.diet_category || DEFAULT_PLAN_META.diet_category,
                rank_math_title: post.meta?.rank_math_title || '',
                rank_math_description: post.meta?.rank_math_description || '',
                rank_math_focus_keyword: post.meta?.rank_math_focus_keyword || ''
            },
            featured_media_id: post.featured_media || 0,
            featured_media_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
        };

        return { success: true, data: formattedData };
    } catch (e) {
        console.error("getPlan hatası:", e);
        return { success: false, message: 'Plan yüklenirken hata oluştu.' } as ApiResponse<PlanEditData>;
    }
}

/**
 * Egzersiz Planlarını Listele
 * Backend'den gelen egzersiz planlarını alır ve tutarlı format sağlar
 */
export async function getExercisePlans(category?: string, difficulty?: string) {
  try {
    let endpoint = '/rejimde/v1/exercises'; 
    const params = new URLSearchParams();
    
    // Parametreleri valide et ve ekle
    if (category && category !== 'Tümü' && category.trim() !== '') {
      params.append('category', category);
    }
    if (difficulty && difficulty.trim() !== '') {
      params.append('difficulty', difficulty);
    }
    
    if (params.toString()) endpoint += `?${params.toString()}`;

    const response = await fetchAPI(endpoint);
    
    // Backend yanıt formatlarını destekle
    if (response && response.status === 'success' && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    
    if (response && Array.isArray(response)) {
      return response;
    }
    
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error("Egzersiz planları çekilemedi:", error);
    return [];
  }
}

/**
 * Egzersiz Planı Detay (Slug)
 * Backend'den egzersiz planı detayını alır ve tutarlı format sağlar
 */
export async function getExercisePlanBySlug(slug: string) {
  try {
    // Slug validasyonu
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      console.warn('getExercisePlanBySlug: Geçersiz slug parametresi');
      return null;
    }
    
    const response = await fetchAPI(`/rejimde/v1/exercises/${encodeURIComponent(slug)}`);
    
    // Backend yanıt formatlarını destekle
    if (response && response.status === 'success' && response.data) {
      return response.data;
    }
    
    if (response && response.data && typeof response.data === 'object') {
      return response.data;
    }
    
    if (response && response.id && typeof response === 'object') {
      return response;
    }
    
    if (response && (response.code || response.error)) {
      console.warn('getExercisePlanBySlug: Backend hatası', response.message || response.code);
      return null;
    }
    
    return null;
  } catch (error) {
    console.error("Egzersiz planı detayı çekilemedi:", error);
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
        
        // 200 OK veya 409 Conflict (already started) - her ikisi de başarılı sayılır
        if (res.ok || res.status === 409) {
            return { 
                success: true, 
                data: json.data || json,
                already_started: json.data?.already_started || json.already_started || false
            };
        }
        
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
 * Toggle a single item (meal, exercise move) - add or remove
 * @param contentType - 'diet' or 'exercise'
 * @param contentId - Content ID
 * @param itemId - Item ID to toggle (meal id, exercise move id)
 */
export async function toggleProgressItem(contentType: string, contentId: number | string, itemId: string) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/progress/${contentType}/${contentId}/complete-item`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ item_id: itemId })
        });
        
        const json = await res.json();
        
        // Handle 200 or 409 status codes
        if (json.status === 'success' || json.data) {
            return { 
                success: true, 
                data: json.data || json,
                is_completed: json.data?.is_completed || json.is_completed || false,
                completed_items: json.data?.completed_items || json.completed_items || []
            };
        }
        return { success: false, message: json.message };
    } catch (error) {
        return { success: false, message: 'Operation failed.' };
    }
}

/**
 * Tek bir öğeyi tamamla (meal, exercise move)
 * @param contentType - 'diet' or 'exercise'
 * @param contentId - İçeriğin ID'si
 * @param itemId - Tamamlanacak öğenin ID'si (meal id, exercise move id)
 */
export async function completeProgressItem(contentType: string, contentId: number | string, itemId: string) {
    try {
        const res = await fetch(`${API_URL}/rejimde/v1/progress/${contentType}/${contentId}/complete-item`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ item_id: itemId })
        });
        
        const json = await res.json();
        if (json.status === 'success') {
            return { success: true, data: json.data };
        }
        return { success: false, message: json.message };
    } catch (error) {
        return { success: false, message: 'İşlem başarısız.' };
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
    generateDiet,      // YENİ
    generateExercise,  // YENİ
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

/**
 * ==========================================
 * NOTIFICATIONS & ACTIVITY LOG
 * ==========================================
 */

// ===== NOTIFICATION TYPES =====
export interface Notification {
  id: number;
  type: string;
  category: 'social' | 'system' | 'level' | 'circle' | 'points' | 'expert';
  title: string;
  body: string | null;
  icon: string;
  color: string;
  action_url: string | null;
  actor_id: number | null;
  entity_type: string | null;
  entity_id: number | null;
  meta: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  category: string;
  channel_in_app: boolean;
  channel_push: boolean;
  channel_email: boolean;
}

/**
 * Activity Item Type
 * Represents a user activity entry with full context
 * Extended version of UserEvent with additional context and label fields
 * Used by getUserActivity() and getUserPointsHistory()
 */
export interface ActivityItem {
  id: number;
  event_type: string;
  entity_type: string | null;
  entity_id: number | null;
  points: number;
  context: Record<string, any>;
  created_at: string;
  label?: string;
}

export interface ExpertMetrics {
  profile_views: number;
  unique_viewers: number;
  rating_count: number;
  rating_average: number;
  content_views: number;
  client_completions: number;
}

// ===== NOTIFICATION FUNCTIONS =====
export async function getNotifications(options?: {
  limit?: number;
  offset?: number;
  unread_only?: boolean;
  category?: string;
}): Promise<{ notifications: Notification[]; unread_count: number }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    
    // Token yoksa boş dön
    if (!token) {
      return { notifications: [], unread_count: 0 };
    }

    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    if (options?.unread_only) params.append('is_read', '0');
    if (options?.category) params.append('category', options.category);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const res = await fetch(`${API_URL}/rejimde/v1/notifications${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // HTTP error handling
    if (!res.ok) {
      console.warn('Notifications API error:', res.status);
      return { notifications: [], unread_count: 0 };
    }

    const text = await res.text();
    
    // Boş yanıt kontrolü
    if (!text || text.trim() === '') {
      return { notifications: [], unread_count: 0 };
    }
    
    // HTML kontrolü (API mevcut değilse WordPress 404 döner)
    if (text.trim().startsWith('<')) {
      console.warn('Notifications API returned HTML');
      return { notifications: [], unread_count: 0 };
    }

    const json = JSON.parse(text);
    
    // Backend format: { status: 'success', data: [...] }
    if (json.status === 'success') {
      const notifications = Array.isArray(json.data) ? json.data : [];
      
      // Unread count'u hesapla
      const unreadCount = notifications.filter((n: any) => !n.is_read).length;
      
      return {
        notifications: notifications,
        unread_count: unreadCount
      };
    }

    return { notifications: [], unread_count: 0 };
  } catch (error) {
    console.error('getNotifications error:', error);
    return { notifications: [], unread_count: 0 };
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (!token) return 0;

    const res = await fetch(`${API_URL}/rejimde/v1/notifications/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return 0;

    const json = await res.json();
    
    // Backend format: { status: 'success', data: { unread_count: N } }
    if (json.status === 'success' && json.data) {
      return json.data.unread_count || 0;
    }

    return 0;
  } catch (error) {
    console.error('getUnreadNotificationCount error:', error);
    return 0;
  }
}

export async function markNotificationsAsRead(ids?: number[]): Promise<boolean> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (!token) return false;

    const res = await fetch(`${API_URL}/rejimde/v1/notifications/mark-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: ids || 'all' })
    });

    if (!res.ok) return false;

    const json = await res.json();
    return json.status === 'success';
  } catch (error) {
    console.error('markNotificationsAsRead error:', error);
    return false;
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/notifications/preferences`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const json = await res.json();

    if (json.status === 'success') {
      return json.data.preferences || [];
    }
    return [];
  } catch (error) {
    console.error('getNotificationPreferences error:', error);
    return [];
  }
}

export async function updateNotificationPreferences(prefs: NotificationPreferences[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/notifications/preferences`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ preferences: prefs }),
    });
    const json = await res.json();

    return json.status === 'success';
  } catch (error) {
    console.error('updateNotificationPreferences error:', error);
    return false;
  }
}

// ===== ACTIVITY FUNCTIONS =====
export async function getUserActivity(options?: {
  limit?: number;
  offset?: number;
  filter?: string;
}): Promise<ActivityItem[]> {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.filter) params.append('filter', options.filter);

    const res = await fetch(`${API_URL}/rejimde/v1/activity?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const json = await res.json();

    if (json.status === 'success') {
      return json.data.activities || [];
    }
    return [];
  } catch (error) {
    console.error('getUserActivity error:', error);
    return [];
  }
}

export async function getUserPointsHistory(limit?: number): Promise<ActivityItem[]> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const res = await fetch(`${API_URL}/rejimde/v1/activity/points?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const json = await res.json();

    if (json.status === 'success') {
      return json.data.activities || [];
    }
    return [];
  } catch (error) {
    console.error('getUserPointsHistory error:', error);
    return [];
  }
}

// ===== EXPERT FUNCTIONS =====
export async function getExpertNotifications(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ notifications: Notification[]; unread_count: number }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    
    // Don't make API call if user is not pro
    if (!token || role !== 'rejimde_pro') {
      return { notifications: [], unread_count: 0 };
    }

    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const res = await fetch(`${API_URL}/rejimde/v1/expert/notifications${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // HTTP error handling
    if (!res.ok) {
      console.warn('Expert notifications API error:', res.status);
      return { notifications: [], unread_count: 0 };
    }

    const text = await res.text();
    
    // Boş yanıt kontrolü
    if (!text || text.trim() === '') {
      return { notifications: [], unread_count: 0 };
    }
    
    // HTML kontrolü (API mevcut değilse WordPress 404 döner)
    if (text.trim().startsWith('<')) {
      console.warn('Expert notifications API returned HTML');
      return { notifications: [], unread_count: 0 };
    }

    const json = JSON.parse(text);

    // Backend format: { status: 'success', data: [...] }
    if (json.status === 'success') {
      const notifications = Array.isArray(json.data) ? json.data : [];
      
      // Unread count'u hesapla
      const unreadCount = notifications.filter((n: any) => !n.is_read).length;
      
      return {
        notifications: notifications,
        unread_count: unreadCount
      };
    }

    return { notifications: [], unread_count: 0 };
  } catch (error) {
    console.error('getExpertNotifications error:', error);
    return { notifications: [], unread_count: 0 };
  }
}

export async function getExpertActivity(limit?: number): Promise<ActivityItem[]> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const res = await fetch(`${API_URL}/rejimde/v1/expert/activity?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const json = await res.json();

    if (json.status === 'success') {
      return json.data.activities || [];
    }
    return [];
  } catch (error) {
    console.error('getExpertActivity error:', error);
    return [];
  }
}

export async function getExpertMetrics(days?: number): Promise<ExpertMetrics> {
  try {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());

    const res = await fetch(`${API_URL}/rejimde/v1/expert/metrics?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const json = await res.json();

    if (json.status === 'success') {
      return json.data.metrics || {
        profile_views: 0,
        unique_viewers: 0,
        rating_count: 0,
        rating_average: 0,
        content_views: 0,
        client_completions: 0,
      };
    }
    return {
      profile_views: 0,
      unique_viewers: 0,
      rating_count: 0,
      rating_average: 0,
      content_views: 0,
      client_completions: 0,
    };
  } catch (error) {
    console.error('getExpertMetrics error:', error);
    return {
      profile_views: 0,
      unique_viewers: 0,
      rating_count: 0,
      rating_average: 0,
      content_views: 0,
      client_completions: 0,
    };
  }
}

export async function getExpertProfileViewers(limit?: number): Promise<Array<{
  id: number;
  name: string;
  avatar: string;
  viewed_at: string;
}>> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const res = await fetch(`${API_URL}/rejimde/v1/expert/profile-viewers?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const json = await res.json();

    if (json.status === 'success') {
      return json.data.viewers || [];
    }
    return [];
  } catch (error) {
    console.error('getExpertProfileViewers error:', error);
    return [];
  }
}

/**
 * ==========================================
 * FAVORITES API FUNCTIONS
 * ==========================================
 */

/**
 * Toggle favorite status for content (diet, exercise, blog)
 * @param contentType - 'diet', 'exercise', or 'blog'
 * @param contentId - Content ID
 */
export async function toggleFavoriteAPI(contentType: string, contentId: number) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (!token) {
      return { success: false, message: 'Giriş yapmalısınız.' };
    }

    const res = await fetch(`${API_URL}/rejimde/v1/favorites/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        content_type: contentType,
        content_id: contentId
      }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { 
        success: true, 
        is_favorited: json.data?.is_favorited || false,
        message: json.message || 'İşlem başarılı'
      };
    }
    
    return { success: false, message: json.message || 'İşlem başarısız.' };
  } catch (error) {
    console.error('toggleFavoriteAPI error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * Check if content is favorited
 * @param contentType - 'diet', 'exercise', or 'blog'
 * @param contentId - Content ID
 */
export async function checkFavoriteAPI(contentType: string, contentId: number) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (!token) {
      return { success: false, is_favorited: false };
    }

    const res = await fetch(`${API_URL}/rejimde/v1/favorites/check/${contentType}/${contentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { 
        success: true, 
        is_favorited: json.data?.is_favorited || false
      };
    }
    
    return { success: false, is_favorited: false };
  } catch (error) {
    console.error('checkFavoriteAPI error:', error);
    return { success: false, is_favorited: false };
  }
}

// ==========================================
// PRO CRM API FUNCTIONS
// ==========================================

export interface ClientListItem {
  id: number;
  relationship_id: number;
  client: {
    id: number;
    name: string;
    avatar: string;
    email: string;
  };
  status: 'pending' | 'active' | 'paused' | 'archived' | 'blocked';
  source: 'marketplace' | 'invite' | 'manual';
  started_at: string | null;
  package: {
    name: string;
    type: 'session' | 'duration' | 'unlimited';
    total: number;
    used: number;
    remaining: number;
    progress_percent: number;
  } | null;
  last_activity: string | null;
  risk_status: 'normal' | 'warning' | 'danger';
  risk_reason: string | null;
  score: number;
  created_at: string;
}

export interface ClientDetail extends ClientListItem {
  client: {
    id: number;
    name: string;
    avatar: string;
    email: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
  };
  agreement: {
    start_date: string;
    end_date: string | null;
    package_name: string;
    total_sessions: number | null;
    used_sessions: number;
    remaining_sessions: number | null;
    price: number;
  };
  stats: {
    score: number;
    streak: number;
    completed_plans: number;
    last_activity: string | null;
  };
  notes: ClientNote[];
  recent_activity: any[];
  assigned_plans: any[];
}

export interface ClientNote {
  id: number;
  type: 'general' | 'health' | 'progress' | 'reminder';
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface ClientsListResponse {
  clients: ClientListItem[];
  meta: {
    total: number;
    active: number;
    paused: number;
    archived: number;
  };
}

// Danışan listesi
export async function getProClients(options?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ClientsListResponse> {
  const defaultMeta = { total: 0, active: 0, paused: 0, archived: 0 };
  
  try {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.search) params.append('search', options.search);
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      return { clients: [], meta: defaultMeta };
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      // Check nested format first (expected)
      let clients = json.data;
      let meta = json.meta || defaultMeta;
      
      // Fallback: Check root level clients property if data doesn't exist or is empty
      if ((clients == null || (Array.isArray(clients) && clients.length === 0)) && json.clients !== undefined) {
        clients = json.clients;
      }
      
      // Fallback: Check if data has a nested clients property
      if (clients && typeof clients === 'object' && !Array.isArray(clients) && 'clients' in clients && clients.clients) {
        clients = clients.clients;
      }
      
      // Ensure clients is an array
      clients = Array.isArray(clients) ? clients : [];
      
      // Ensure clients have the correct nested structure
      // Handle flat client objects vs nested client objects
      const normalizedClients = clients.map((item: any) => {
        // If the client data is already nested correctly, return as-is
        if (item.client && typeof item.client === 'object' && item.client.id) {
          return item;
        }
        
        // If the client data is flat, restructure it
        // Extract client-specific fields and move them under 'client' property
        // Priority: prefixed fields (client_*) take precedence over non-prefixed fields
        const { client_id, client_name, client_avatar, client_email, name, avatar, email, id, ...restFields } = item;
        return {
          ...restFields,
          client: {
            id: client_id || id,
            name: client_name || name || '',
            avatar: client_avatar || avatar || '',
            email: client_email || email || ''
          }
        };
      });
      
      // Normalize meta to use 'paused' instead of 'pending'
      // Backend may still return 'pending', but we map it to 'paused' in the frontend
      const normalizedMeta = {
        total: meta.total || 0,
        active: meta.active || 0,
        paused: (meta as any).paused || (meta as any).pending || 0,
        archived: meta.archived || 0
      };
      
      return {
        clients: normalizedClients,
        meta: normalizedMeta
      };
    }

    return { clients: [], meta: defaultMeta };
  } catch (error) {
    console.error('getProClients error:', error);
    return { clients: [], meta: defaultMeta };
  }
}

// Danışan detayı
export async function getProClient(clientId: number): Promise<ClientDetail | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/${clientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return null;
  } catch (error) {
    console.error('getProClient error:', error);
    return null;
  }
}

// Yeni danışan ekle
export async function addProClient(data: {
  client_email: string;
  client_name: string;
  package_name: string;
  package_type: 'session' | 'duration' | 'unlimited';
  total_sessions?: number;
  start_date: string;
  end_date?: string;
  price?: number;
  notes?: string;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, data: json.data };
    }

    return { success: false, message: json.message || 'Danışan eklenemedi.' };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// Davet linki oluştur
export async function createClientInvite(data: {
  package_name: string;
  package_type: 'session' | 'duration' | 'unlimited';
  total_sessions?: number;
  duration_months?: number;
  price?: number;
}): Promise<{ success: boolean; invite_url?: string; invite_token?: string; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { 
        success: true, 
        invite_url: json.data.invite_url,
        invite_token: json.data.invite_token
      };
    }

    return { success: false, message: json.message || 'Davet linki oluşturulamadı.' };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * Accept client invite (for clients accepting expert's invite)
 */
export async function acceptClientInvite(token: string): Promise<{
  success: boolean;
  expert?: { id: number; name: string; avatar: string };
  message?: string;
}> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/accept-invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { 
        success: true, 
        expert: json.data.expert 
      };
    }

    return { success: false, message: json.message || 'Davet kabul edilemedi.' };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// Danışan durumu güncelle
export async function updateClientStatus(clientId: number, status: string, reason?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/${clientId}/status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reason }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Durum güncellenemedi.' };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// Paket güncelle
export async function updateClientPackage(clientId: number, data: {
  action: 'renew' | 'extend' | 'cancel';
  package_name?: string;
  total_sessions?: number;
  start_date?: string;
  price?: number;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/${clientId}/package`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Paket güncellenemedi.' };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// Not ekle
export async function addClientNote(clientId: number, data: {
  type: 'general' | 'health' | 'progress' | 'reminder';
  content: string;
  is_pinned?: boolean;
}): Promise<{ success: boolean; data?: ClientNote; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/${clientId}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, data: json.data };
    }

    return { success: false, message: json.message || 'Not eklenemedi.' };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// Not sil
export async function deleteClientNote(clientId: number, noteId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/${clientId}/notes/${noteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Not silinemedi.' };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// Danışan aktivitesi
export async function getClientActivity(clientId: number, limit?: number): Promise<any[]> {
  try {
    const params = limit ? `?limit=${limit}` : '';
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/${clientId}/activity${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return [];

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data || [];
    }

    return [];
  } catch (error) {
    return [];
  }
}

// Danışana atanmış planlar
export async function getClientPlans(clientId: number): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/${clientId}/plans`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return [];

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data || [];
    }

    return [];
  } catch (error) {
    return [];
  }
}

// Award badge to client
export async function awardClientBadge(clientId: number, badgeId: string, message?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/clients/${clientId}/award-badge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ badge_id: badgeId, message }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Rozet verilemedi.' };
  } catch (error) {
    console.error('awardClientBadge error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// ==========================================
// INBOX API FUNCTIONS
// ==========================================

export interface InboxThread {
  id: number;
  relationship_id: number;
  client: {
    id: number;
    name: string;
    avatar: string;
  };
  subject: string | null;
  status: 'open' | 'closed' | 'archived';
  last_message: {
    content: string;
    sender_type: 'expert' | 'client';
    created_at: string;
    is_read: boolean;
  } | null;
  unread_count: number;
  created_at: string;
}

export interface InboxMessage {
  id: number;
  sender_id: number;
  sender_type: 'expert' | 'client';
  sender_name: string;
  sender_avatar: string;
  content: string;
  content_type: 'text' | 'image' | 'file' | 'voice' | 'plan_link';
  attachments: any[] | null;
  is_read: boolean;
  is_ai_generated: boolean;
  created_at: string;
}

export interface MessageTemplate {
  id: number;
  title: string;
  content: string;
  category: string;
  usage_count: number;
}

// Thread listesi
export async function getInboxThreads(options?:  {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ threads: InboxThread[]; meta: { total: number; unread_total: number } }> {
  try {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.search) params.append('search', options.search);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox? ${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      return { threads: [], meta: { total: 0, unread_total: 0 } };
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      // Backend returns { status: 'success', data: [...], meta: {...} }
      // data is directly the threads array, NOT nested as { threads: [...] }
      
      let threads: InboxThread[] = [];
      let meta = { total: 0, unread_total: 0 };
      
      // Format 1: data is directly an array of threads (CURRENT BACKEND FORMAT)
      if (Array.isArray(json.data)) {
        threads = json. data;
        meta = json.meta || { total: 0, unread_total: 0 };
      }
      // Format 2: data has nested threads property (legacy/alternative format)
      else if (json.data?. threads) {
        threads = json.data.threads;
        meta = json.data.meta || json.meta || { total: 0, unread_total: 0 };
      }
      
      return { threads, meta };
    }

    return { threads:  [], meta: { total: 0, unread_total: 0 } };
  } catch (error) {
    console.error('getInboxThreads error:', error);
    return { threads: [], meta: { total:  0, unread_total: 0 } };
  }
}


// Thread detayı ve mesajları
export async function getInboxThread(threadId: number): Promise<{
  thread: InboxThread;
  messages: InboxMessage[];
} | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/${threadId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        thread: json.data?.thread || null,
        messages: json.data?.messages || []
      };
    }

    return null;
  } catch (error) {
    console.error('getInboxThread error:', error);
    return null;
  }
}

// Mesaj gönder
export async function sendInboxMessage(threadId: number, data: {
  content: string;
  content_type?:  string;
}): Promise<{ success: boolean; message?: InboxMessage; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/${threadId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        success: true,
        message:  json.data?. message  // <-- Burada id gelmeyebilir
      };
    }

    return {
      success: false,
      error: json. message || 'Mesaj gönderilemedi'
    };
  } catch (error) {
    console.error('sendInboxMessage error:', error);
    return {
      success:  false,
      error: 'Sunucu hatası'
    };
  }
}

// Yeni thread başlat
export async function createInboxThread(data: {
  client_id: number;
  subject?: string;
  content: string;
}): Promise<{ success: boolean; thread_id?: number; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/new`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        success: true,
        thread_id: json.data?.thread_id
      };
    }

    return {
      success: false,
      error: json.message || 'Thread oluşturulamadı'
    };
  } catch (error) {
    console.error('createInboxThread error:', error);
    return {
      success: false,
      error: 'Sunucu hatası'
    };
  }
}

// Thread'i okundu işaretle
export async function markThreadAsRead(threadId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/${threadId}/mark-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    return json.status === 'success';
  } catch (error) {
    console.error('markThreadAsRead error:', error);
    return false;
  }
}

// Thread'i kapat
export async function closeInboxThread(threadId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/${threadId}/close`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    return json.status === 'success';
  } catch (error) {
    console.error('closeInboxThread error:', error);
    return false;
  }
}

// Thread'i arşivle
export async function archiveInboxThread(threadId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/${threadId}/archive`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    return json.status === 'success';
  } catch (error) {
    console.error('archiveInboxThread error:', error);
    return false;
  }
}

// Şablonları getir
export async function getMessageTemplates(): Promise<MessageTemplate[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/templates`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return [];

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data?.templates || [];
    }

    return [];
  } catch (error) {
    console.error('getMessageTemplates error:', error);
    return [];
  }
}

// Şablon ekle
export async function createMessageTemplate(data: {
  title: string;
  content: string;
  category?: string;
}): Promise<{ success: boolean; template?: MessageTemplate }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        success: true,
        template: json.data?.template
      };
    }

    return { success: false };
  } catch (error) {
    console.error('createMessageTemplate error:', error);
    return { success: false };
  }
}

// Şablon sil
export async function deleteMessageTemplate(templateId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/templates/${templateId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    return json.status === 'success';
  } catch (error) {
    console.error('deleteMessageTemplate error:', error);
    return false;
  }
}

// AI taslak oluştur
export async function generateAIDraft(threadId: number): Promise<{ success: boolean; draft?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/${threadId}/ai-draft`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        success: true,
        draft: json.data?.draft
      };
    }

    return { success: false };
  } catch (error) {
    console.error('generateAIDraft error:', error);
    return { success: false };
  }
}

// Okunmamış mesaj sayısı
export async function getUnreadInboxCount(): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/inbox/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return 0;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data?.count || 0;
    }

    return 0;
  } catch (error) {
    console.error('getUnreadInboxCount error:', error);
    return 0;
  }
}

// ==========================================
// CALENDAR API FUNCTIONS
// ==========================================

export interface Appointment {
  id: number;
  client: {
    id: number;
    name: string;
    avatar: string;
    email?: string;
    phone?: string;
  };
  service?: {
    id: number;
    name: string;
  };
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  type: 'online' | 'in_person' | 'phone';
  location?: string;
  meeting_link?: string;
  notes?: string;
  created_at: string;
}

export interface AppointmentRequest {
  id: number;
  requester: {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    is_member: boolean;
  };
  service?: {
    id: number;
    name: string;
  };
  preferred_date: string;
  preferred_time: string;
  alternative_date?: string;
  alternative_time?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_at: string;
}

export interface BlockedTime {
  id: number;
  date: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
  is_all_day: boolean;
}

export interface AvailabilitySlot {
  day: number;
  day_name: string;
  slots: { start: string; end: string }[];
}

export interface AvailabilitySettings {
  slot_duration: number;
  buffer_time: number;
  schedule: AvailabilitySlot[];
}

// Takvim görünümü
export async function getCalendarAppointments(startDate: string, endDate: string, status?: string): Promise<{
  appointments: Appointment[];
  blocked_times: BlockedTime[];
}> {
  try {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      ...(status ? { status } : {})
    });

    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      return { appointments: [], blocked_times: [] };
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        appointments: json.data?.appointments || [],
        blocked_times: json.data?.blocked_times || []
      };
    }

    return { appointments: [], blocked_times: [] };
  } catch (error) {
    console.error('getCalendarAppointments error:', error);
    return { appointments: [], blocked_times: [] };
  }
}

// Müsaitlik şablonu
export async function getAvailabilitySettings(): Promise<AvailabilitySettings | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/availability`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return null;
  } catch (error) {
    console.error('getAvailabilitySettings error:', error);
    return null;
  }
}

export async function updateAvailabilitySettings(data: {
  slot_duration: number;
  buffer_time: number;
  schedule: { day: number; start_time: string; end_time: string }[];
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/availability`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('updateAvailabilitySettings error:', error);
    return { success: false, message: 'Ayarlar kaydedilemedi.' };
  }
}

// Randevu CRUD
export async function createAppointment(data: {
  client_id: number;
  service_id?: number;
  title?: string;
  date: string;
  start_time: string;
  duration?: number;
  type: 'online' | 'in_person' | 'phone';
  location?: string;
  meeting_link?: string;
  notes?: string;
}): Promise<{ success: boolean; appointment?: Appointment; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        success: true,
        appointment: json.data?.appointment,
        message: json.message
      };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('createAppointment error:', error);
    return { success: false, message: 'Randevu oluşturulamadı.' };
  }
}

export async function updateAppointment(appointmentId: number, data: Partial<Appointment>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('updateAppointment error:', error);
    return { success: false, message: 'Randevu güncellenemedi.' };
  }
}

export async function cancelAppointment(appointmentId: number, reason?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('cancelAppointment error:', error);
    return { success: false, message: 'Randevu iptal edilemedi.' };
  }
}

export async function completeAppointment(appointmentId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/appointments/${appointmentId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('completeAppointment error:', error);
    return { success: false, message: 'Randevu tamamlanamadı.' };
  }
}

export async function markNoShow(appointmentId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/appointments/${appointmentId}/no-show`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('markNoShow error:', error);
    return { success: false, message: 'İşlem tamamlanamadı.' };
  }
}

// Randevu talepleri
// lib/api.ts - getAppointmentRequests fonksiyonu (satır 3926-3955)
export async function getAppointmentRequests(status?: string): Promise<{
  requests: AppointmentRequest[];
  meta: { total:  number; pending: number };
}> {
  try {
    const params = status ? `?status=${status}` : '';
    
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/requests${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      return { requests: [], meta: { total: 0, pending: 0 } };
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      // Backend formats: 
      // Format 1: { data: [... ], meta: {... } } - data is direct array
      // Format 2: { data: { requests: [...], meta: {...} } } - nested format
      
      let requests: AppointmentRequest[] = [];
      let meta = { total: 0, pending: 0 };
      
      // Check if data is an array (Format 1)
      if (Array.isArray(json.data)) {
        requests = json. data;
        meta = json.meta || { total: 0, pending: 0 };
      } 
      // Check if data has nested requests (Format 2)
      else if (json.data?. requests) {
        requests = json.data.requests;
        meta = json.data.meta || { total: 0, pending: 0 };
      }
      
      return { requests, meta };
    }

    return { requests: [], meta: { total: 0, pending: 0 } };
  } catch (error) {
    console.error('getAppointmentRequests error:', error);
    return { requests: [], meta: { total:  0, pending:  0 } };
  }
}

export async function approveAppointmentRequest(requestId: number, data: {
  date: string;
  start_time: string;
  type: 'online' | 'in_person' | 'phone';
  meeting_link?: string;
}): Promise<{ success: boolean; appointment?: Appointment; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/requests/${requestId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        success: true,
        appointment: json.data?.appointment,
        message: json.message
      };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('approveAppointmentRequest error:', error);
    return { success: false, message: 'Talep onaylanamadı.' };
  }
}

export async function rejectAppointmentRequest(requestId: number, reason?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/requests/${requestId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('rejectAppointmentRequest error:', error);
    return { success: false, message: 'Talep reddedilemedi.' };
  }
}

// Zaman bloke
export async function blockTime(data: {
  date: string;
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
  reason?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/block`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('blockTime error:', error);
    return { success: false, message: 'Zaman bloke edilemedi.' };
  }
}

export async function unblockTime(blockId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/calendar/block/${blockId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('unblockTime error:', error);
    return { success: false, message: 'Bloke kaldırılamadı.' };
  }
}

// Public - Müsait slotlar
// lib/api.ts satır 4058-4083 - GÜNCELLENMİŞ
export async function getExpertAvailableSlots(expertId: number, date: string): Promise<{
  expert: { id: number; name: string; avatar:  string };
  available_slots: string[];
  slot_duration: number;
}> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/experts/${expertId}/availability? date=${date}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res. ok) {
      return { expert: { id: expertId, name: '', avatar: '' }, available_slots: [], slot_duration: 60 };
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      // Backend returns { available_slots: { '2025-12-30': ['09:00', '10:00'] } }
      // We need to extract the array for the specific date
      const slotsData = json.data?. available_slots || {};
      const slotsArray = slotsData[date] || [];
      
      return {
        expert: json.data?. expert || { id: expertId, name: '', avatar: '' },
        available_slots: Array.isArray(slotsArray) ? slotsArray :  [],
        slot_duration: json.data?.slot_duration || 60
      };
    }

    return { expert: { id: expertId, name: '', avatar: '' }, available_slots: [], slot_duration: 60 };
  } catch (error) {
    console.error('getExpertAvailableSlots error:', error);
    return { expert: { id:  expertId, name:  '', avatar: '' }, available_slots: [], slot_duration: 60 };
  }
}

export async function getExpertAvailableSlotsRange(expertId: number, startDate: string, endDate: string): Promise<{
  expert: { id: number; name: string; avatar: string };
  available_slots: Record<string, string[]>;
  slot_duration: number;
}> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/experts/${expertId}/availability?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return { expert: { id: expertId, name: '', avatar: '' }, available_slots: {}, slot_duration: 60 };
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return { expert: { id: expertId, name: '', avatar: '' }, available_slots: {}, slot_duration: 60 };
  } catch (error) {
    console.error('getExpertAvailableSlotsRange error:', error);
    return { expert: { id: expertId, name: '', avatar: '' }, available_slots: {}, slot_duration: 60 };
  }
}

// Randevu talebi gönder (client/guest)
export async function requestAppointment(data: {
  expert_id: number;
  service_id?: number;
  preferred_date: string;
  preferred_time: string;
  alternative_date?: string;
  alternative_time?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}): Promise<{ success: boolean; request_id?: number; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/appointments/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        success: true,
        request_id: json.data?.request_id,
        message: json.message
      };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('requestAppointment error:', error);
    return { success: false, message: 'Talep gönderilemedi.' };
  }
}

// ==========================================
// FINANCE API TYPES & FUNCTIONS
// ==========================================

export interface FinanceDashboard {
  summary: {
    total_revenue: number;
    total_pending: number;
    total_overdue: number;
    paid_count: number;
    pending_count: number;
    overdue_count: number;
  };
  monthly_comparison: {
    current: number;
    previous: number;
    change_percent: number;
  };
  revenue_by_service: {
    service_id: number;
    service_name: string;
    total: number;
    count: number;
  }[];
  revenue_chart: {
    date: string;
    amount: number;
  }[];
  recent_payments: Payment[];
}

export interface Payment {
  id: number;
  client: {
    id: number;
    name: string;
    avatar: string;
  };
  service?: {
    id: number;
    name: string;
  };
  amount: number;
  paid_amount: number;
  currency: string;
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'online' | 'other';
  payment_date: string;
  due_date?: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';
  description?: string;
  notes?: string;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  type: 'online' | 'face_to_face' | 'group' | 'package' | 'consultation' | 'session' | 'one_time';
  price: number;
  currency: string;
  duration_minutes: number;
  session_count?: number;
  validity_days?: number;
  capacity?: number;
  is_active: boolean;
  is_featured: boolean;
  color: string;
  usage_count: number;
}

export interface MonthlyReport {
  period: string;
  summary: {
    total_revenue: number;
    total_sessions: number;
    unique_clients: number;
    average_per_client: number;
  };
  by_week: {
    week: number;
    revenue: number;
    sessions: number;
  }[];
  by_service: {
    service_id: number;
    name: string;
    revenue: number;
    count: number;
  }[];
  by_payment_method: {
    method: string;
    amount: number;
    count: number;
  }[];
  top_clients: {
    client_id: number;
    name: string;
    avatar?: string;
    total: number;
  }[];
}

// Dashboard
export async function getFinanceDashboard(period?: string, startDate?: string, endDate?: string): Promise<FinanceDashboard> {
  try {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const queryString = params.toString();
    const url = `${API_URL}/rejimde/v1/pro/finance/dashboard${queryString ? '?' + queryString : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch finance dashboard');
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    throw new Error(json.message || 'Failed to fetch finance dashboard');
  } catch (error) {
    console.error('getFinanceDashboard error:', error);
    throw error;
  }
}

// Ödemeler
export async function getPayments(options?: {
  status?: string;
  client_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}): Promise<{ payments: Payment[]; meta: { total: number; total_amount: number; paid_amount: number; pending_amount: number } }> {
  try {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.client_id) params.append('client_id', options.client_id.toString());
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const queryString = params.toString();
    const url = `${API_URL}/rejimde/v1/pro/finance/payments${queryString ? '?' + queryString : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch payments');
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      // Check nested format first (expected)
      if (json.data) {
        return json.data;
      }
      
      // Check root level (legacy)
      if (json.payments !== undefined || json.meta !== undefined) {
        return {
          payments: json.payments || [],
          meta: json.meta || { total: 0, total_amount: 0, paid_amount: 0, pending_amount: 0 }
        };
      }
    }

    throw new Error(json.message || 'Failed to fetch payments');
  } catch (error) {
    console.error('getPayments error:', error);
    throw error;
  }
}

export async function createPayment(data: {
  client_id: number;
  service_id?: number;
  amount: number;
  payment_method: string;
  payment_date: string;
  due_date?: string;
  status?: string;
  description?: string;
  notes?: string;
}): Promise<{ success: boolean; payment?: Payment; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        success: true,
        payment: json.data?.payment,
        message: json.message
      };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('createPayment error:', error);
    return { success: false, message: 'Ödeme oluşturulamadı.' };
  }
}

export async function updatePayment(paymentId: number, data: Partial<Payment>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/payments/${paymentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('updatePayment error:', error);
    return { success: false, message: 'Ödeme güncellenemedi.' };
  }
}

export async function deletePayment(paymentId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/payments/${paymentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('deletePayment error:', error);
    return { success: false, message: 'Ödeme silinemedi.' };
  }
}

export async function markPaymentAsPaid(paymentId: number, data: {
  paid_amount?: number;
  payment_method?: string;
  payment_date?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/payments/${paymentId}/mark-paid`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('markPaymentAsPaid error:', error);
    return { success: false, message: 'Ödeme tahsil edilemedi.' };
  }
}

export async function recordPartialPayment(paymentId: number, amount: number, method: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/payments/${paymentId}/partial`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, payment_method: method }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('recordPartialPayment error:', error);
    return { success: false, message: 'Kısmi ödeme kaydedilemedi.' };
  }
}

// Hizmetler
export async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/services`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch services');
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      // Check nested format first (expected), then root level (legacy)
      return json.data?.services || json.services || [];
    }

    throw new Error(json.message || 'Failed to fetch services');
  } catch (error) {
    console.error('getServices error:', error);
    return [];
  }
}

export async function createService(data: {
  name: string;
  description?: string;
  type: string;
  price: number;
  duration_minutes?: number;
  session_count?: number;
  validity_days?: number;
  capacity?: number;
  color?: string;
}): Promise<{ success: boolean; service?: Service; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        success: true,
        service: json.data?.service,
        message: json.message
      };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('createService error:', error);
    return { success: false, message: 'Hizmet oluşturulamadı.' };
  }
}

export async function updateService(serviceId: number, data: Partial<Service>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/services/${serviceId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('updateService error:', error);
    return { success: false, message: 'Hizmet güncellenemedi.' };
  }
}

export async function deleteService(serviceId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/services/${serviceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('deleteService error:', error);
    return { success: false, message: 'Hizmet silinemedi.' };
  }
}

export async function forceDeleteService(serviceId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/services/${serviceId}/force`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, message: json.message };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('forceDeleteService error:', error);
    return { success: false, message: 'Hizmet kalıcı olarak silinemedi.' };
  }
}

export async function toggleServiceActive(serviceId: number): Promise<{ success: boolean; is_active?: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/services/${serviceId}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { 
        success: true, 
        is_active: json.data?.is_active ?? undefined, 
        message: json.message 
      };
    }

    return { success: false, message: json.message };
  } catch (error) {
    console.error('toggleServiceActive error:', error);
    return { success: false, message: 'Hizmet durumu değiştirilemedi.' };
  }
}

export async function getExpertPublicServices(expertId: number): Promise<Service[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/experts/${expertId}/services`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      return Array.isArray(json.data) ? json.data : [];
    }

    return [];
  } catch (error) {
    console.error('getExpertPublicServices error:', error);
    return [];
  }
}

// Raporlar
export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/reports/monthly?year=${year}&month=${month}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch monthly report');
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    throw new Error(json.message || 'Failed to fetch monthly report');
  } catch (error) {
    console.error('getMonthlyReport error:', error);
    throw error;
  }
}

export async function getYearlyReport(year: number): Promise<any> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/reports/yearly?year=${year}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch yearly report');
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    throw new Error(json.message || 'Failed to fetch yearly report');
  } catch (error) {
    console.error('getYearlyReport error:', error);
    throw error;
  }
}

export async function exportFinanceData(format: 'csv' | 'excel', startDate: string, endDate: string, type: string): Promise<Blob> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/finance/export?format=${format}&start_date=${startDate}&end_date=${endDate}&type=${type}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to export data');
    }

    return await res.blob();
  } catch (error) {
    console.error('exportFinanceData error:', error);
    throw error;
  }
}

// ==========================================
// SERVICES API FUNCTIONS
// ==========================================

export interface ProService {
  id: number;
  name: string;
  description?: string;
  type: 'session' | 'package' | 'duration' | 'subscription' | 'one_time';
  price: number;
  currency: string;
  duration_minutes: number;
  session_count?: number;
  validity_days?: number;
  is_active: boolean;
  is_featured: boolean;
  is_public: boolean;
  booking_enabled: boolean;
  color: string;
  sort_order: number;
  usage_count: number;
  created_at: string;
}

// GET /pro/services
export async function getProServices(): Promise<ProService[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/services`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return [];

    const json = await res.json();
    
    if (json.status === 'success') {
      // Check nested format first (expected)
      let services = json.data;
      
      // Fallback: Check root level services property if data doesn't exist or is empty
      if ((services == null || (Array.isArray(services) && services.length === 0)) && json.services !== undefined) {
        services = json.services;
      }
      
      // Fallback: Check if data has a nested services property
      if (services && typeof services === 'object' && !Array.isArray(services) && 'services' in services && services.services) {
        services = services.services;
      }
      
      // Ensure services is an array
      return Array.isArray(services) ? services : [];
    }

    return [];
  } catch (error) {
    console.error('getProServices error:', error);
    return [];
  }
}

// GET /pro/services/{id}
export async function getProService(serviceId: number): Promise<ProService | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/services/${serviceId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return null;
  } catch (error) {
    console.error('getProService error:', error);
    return null;
  }
}

// POST /pro/services
export async function createProService(data: {
  name: string;
  description?: string;
  type: 'session' | 'package' | 'duration' | 'subscription' | 'one_time';
  price: number;
  currency?: string;
  duration_minutes?: number;
  session_count?: number;
  validity_days?: number;
  is_public?: boolean;
  booking_enabled?: boolean;
  color?: string;
}): Promise<{ success: boolean; service?: ProService; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, service: json.data };
    }

    return { success: false, message: json.message || 'Hizmet oluşturulamadı.' };
  } catch (error) {
    console.error('createProService error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// PATCH /pro/services/{id}
export async function updateProService(serviceId: number, data: Partial<ProService>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/services/${serviceId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Hizmet güncellenemedi.' };
  } catch (error) {
    console.error('updateProService error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// DELETE /pro/services/{id}
export async function deleteProService(serviceId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/services/${serviceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Hizmet silinemedi.' };
  } catch (error) {
    console.error('deleteProService error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// PATCH /pro/services/{id}/toggle
export async function toggleProServiceStatus(serviceId: number): Promise<{ success: boolean; is_active?: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/services/${serviceId}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, is_active: json.data?.is_active };
    }

    return { success: false, message: json.message || 'Durum değiştirilemedi.' };
  } catch (error) {
    console.error('toggleProServiceStatus error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// POST /pro/services/reorder
export async function reorderProServices(serviceIds: number[]): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/services/reorder`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ service_ids: serviceIds }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Sıralama güncellenemedi.' };
  } catch (error) {
    console.error('reorderProServices error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// ==========================================
// PRIVATE PLANS API FUNCTIONS
// ==========================================

export interface PrivatePlan {
  id: number;
  expert_id: number;
  client_id?: number;
  client?: {
    id: number;
    name: string;
    avatar: string;
  };
  title: string;
  type: 'diet' | 'workout' | 'flow' | 'rehab' | 'habit';
  status: 'draft' | 'ready' | 'assigned' | 'in_progress' | 'completed';
  plan_data: any;
  notes?: string;
  assigned_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface MyPrivatePlan {
  id: number;
  expert: {
    id: number;
    name: string;
    avatar: string;
  };
  title: string;
  type: string;
  status: string;
  plan_data: any;
  progress_percent: number;
  completed_items: string[];
  assigned_at: string;
}

// GET /pro/plans
export async function getPrivatePlans(options?: {
  type?: string;
  status?: string;
  client_id?: number;
  limit?: number;
  offset?: number;
}): Promise<{ plans: PrivatePlan[]; meta: { total: number } }> {
  try {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.status) params.append('status', options.status);
    if (options?.client_id) params.append('client_id', String(options.client_id));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const res = await fetch(`${API_URL}/rejimde/v1/pro/plans${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      return { plans: [], meta: { total: 0 } };
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        plans: json.data || [],
        meta: json.meta || { total: 0 }
      };
    }

    return { plans: [], meta: { total: 0 } };
  } catch (error) {
    console.error('getPrivatePlans error:', error);
    return { plans: [], meta: { total: 0 } };
  }
}

// GET /pro/plans/{id}
export async function getPrivatePlan(planId: number): Promise<PrivatePlan | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/plans/${planId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return null;
  } catch (error) {
    console.error('getPrivatePlan error:', error);
    return null;
  }
}

// POST /pro/plans
export async function createPrivatePlan(data: {
  title: string;
  type: 'diet' | 'workout' | 'flow' | 'rehab' | 'habit';
  client_id?: number;
  plan_data: any;
  notes?: string;
  status?: 'draft' | 'ready' | 'assigned' | 'in_progress' | 'completed';
}): Promise<{ success: boolean; plan?: PrivatePlan; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/plans`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, plan: json.data };
    }

    return { success: false, message: json.message || 'Plan oluşturulamadı.' };
  } catch (error) {
    console.error('createPrivatePlan error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// PATCH /pro/plans/{id}
export async function updatePrivatePlan(planId: number, data: Partial<PrivatePlan>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/plans/${planId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Plan güncellenemedi.' };
  } catch (error) {
    console.error('updatePrivatePlan error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// DELETE /pro/plans/{id}
export async function deletePrivatePlan(planId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/plans/${planId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Plan silinemedi.' };
  } catch (error) {
    console.error('deletePrivatePlan error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// POST /pro/plans/{id}/assign
export async function assignPrivatePlan(planId: number, clientId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/plans/${planId}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ client_id: clientId }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Plan atanamadı.' };
  } catch (error) {
    console.error('assignPrivatePlan error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// POST /pro/plans/{id}/duplicate
export async function duplicatePrivatePlan(planId: number, newTitle?: string): Promise<{ success: boolean; plan?: PrivatePlan; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/plans/${planId}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ new_title: newTitle }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, plan: json.data };
    }

    return { success: false, message: json.message || 'Plan kopyalanamadı.' };
  } catch (error) {
    console.error('duplicatePrivatePlan error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// PATCH /pro/plans/{id}/status
export async function updatePrivatePlanStatus(planId: number, status: 'draft' | 'ready' | 'assigned' | 'in_progress' | 'completed'): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/plans/${planId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Durum güncellenemedi.' };
  } catch (error) {
    console.error('updatePrivatePlanStatus error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// GET /me/private-plans (Client side)
export async function getMyPrivatePlans(): Promise<MyPrivatePlan[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/me/private-plans`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return [];

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data || [];
    }

    return [];
  } catch (error) {
    console.error('getMyPrivatePlans error:', error);
    return [];
  }
}

// GET /me/private-plans/{id}
export async function getMyPrivatePlan(planId: number): Promise<MyPrivatePlan | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/me/private-plans/${planId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return null;
  } catch (error) {
    console.error('getMyPrivatePlan error:', error);
    return null;
  }
}

// POST /me/private-plans/{id}/progress
export async function updateMyPlanProgress(planId: number, data: {
  completed_items: string[];
  progress_percent?: number;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/me/private-plans/${planId}/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'İlerleme güncellenemedi.' };
  } catch (error) {
    console.error('updateMyPlanProgress error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// ==========================================
// USER DASHBOARD API FUNCTIONS (Mirror Logic)
// ==========================================

// --- MY EXPERTS ---
export interface MyExpert {
  id: number;
  relationship_id: number;
  expert: {
    id: number;
    name: string;
    title: string;
    avatar: string;
    profession: string;
  };
  status: 'pending' | 'active' | 'paused' | 'expired';
  package: {
    name: string;
    type: string;
    total: number;
    used: number;
    remaining: number;
    progress_percent: number;
    expiry_date: string | null;
  } | null;
  next_appointment: {
    date: string;
    time: string;
    title: string;
  } | null;
  unread_messages: number;
  started_at: string;
}

// GET /me/experts - Kullanıcının uzmanları
export async function getMyExperts(): Promise<MyExpert[]> {
  try {
    const response = await fetch(`${API_URL}/rejimde/v1/me/experts`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    if (json.status === 'success') {
      return json.data || [];
    }
    return [];
  } catch (error) {
    console.error('getMyExperts error:', error);
    return [];
  }
}

// --- MY PACKAGES ---
export interface MyPackage {
  id: number;
  relationship_id: number;
  expert: {
    id: number;
    name: string;
    avatar: string;
  };
  name: string;
  type: 'session' | 'duration' | 'unlimited';
  total: number | null;
  used: number;
  remaining: number | null;
  progress_percent: number;
  start_date: string;
  expiry_date: string | null;
  status: 'active' | 'expired' | 'cancelled';
}

// GET /me/packages - Kullanıcının paketleri
export async function getMyPackages(): Promise<MyPackage[]> {
  try {
    const response = await fetch(`${API_URL}/rejimde/v1/me/packages`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    if (json.status === 'success') {
      return json.data || [];
    }
    return [];
  } catch (error) {
    console.error('getMyPackages error:', error);
    return [];
  }
}

// --- MY TRANSACTIONS ---
export interface MyTransaction {
  id: number;
  date: string;
  expert: {
    id: number;
    name: string;
  };
  description: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
}

// GET /me/transactions - Kullanıcının işlem geçmişi
export async function getMyTransactions(): Promise<MyTransaction[]> {
  try {
    const response = await fetch(`${API_URL}/rejimde/v1/me/transactions`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    if (json.status === 'success') {
      return json.data || [];
    }
    return [];
  } catch (error) {
    console.error('getMyTransactions error:', error);
    return [];
  }
}

// --- MY APPOINTMENTS ---
export interface MyAppointment {
  id: number;
  expert: {
    id: number;
    name: string;
    title: string;
    avatar: string;
  };
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  type: 'online' | 'offline';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  location?: string;
  meeting_link?: string;
  notes?: string;
  can_cancel: boolean;
  can_reschedule: boolean;
}

// GET /me/appointments - Kullanıcının randevuları
export async function getMyAppointments(options?: {
  status?: string;
  limit?: number;
}): Promise<MyAppointment[]> {
  try {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', String(options.limit));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await fetch(`${API_URL}/rejimde/v1/me/appointments${queryString}`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    if (json.status === 'success') {
      return json.data || [];
    }
    return [];
  } catch (error) {
    console.error('getMyAppointments error:', error);
    return [];
  }
}

// POST /me/appointments/{id}/cancel - Randevu iptali
export async function cancelMyAppointment(appointmentId: number, reason: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_URL}/rejimde/v1/me/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    const json = await response.json();
    
    if (json.status === 'success') {
      return { success: true };
    }
    
    return { success: false, message: json.message || 'Randevu iptal edilemedi.' };
  } catch (error) {
    console.error('cancelMyAppointment error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// --- MY INBOX ---
export interface MyInboxThread {
  id: number;
  expert: {
    id: number;
    name: string;
    avatar: string;
    status: 'online' | 'offline';
  };
  subject:  string;
  last_message:  string;
  last_message_time:  string;
  is_read: boolean;
  message_count: number;
  messages?:  MyInboxMessage[];
}

export interface MyInboxMessage {
  id: number;
  sender: 'user' | 'expert';
  content: string;
  content_type: 'text' | 'image' | 'file';
  attachments?: any[];
  created_at: string;
  is_read: boolean;
}

// GET /me/inbox - Kullanıcının thread'leri
export async function getMyInboxThreads(): Promise<MyInboxThread[]> {
  try {
    const response = await fetch(`${API_URL}/rejimde/v1/me/inbox`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    if (json.status === 'success') {
      const rawData = json.data || [];
      
      // Backend şu an 'client' döndürüyor ama 'expert' olmalı
      // Geçici olarak veriyi dönüştür
      return rawData.map((thread: any) => ({
        id:  thread.id,
        // Backend 'client' gönderiyor ama aslında bu expert bilgisi olmalı
        // Eğer expert varsa onu kullan, yoksa client'ı expert olarak kullan (geçici)
        expert: thread.expert || {
          id: thread.client?. id || 0,
          name:  thread.client?.name || 'Uzman',
          avatar: thread.client?. avatar || 'https://api.dicebear.com/9.x/personas/svg? seed=default',
          status: 'offline' as const
        },
        subject: thread.subject || '',
        last_message:  thread.last_message?. content || '',
        last_message_time:  thread.last_message?. created_at || thread.created_at || '',
        is_read: thread.last_message?.is_read ??  true,
        message_count: thread. unread_count || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error('getMyInboxThreads error:', error);
    return [];
  }
}

// GET /me/inbox/{id} - Thread detayı
export async function getMyInboxThread(threadId: number): Promise<MyInboxThread | null> {
  try {
    const response = await fetch(`${API_URL}/rejimde/v1/me/inbox/${threadId}`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    if (json.status === 'success') {
      const thread = json.data?. thread || json.data;
      const messages = json.data?.messages || [];
      
      if (! thread) return null;
      
      // Thread verisini normalize et
      return {
        id: thread. id,
        expert: thread.expert || {
          id:  thread.client?. id || 0,
          name: thread.client?.name || 'Uzman',
          avatar:  thread.client?.avatar || 'https://api.dicebear.com/9.x/personas/svg? seed=default',
          status: 'offline' as const
        },
        subject: thread.subject || '',
        last_message: thread.last_message?.content || '',
        last_message_time: thread.last_message?. created_at || thread.created_at || '',
        is_read: thread.last_message?.is_read ??  true,
        message_count: thread.unread_count || 0,
        messages: messages. map((msg: any) => ({
          id:  msg.id,
          sender: msg.sender_type === 'client' ?  'user' : 'expert',
          content:  msg.content,
          content_type: msg. content_type || 'text',
          attachments: msg.attachments,
          created_at: msg.created_at,
          is_read: msg. is_read
        }))
      };
    }
    return null;
  } catch (error) {
    console.error('getMyInboxThread error:', error);
    return null;
  }
}

// POST /me/inbox/{id}/reply - Mesaj gönder
export async function sendMyInboxMessage(threadId: number, content: string, attachments?: any[]): Promise<{ success: boolean; message_id?: number }> {
  try {
    const response = await fetch(`${API_URL}/rejimde/v1/me/inbox/${threadId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, content_type: 'text', attachments }),
    });
    const json = await response.json();
    return { success: json.status === 'success', message_id: json.data?.message_id };
  } catch (error) {
    console.error('sendMyInboxMessage error:', error);
    return { success: false };
  }
}

// POST /me/inbox/new - Yeni thread oluştur
export async function createMyInboxThread(expertId: number, subject: string, content: string): Promise<{ success: boolean; thread_id?: number; message?: string; error_code?: string }> {
  try {
    const response = await fetch(`${API_URL}/rejimde/v1/me/inbox/new`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ expert_id: expertId, subject, content }),
    });
    
    const json = await response.json();
    
    // Success case
    if (response.ok && json.status === 'success') {
      return { 
        success: true, 
        thread_id: json.data?.thread_id,
        message: json.message || 'Mesajınız gönderildi!'
      };
    }
    
    // Error cases - parse backend error message
    let errorMessage = 'Mesaj gönderilemedi.';
    let errorCode = 'unknown';
    
    if (response.status === 401) {
      errorMessage = 'Mesaj göndermek için lütfen giriş yapın.';
      errorCode = 'unauthorized';
    } else if (response.status === 400) {
      // Parse backend error message for specific cases
      if (json.message) {
        errorMessage = json.message;
        if (json.message.toLowerCase().includes('relationship') || 
            json.message.toLowerCase().includes('ilişki') ||
            json.message.toLowerCase().includes('danışan')) {
          errorCode = 'no_relationship';
        }
      } else {
        errorMessage = 'Geçersiz istek. Lütfen tüm alanları doldurun.';
        errorCode = 'bad_request';
      }
    } else if (json.message) {
      errorMessage = json.message;
    }
    
    return { 
      success: false, 
      message: errorMessage,
      error_code: errorCode
    };
  } catch (error) {
    console.error('createMyInboxThread error:', error);
    return { 
      success: false, 
      message: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
      error_code: 'network_error'
    };
  }
}

// ==========================================
// MEDIA LIBRARY API FUNCTIONS
// ==========================================

export interface MediaItem {
  id: number;
  title: string;
  description?: string;
  type: 'youtube' | 'instagram' | 'spotify' | 'vimeo' | 'custom_link';
  url: string;
  thumbnail_url?: string;
  folder_id?: number;
  tags: string[];
  usage_count: number;
  created_at: string;
}

export interface MediaFolder {
  id: number;
  name: string;
  parent_id?: number;
  sort_order: number;
  item_count: number;
}

// GET /pro/media
export async function getMediaLibrary(options?: {
  type?: string;
  search?: string;
  folder_id?: number;
  limit?: number;
  offset?: number;
}): Promise<{ items: MediaItem[]; folders: MediaFolder[]; meta: { total: number } }> {
  try {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.search) params.append('search', options.search);
    if (options?.folder_id) params.append('folder_id', String(options.folder_id));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const res = await fetch(`${API_URL}/rejimde/v1/pro/media${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      return { items: [], folders: [], meta: { total: 0 } };
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      return {
        items: json.data?.items || [],
        folders: json.data?.folders || [],
        meta: json.meta || { total: 0 }
      };
    }

    return { items: [], folders: [], meta: { total: 0 } };
  } catch (error) {
    console.error('getMediaLibrary error:', error);
    return { items: [], folders: [], meta: { total: 0 } };
  }
}

// GET /pro/media/{id}
export async function getMediaItem(mediaId: number): Promise<MediaItem | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/media/${mediaId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return null;
  } catch (error) {
    console.error('getMediaItem error:', error);
    return null;
  }
}

// POST /pro/media
export async function addMediaItem(data: {
  title: string;
  description?: string;
  type: 'youtube' | 'instagram' | 'spotify' | 'vimeo' | 'custom_link';
  url: string;
  folder_id?: number;
  tags?: string[];
}): Promise<{ success: boolean; item?: MediaItem; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/media`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, item: json.data };
    }

    return { success: false, message: json.message || 'Medya eklenemedi.' };
  } catch (error) {
    console.error('addMediaItem error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// PATCH /pro/media/{id}
export async function updateMediaItem(mediaId: number, data: Partial<MediaItem>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/media/${mediaId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Medya güncellenemedi.' };
  } catch (error) {
    console.error('updateMediaItem error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// DELETE /pro/media/{id}
export async function deleteMediaItem(mediaId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/media/${mediaId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Medya silinemedi.' };
  } catch (error) {
    console.error('deleteMediaItem error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// POST /pro/media/folders
export async function createMediaFolder(data: {
  name: string;
  parent_id?: number;
}): Promise<{ success: boolean; folder?: MediaFolder; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/media/folders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, folder: json.data };
    }

    return { success: false, message: json.message || 'Klasör oluşturulamadı.' };
  } catch (error) {
    console.error('createMediaFolder error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// DELETE /pro/media/folders/{id}
export async function deleteMediaFolder(folderId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/media/folders/${folderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Klasör silinemedi.' };
  } catch (error) {
    console.error('deleteMediaFolder error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// ==========================================
// FAQ API FUNCTIONS
// ==========================================

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  is_public: boolean;
  sort_order: number;
  created_at: string;
}

// GET /pro/faq
export async function getProFAQ(): Promise<FAQItem[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/faq`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return [];

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data || [];
    }

    return [];
  } catch (error) {
    console.error('getProFAQ error:', error);
    return [];
  }
}

// GET /pro/faq/{id}
export async function getProFAQItem(faqId: number): Promise<FAQItem | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/faq/${faqId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return null;
  } catch (error) {
    console.error('getProFAQItem error:', error);
    return null;
  }
}

// POST /pro/faq
export async function createProFAQ(data: {
  question: string;
  answer: string;
  category?: string;
  is_public?: boolean;
}): Promise<{ success: boolean; item?: FAQItem; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/faq`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, item: json.data };
    }

    return { success: false, message: json.message || 'Soru eklenemedi.' };
  } catch (error) {
    console.error('createProFAQ error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// PATCH /pro/faq/{id}
export async function updateProFAQ(faqId: number, data: Partial<FAQItem>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/faq/${faqId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Soru güncellenemedi.' };
  } catch (error) {
    console.error('updateProFAQ error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// DELETE /pro/faq/{id}
export async function deleteProFAQ(faqId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/faq/${faqId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Soru silinemedi.' };
  } catch (error) {
    console.error('deleteProFAQ error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// POST /pro/faq/reorder
export async function reorderProFAQ(faqIds: number[]): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/faq/reorder`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ faq_ids: faqIds }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Sıralama güncellenemedi.' };
  } catch (error) {
    console.error('reorderProFAQ error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// GET /experts/{expertId}/faq (Public)
export async function getExpertPublicFAQ(expertId: number): Promise<FAQItem[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/experts/${expertId}/faq`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return [];

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data || [];
    }

    return [];
  } catch (error) {
    console.error('getExpertPublicFAQ error:', error);
    return [];
  }
}

// ==========================================
// ANNOUNCEMENTS API FUNCTIONS
// ==========================================

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'promo' | 'update';
  priority: number;
  start_date: string;
  end_date?: string;
  is_dismissible: boolean;
  action_url?: string;
  action_text?: string;
  created_at: string;
}

// GET /announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/announcements`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return [];

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data || [];
    }

    return [];
  } catch (error) {
    console.error('getAnnouncements error:', error);
    return [];
  }
}

// GET /announcements/{id}
export async function getAnnouncement(announcementId: number): Promise<Announcement | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/announcements/${announcementId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return null;
  } catch (error) {
    console.error('getAnnouncement error:', error);
    return null;
  }
}

// POST /announcements/{id}/dismiss
export async function dismissAnnouncement(announcementId: number): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/announcements/${announcementId}/dismiss`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    console.error('dismissAnnouncement error:', error);
    return { success: false };
  }
}

// POST /pro/announcements
export async function createAnnouncement(data: {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'promo' | 'update';
  priority?: number;
  start_date?: string;
  end_date?: string;
  is_dismissible?: boolean;
  action_url?: string;
  action_text?: string;
}): Promise<{ success: boolean; announcement?: Announcement; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, announcement: json.data };
    }

    return { success: false, message: json.message || 'Duyuru oluşturulamadı.' };
  } catch (error) {
    console.error('createAnnouncement error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// DELETE /pro/announcements/{id}
export async function deleteAnnouncement(announcementId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/announcements/${announcementId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Duyuru silinemedi.' };
  } catch (error) {
    console.error('deleteAnnouncement error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// ==========================================
// AI PLANNER API FUNCTIONS
// ==========================================

export interface AIGeneratePlanRequest {
  client_id?: number;
  plan_type: 'diet' | 'workout' | 'flow' | 'rehab' | 'habit';
  parameters: {
    goal?: string;
    duration_days?: number;
    restrictions?: string[];
    preferences?: Record<string, any>;
    additional_notes?: string;
  };
}

export interface AIGeneratePlanResponse {
  draft_plan: any;
  suggestions: string[];
  tokens_used: number;
}

export interface AIUsageStats {
  total_requests: number;
  tokens_used: number;
  limit: number;
  remaining: number;
  reset_date: string;
}

// POST /pro/ai/generate-plan
export async function generateAIPlan(data: AIGeneratePlanRequest): Promise<{ success: boolean; data?: AIGeneratePlanResponse; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/ai/generate-plan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, data: json.data };
    }

    return { success: false, message: json.message || 'Plan oluşturulamadı.' };
  } catch (error) {
    console.error('generateAIPlan error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// POST /pro/ai/generate-draft
export async function generateAIDraftMessage(data: {
  thread_id?: number;
  client_id?: number;
  context: string;
  tone?: 'professional' | 'friendly' | 'motivational';
}): Promise<{ success: boolean; draft?: string; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/ai/generate-draft`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, draft: json.data?.draft };
    }

    return { success: false, message: json.message || 'Taslak oluşturulamadı.' };
  } catch (error) {
    console.error('generateAIDraftMessage error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// POST /pro/ai/analyze-progress
export async function analyzeClientProgress(clientId: number): Promise<{ success: boolean; analysis?: { summary: string; recommendations: string[]; risk_level: string }; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/ai/analyze-progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ client_id: clientId }),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, analysis: json.data };
    }

    return { success: false, message: json.message || 'Analiz oluşturulamadı.' };
  } catch (error) {
    console.error('analyzeClientProgress error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

// GET /pro/ai/usage
export async function getAIUsage(): Promise<AIUsageStats> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/ai/usage`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      return {
        total_requests: 0,
        tokens_used: 0,
        limit: 0,
        remaining: 0,
        reset_date: new Date().toISOString()
      };
    }

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return {
      total_requests: 0,
      tokens_used: 0,
      limit: 0,
      remaining: 0,
      reset_date: new Date().toISOString()
    };
  } catch (error) {
    console.error('getAIUsage error:', error);
    return {
      total_requests: 0,
      tokens_used: 0,
      limit: 0,
      remaining: 0,
      reset_date: new Date().toISOString()
    };
  }
}

// ==========================================
// EXPERT SETTINGS & ADDRESSES API FUNCTIONS
// ==========================================

export interface ExpertAddress {
  id: number;
  title: string;
  address: string;
  city?: string;
  district?: string;
  is_default: boolean;
}

export interface ExpertSettings {
  bank_name?: string;
  iban?: string;
  account_holder?: string;
  company_name?: string;
  tax_number?: string;
  business_phone?: string;
  business_email?: string;
  addresses: ExpertAddress[];
  default_meeting_link?: string;
  auto_confirm_appointments: boolean;
}

/**
 * Get Expert Settings
 */
export async function getExpertSettings(): Promise<ExpertSettings | null> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/settings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data;
    }

    return null;
  } catch (error) {
    console.error('getExpertSettings error:', error);
    return null;
  }
}

/**
 * Update Expert Settings
 */
export async function updateExpertSettings(data: Partial<ExpertSettings>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/settings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Ayarlar güncellenemedi.' };
  } catch (error) {
    console.error('updateExpertSettings error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * Get Expert Addresses
 */
export async function getExpertAddresses(): Promise<ExpertAddress[]> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/addresses`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // Silently return empty array for any HTTP error (e.g., 404 = no addresses configured)
    if (!res.ok) return [];

    const json = await res.json();
    
    if (json.status === 'success') {
      return json.data || [];
    }

    return [];
  } catch (error) {
    // Silently return empty array on error
    return [];
  }
}

/**
 * Add Expert Address
 */
export async function addExpertAddress(data: {
  title: string;
  address: string;
  city?: string;
  district?: string;
  is_default?: boolean;
}): Promise<{ success: boolean; id?: number; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/settings/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true, id: json.data?.id };
    }

    return { success: false, message: json.message || 'Adres eklenemedi.' };
  } catch (error) {
    console.error('addExpertAddress error:', error);
    return { success: false, message: 'Adres eklenirken bir hata oluştu.' };
  }
}

/**
 * Update Expert Address
 */
export async function updateExpertAddress(id: number, data: {
  title?: string;
  address?: string;
  city?: string;
  district?: string;
  is_default?: boolean;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/addresses/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Adres güncellenemedi.' };
  } catch (error) {
    console.error('updateExpertAddress error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}

/**
 * Delete Expert Address
 */
export async function deleteExpertAddress(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/pro/addresses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    
    if (json.status === 'success') {
      return { success: true };
    }

    return { success: false, message: json.message || 'Adres silinemedi.' };
  } catch (error) {
    console.error('deleteExpertAddress error:', error);
    return { success: false, message: 'Sunucu hatası.' };
  }
}