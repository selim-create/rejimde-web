// Genel API Yanıtı
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Backend API Yanıt Formatı (rejimde/v1 endpoints)
export interface BackendResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    code?: string;
    error?: string;
}

// Uzman (Professional) Tipi
export interface Expert {
    id: number;
    name: string;      
    slug: string;      
    type: string;      // 'dietitian' | 'pt' | 'psychologist' | 'unclaimed' vs.
    title: string;     
    image: string;     
    rating: string;    
    score_impact: string; 
    
    // Durumlar
    is_verified: boolean; // Mavi Tik
    is_online: boolean;
    
    // YENİ EKLENEN: Hata veren kısım burasıydı
    is_featured?: boolean; // Editörün Seçimi (Sarı Yıldız)
    
    location?: string;
    brand?: string;
}

// Blog Yazısı Tipi
export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    date: string;
    author_name: string;
    image: string;
    category: string;
    read_time: string;
}

// Kullanıcı (User) Tipi
export interface User {
    id: number;
    username: string;
    email: string;
    token: string;
    score: number;
    streak: number;
    rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // Kullanıcı deneyim seviyesi (eski level)
    level: { // Puan bazlı level sistemi (eski league)
        id: string;
        name: string;
        level: number;
        slug: string;
        icon: string;
        color: string;
        description: string;
    };
}

// Diyet Planı Öğün Tipi
export interface PlanMeal {
    id: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout';
    title: string;
    time?: string;
    content: string;
    calories?: string;
    tags?: string[];
    tip?: string;
}

// Diyet Planı Günü
export interface PlanDay {
    dayNumber: number;
    meals: PlanMeal[];
}

// Diyet Planı Meta Bilgileri
export interface PlanMeta {
    difficulty?: 'easy' | 'medium' | 'hard';
    duration?: string;
    calories?: string;
    score_reward?: string;
    diet_category?: string;
    is_verified?: boolean;
    rank_math_title?: string;
    rank_math_description?: string;
    rank_math_focus_keyword?: string;
}

// Diyet Planı (Liste için)
export interface PlanListItem {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    image?: string;
    meta?: PlanMeta;
    author?: {
        name: string;
        slug: string;
        avatar?: string;
        is_expert?: boolean;
    };
    completed_count?: number;
}

// Diyet Planı (Detay için)
export interface PlanDetail extends PlanListItem {
    content: string;
    plan_data: PlanDay[];
    shopping_list: string[];
    approved_by?: {
        name: string;
        slug: string;
        avatar?: string;
    };
    completed_users?: Array<{
        name: string;
        slug: string;
        avatar?: string;
    }>;
}

// Diyet Planı (Düzenleme için)
export interface PlanEditData {
    id: number;
    title: string;
    content: string;
    status: string;
    plan_data: PlanDay[];
    shopping_list: string[];
    tags: number[];
    meta: PlanMeta;
    featured_media_id: number;
    featured_media_url: string;
}