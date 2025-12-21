// Genel API Yanıtı
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
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
    league: 'bronze' | 'silver' | 'gold' | 'sapphire';
}