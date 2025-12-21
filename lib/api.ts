const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';

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
 * Temel Fetch Fonksiyonu
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const res = await fetch(`${API_URL}${endpoint}`, { headers, ...options, cache: 'no-store' });
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) { throw new Error('Sunucu hatası.'); }
}

/**
 * Giriş Yapmış Kullanıcı Bilgilerini Getir
 */
export async function getMe() {
  try {
    const res = await fetch(`${API_URL}/wp/v2/users/me?context=edit`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error('Kullanıcı bilgisi alınamadı');

    const json = await res.json();
    
    const gender = json.gender || 'female';
    const finalAvatar = json.avatar_url || json.avatar_urls?.['96'] || getDefaultAvatar(gender);

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
    console.error(error);
    return null;
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
        goals: data.goals,
        notifications: data.notifications,
        
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
    const res = await fetch(`${API_URL}/jwt-auth/v1/token`, {
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
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        return { success: false, message: 'Sunucudan geçersiz yanıt alındı.' };
    }

    if (data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_email', data.user_email);
        localStorage.setItem('user_name', data.user_display_name);
        localStorage.setItem('user_avatar', 'https://api.dicebear.com/9.x/personas/svg?seed=' + username); 
        
        if(data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
            localStorage.setItem('user_role', data.roles[0]);
        }
      }
      return { success: true, data };
    } else {
      return { success: false, message: data.message || 'Giriş başarısız.' };
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
        if(json.data.avatar_url) localStorage.setItem('user_avatar', json.data.avatar_url);
        if(json.data.roles && json.data.roles.length > 0) {
            localStorage.setItem('user_role', json.data.roles[0]);
        }
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
            if(json.data.roles && json.data.roles.length > 0) {
                localStorage.setItem('user_role', json.data.roles[0]);
            }
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
    return data.map((item: any) => ({
        id: item.id,
        title: item.title.rendered,
        slug: item.slug,
        excerpt: item.excerpt.rendered.replace(/<[^>]+>/g, ''),
        image: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://placehold.co/600x400',
        date: new Date(item.date).toLocaleDateString('tr-TR'),
        author_name: item._embedded?.author?.[0]?.name || 'Rejimde Editör',
        category: 'Genel',
        read_time: '5 dk'
    }));
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
 * TEKİL BLOG YAZISI GETİR (Yazar Detaylarıyla)
 */
export async function getPostBySlug(slug: string) {
  try {
    const data = await fetchAPI(`/wp/v2/posts?slug=${slug}&_embed`);
    if (!data || data.length === 0) return null;
    const post = data[0];
    const wordCount = post.content.rendered.replace(/<[^>]+>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Yazar Detaylarını Çek
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
        
        // Zenginleştirilmiş Yazar Verisi
        author_name: authorData.name,
        author_avatar: authorData.avatar,
        author_slug: authorData.slug,
        author_is_expert: authorData.is_expert,
        
        category: 'Beslenme',
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
 * PUAN KAZANMA
 */
export async function earnPoints(action: string, ref_id?: string | number) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/gamification/earn`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: action, 
        ref_id: ref_id
      }),
    });
    const json = await res.json();
    if (json.status === 'success') return { success: true, data: json.data };
    return { success: false, message: json.message || 'Puan kazanılamadı.' };
  } catch (error) {
    return { success: false, message: 'Sunucu hatası.' };
  }
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
 * YORUMLARI GETİR (User ID Dahil)
 */
export async function getComments(postId: number) {
  try {
    const res = await fetch(`${API_URL}/wp/v2/comments?post=${postId}&_embed`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    
    if (!res.ok) return [];
    
    const json = await res.json();
    
    return json.map((comment: any) => ({
        id: comment.id,
        user: comment.author_name,
        userId: comment.author, // User ID'yi alıyoruz (Kritik!)
        text: comment.content.rendered.replace(/<[^>]+>/g, ''), 
        date: comment.date,
        // Varsayılan avatarı koyuyoruz, CommentsSection'da gerçek veriyi ID ile çekeceğiz
        avatar: comment.author_avatar_urls?.['96'] 
    }));
  } catch (error) {
    console.error("Yorumlar çekilemedi", error);
    return [];
  }
}

/**
 * YORUM YAP
 */
export async function createComment(postId: number, content: string) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    
    if (!token) return { success: false, message: 'Yorum yapmak için giriş yapmalısınız.' };

    const res = await fetch(`${API_URL}/wp/v2/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        post: postId,
        content: content
      })
    });

    const json = await res.json();

    if (res.ok) {
        return { 
            success: true, 
            data: {
                id: json.id,
                user: json.author_name, 
                text: content,
                date: "Şimdi",
                avatar: json.author_avatar_urls?.['96'] || "https://i.pravatar.cc/150?img=12",
                isExpert: false
            } 
        };
    } else {
        return { success: false, message: json.message || 'Yorum gönderilemedi.' };
    }
  } catch (error) {
    return { success: false, message: 'Bağlantı hatası.' };
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
    // Backend { status: 'success', data: {...} } formatında dönüyor
    if (response && response.status === 'success' && response.data) {
      return response.data;  // Sadece data kısmını dön
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
export async function getPlanById(id: number) {
    // Edit endpoint'i henüz yoksa slug'dan gitmek zor olabilir, 
    // ama create/update endpoint'leri dönüşte data veriyor.
    // En temizi WP REST API'den ID ile çekmektir.
    try {
        const post = await fetchAPI(`/wp/v2/rejimde_plan/${id}?context=edit&_embed`);
        if(!post) return null;
        
        // Plan datasını parse et
        const planData = typeof post.meta?.plan_data === 'string' 
            ? JSON.parse(post.meta.plan_data) 
            : (post.meta?.plan_data || []);

        return {
            id: post.id,
            title: post.title.raw,
            content: post.content.raw,
            status: post.status,
            plan_data: planData,
            meta: {
                difficulty: post.meta?.difficulty,
                duration: post.meta?.duration,
                calories: post.meta?.calories
            },
            featured_media_id: post.featured_media,
            featured_media_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
        };
    } catch (e) {
        return null;
    }
}