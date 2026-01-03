"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getExpertBySlug, getExpertPublicServices, toggleFollow, getBlogPosts, getPlans, getExercisePlans, type Service } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import MascotDisplay from "@/components/MascotDisplay";
import ExpertReviewsContainer from "@/components/expert-reviews/ExpertReviewsContainer";
import AppointmentRequestModal from "@/components/AppointmentRequestModal";
import AskQuestionModal from "@/components/AskQuestionModal";
import ServiceRequestModal from "@/components/ServiceRequestModal";
import RejiScore from "@/components/RejiScore";
import { trackProfileView } from "@/lib/api-profile-views";
import { 
  EXPERTISE_TAGS, 
  GOAL_TAGS, 
  AGE_GROUP_OPTIONS, 
  LANGUAGE_OPTIONS,
  COUNTRY_OPTIONS,
  EXCLUDED_CASES_OPTIONS,
  getExpertStyle,
  getProfessionLabel,
  PROFESSION_CATEGORIES
} from "@/lib/constants";
import { renderContent } from "@/lib/markdown-utils";

// API'den gelecek detaylı uzman tipi - Güncellenmiş
interface ExpertDetail {
    id: number;
    name: string;
    slug: string;
    type: string;
    title: string;
    image:  string;
    rating: string;
    profession?:  string;  // Kategori: dietitian, pt, doctor (değişmez)
    phone?: string;       // Görünürlüğe göre boş olabilir
    score_impact: string;
    is_verified: boolean;
    is_featured?:  boolean;
    is_online?: boolean;  // Online/offline status
    location?:  string;
    brand?: string;
    bio?: string;
    is_claimed?: boolean;
    
    /** User ID fields returned from backend (related_user_id is preferred, user_id is fallback) */
    related_user_id?: number;   // User ID from backend (primary field)
    user_id?: number;           // User ID from backend (alternative field name)
    
    // Kimlik & Profil
    motto?:  string;
    
    // Lokasyon
    country?: string;
    city?: string;
    district?: string;
    address?: string;
    
    // Hizmet & Dil
    service_languages?: string[];
    
    // Mesleki Deneyim
    career_start_date?:  string;
    education?: Array<{ school: string; department: string; year: string }>;
    certificates?: Array<{ name: string; institution: string; year:  string }>;
    
    // Uzmanlık & Etiketler
    expertise_tags?: string[];
    goal_tags?: string[];
    level_suitability?: string[];
    age_groups?: string[];
    
    // Danışan Bilgileri
    client_type?: string;
    
    // Çalışmadığı Durumlar
    excluded_cases?: string[];
    referral_note?: string;
    
    // Çalışma & İletişim
    working_hours?: { weekday: string; weekend: string };
    response_time?: string;
    communication_preference?: string[];
    
    // Eski alanlar (geriye uyumluluk)
    branches?: string;
    services?: string;
    client_types?: string;
    consultation_types?: string;
    
    // İstatistikler
    client_count?: string;
    experience?:  string;
    
    // RejiScore alanları
    reji_score?: number;
    trust_score?: number;
    contribution_score?: number;
    freshness_score?: number;
    trend_percentage?: number;
    score_level?: string;
    score_level_label?: string;
    review_count?: number;
    content_count?: number;
    
    // Social fields
    followers_count?: number;
    following_count?: number;
    is_following?: boolean;
}

// Helper:  Deneyim yılını hesapla
const calculateExperienceYears = (startDate: string | undefined): string => {
    if (!startDate) return "1+ Yıl";
    const start = new Date(startDate);
    const today = new Date();
    let years = today.getFullYear() - start.getFullYear();
    const monthDiff = today. getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today. getDate() < start.getDate())) years--;
    if (years < 1) return "1 Yıldan Az";
    return `${years}+ Yıl`;
};

// Helper: Tag ID'den Label al
const getTagLabel = (id: string, tagList: Array<{ id: string; label:  string }>): string => {
    return tagList.find(t => t.id === id)?.label || id;
};

// Helper: Çalışmadığı durumlar ID'den Label al
const getExcludedCaseLabel = (caseId: string): string => {
    return EXCLUDED_CASES_OPTIONS.find(c => c.id === caseId)?.label || caseId;
};

// Helper: Yanıt süresi formatla
const formatResponseTime = (time: string | undefined): string => {
    const map:  Record<string, string> = {
        '1h': '1 Saat',
        '24h': '24 Saat',
        '48h': '48 Saat',
        '3d': '3 Gün'
    };
    return map[time || '24h'] || '24 Saat';
};

// Helper: Danışan metodu ikonu
const getCommunicationIcon = (pref: string): string => {
    const map: Record<string, string> = {
        'message': 'fa-message',
        'video': 'fa-video',
        'face': 'fa-people-arrows',
        'both': 'fa-comments'
    };
    return map[pref] || 'fa-comments';
};

// Helper: Meslek prefix'ini al
const getProfessionPrefix = (profession: string | undefined): string => {
    if (!profession) return '';
    for (const cat of PROFESSION_CATEGORIES) {
        const item = cat.items.find(i => i.id === profession || profession.includes(i.id));
        if (item && item.prefix) return item.prefix;
    }
    return '';
};

// Helper: Danışan metodu label
const getCommunicationLabel = (pref: string): string => {
    const map: Record<string, string> = {
        'message':  'Yazılı Mesaj',
        'video': 'Video Görüşme',
        'face': 'Yüz Yüze',
        'both':  'Her İkisi'
    };
    return map[pref] || pref;
};

export default function ExpertProfilePage() {
  const params = useParams();
  const [expert, setExpert] = useState<ExpertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAskQuestionModal, setShowAskQuestionModal] = useState(false);
  
  // Follow functionality
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Service request modal
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Expert content
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [exercisePlans, setExercisePlans] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  const rawSlug = params?. slug 
    ? (Array.isArray(params.slug) ? params.slug[0] : params.slug) 
    : "";
  const slug = decodeURIComponent(rawSlug);

  useEffect(() => {
    async function fetchExpert() {
        if (!slug) return;
        setLoading(true);
        setNotFound(false);

        try {
            const data = await getExpertBySlug(slug);
            
            if (data) {
                const isClaimedRaw = (data as any).is_claimed;
                const isClaimed = isClaimedRaw === true || isClaimedRaw === '1' || isClaimedRaw === 1;
                
                // JSON alanlarını parse et
                const parseJsonField = (field: any, fallback: any) => {
                    if (! field) return fallback;
                    if (typeof field === 'string') {
                        try { return JSON.parse(field); } catch { return fallback; }
                    }
                    return field;
                };

                setExpert({
                    ...data,
                    is_claimed: isClaimed,
                    image: data.image && data.image !== 'https://placehold.co/150' && data.image !== 'https://placehold.co/300'
                            ? data.image 
                            : `https://api.dicebear.com/9.x/personas/svg?seed=${data.slug}`,
                    client_count: (data as any).client_count || 0,
                    experience: calculateExperienceYears((data as any).career_start_date),
                    response_time: (data as any).response_time || '24h',
                    // JSON alanları parse
                    expertise_tags: parseJsonField((data as any).expertise_tags, []),
                    goal_tags: parseJsonField((data as any).goal_tags, []),
                    age_groups: parseJsonField((data as any).age_groups, []),
                    level_suitability: parseJsonField((data as any).level_suitability, []),
                    service_languages: parseJsonField((data as any).service_languages, ['tr']),
                    communication_preference: parseJsonField((data as any).communication_preference, []),
                    working_hours: parseJsonField((data as any).working_hours, { weekday: '', weekend: '' }),
                    education: parseJsonField((data as any).education, []),
                    certificates: parseJsonField((data as any).certificates, []),
                    excluded_cases: parseJsonField((data as any).excluded_cases, []),
                });
                
                // Initialize follow states
                setIsFollowing((data as any).is_following || false);
                setFollowersCount((data as any).followers_count || 0);
                
                // Track profile view for claimed profiles
                if (isClaimed) {
                    trackProfileView(slug);
                }
                
                // Load expert's services
                // Use user_id instead of post ID (data.id)
                // Try related_user_id first (primary field), then user_id (fallback)
                const userId = data?.related_user_id ?? data?.user_id;
                if (userId) {
                    const servicesData = await getExpertPublicServices(userId);
                    // Filter only active services
                    setServices(servicesData.filter(s => s.is_active));
                    
                    // Load expert's content (blogs, diet plans, exercises)
                    if (isClaimed) {
                        loadExpertContent(userId);
                    }
                } else {
                    console.warn('Expert user ID (related_user_id or user_id) not found in response. Services cannot be loaded. Post ID:', data.id);
                }
            } else {
                setNotFound(true);
            }
        } catch (error) {
            console.error("Uzman detayı hatası:", error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }
    
    async function loadExpertContent(userId: number) {
        setContentLoading(true);
        try {
            const [posts, plans, exercises] = await Promise.all([
                getBlogPosts(userId),
                getPlans(undefined, undefined, userId),
                getExercisePlans(undefined, undefined, userId)
            ]);
            
            setBlogPosts(posts || []);
            setDietPlans(plans || []);
            setExercisePlans(exercises || []);
        } catch (error) {
            console.error("Expert content loading error:", error);
        } finally {
            setContentLoading(false);
        }
    }

    fetchExpert();
  }, [slug]);

  // Handle follow toggle
  const handleFollow = async () => {
    if (!expert) return;
    const userId = expert.related_user_id ?? expert.user_id;
    if (!userId) return;
    
    setActionLoading(true);
    const res = await toggleFollow(userId);
    
    if (res && res.success) {
        setIsFollowing(res.is_following);
        setFollowersCount(res.followers_count);
    }
    setActionLoading(false);
  };
  
  // Handle service request modal
  const handleRequestService = (service: Service) => {
    setSelectedService(service);
    setShowServiceRequestModal(true);
  };

  // Yükleniyor
  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20">
              <div className="animate-spin text-rejimde-green text-4xl mb-4"><i className="fa-solid fa-circle-notch"></i></div>
              <p className="text-gray-500 font-bold">Uzman bilgileri yükleniyor...</p>
          </div>
      );
  }

  // Bulunamadı
  if (notFound || ! expert) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20 text-center px-4">
              <MascotDisplay state="cheat_meal_detected" size={200} showBubble={false} />
              <h1 className="text-2xl font-black text-gray-700 mt-6 mb-2">Uzman Bulunamadı</h1>
              <p className="text-gray-500 font-bold mb-6 max-w-md">Aradığınız uzman sistemde kayıtlı değil veya yayından kaldırılmış olabilir.</p>
              <Link href="/experts" className="bg-rejimde-blue text-white px-6 py-3 rounded-xl font-extrabold shadow-btn btn-game inline-block">Listeye Dön</Link>
          </div>
      );
  }

  // --- SENARYO 1: ONAYSIZ / SAHİPLENİLMEMİŞ PROFİL ---
  if (! expert.is_claimed) {
    return (
      <div className="min-h-screen pb-20 bg-gray-50 font-sans text-rejimde-text">
        
        {/* CLAIM BANNER */}
        <div className="bg-rejimde-blue text-white py-3 sticky top-20 z-40 shadow-md">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <i className="fa-solid fa-circle-info text-2xl animate-pulse"></i>
                    <div>
                        <p className="font-extrabold text-sm uppercase">Bu Profil Sizin mi?</p>
                        <p className="text-xs font-bold text-blue-100 hidden md:block">Profilinizi sahiplenin, bilgilerinizi güncelleyin ve danışan kabul etmeye başlayın. </p>
                    </div>
                </div>
                <Link href="/register/pro" className="bg-white text-rejimde-blue px-6 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-blue-900/20 btn-game uppercase hover:bg-blue-50 whitespace-nowrap">
                    Profili Yönet
                </Link>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN */}
                <div className="lg:col-span-4">
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-0 sticky top-40 overflow-hidden shadow-card opacity-90">
                        <div className="h-32 bg-gray-200 relative">
                            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-md bg-gray-100 flex items-center justify-center text-gray-300 text-5xl overflow-hidden">
                                        <i className="fa-solid fa-user"></i>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-400 border-4 border-white rounded-full flex items-center justify-center" title="Pasif">
                                        <i className="fa-solid fa-minus text-white text-xs"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-20 pb-8 px-6 text-center">
                            <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                                <i className="fa-solid fa-shield-cat"></i> Onaylanmamış Hesap
                            </div>

                           {/* İsim ve Ünvan */}
                            <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
                                {expert.title && <span className="text-gray-500">{expert.title} </span>}
                                {expert.name}
                            </h1>

                            {/* Meslek Kategorisi */}
                            <p className="text-gray-400 font-bold text-sm mb-2">
                                {getProfessionLabel(expert.profession || expert.type || 'dietitian')}
                                {expert.brand && ` • ${expert.brand}`}
                            </p>
                            <p className="text-gray-400 font-bold text-sm mb-4">{expert.location || 'Konum Belirtilmemiş'}</p>

                            <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
                                <div className="flex text-gray-300 text-xs">
                                    <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                                </div>
                                <span className="font-extrabold text-gray-400">0. 0</span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="relative group cursor-not-allowed">
                                    <button className="bg-gray-200 text-gray-400 w-full py-3 rounded-xl font-extrabold text-lg uppercase tracking-wide flex items-center justify-center gap-2 pointer-events-none">
                                        <i className="fa-solid fa-lock"></i> Randevu Al
                                    </button>
                                </div>
                                
                                <button className="bg-white border-2 border-rejimde-green text-rejimde-green w-full py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:bg-green-50 flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-envelope-open-text text-lg"></i> Rejimde&apos;ye Davet Et
                                </button>
                                <p className="text-[10px] text-gray-400 font-bold mt-1">
                                    *Bu uzmanı davet et, <span className="text-rejimde-green">+50 Puan</span> kazan! 
                                </p>
                            </div>
                        </div>

                        {/* Contact Info (Blurred) */}
                        <div className="bg-gray-50 border-t-2 border-gray-100 p-6 text-center relative overflow-hidden">
                            <div className="blur-sm select-none pointer-events-none space-y-2 opacity-50">
                                <p className="text-gray-800 font-bold">+90 532 123 ** **</p>
                                <p className="text-gray-800 font-bold">hidden@email.com</p>
                                <p className="text-gray-800 font-bold">{expert.location || 'Adres Gizli'}... </p>
                            </div>
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
                                <i className="fa-solid fa-eye-slash text-gray-400 text-2xl mb-2"></i>
                                <span className="text-xs font-black text-gray-500 uppercase">İletişim Bilgileri Gizli</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN:  Empty States */}
                <div className="lg: col-span-8 space-y-8">
                    
                    {/* Empty Stats */}
                    <div className="bg-white border-2 border-gray-200 border-dashed rounded-3xl p-8 text-center relative overflow-hidden group hover:border-rejimde-blue transition">
                        <i className="fa-solid fa-chart-simple text-6xl text-gray-200 mb-4 group-hover:text-rejimde-blue transition transform group-hover:scale-110 duration-300"></i>
                        <h2 className="text-xl font-extrabold text-gray-400 mb-2">İstatistik Yok</h2>
                        <p className="text-gray-400 font-bold text-sm max-w-md mx-auto mb-6">
                            Bu uzman henüz Rejimde Ligi&apos;ne katılmadığı için danışan başarı oranları ve skor etkileri görüntülenemiyor.
                        </p>
                        
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-lg mx-auto flex items-start gap-4 text-left">
                            <div className="w-10 h-10 bg-rejimde-blue rounded-full flex items-center justify-center text-white shrink-0 font-bold text-xl">? </div>
                            <div>
                                <p className="font-extrabold text-rejimde-blueDark text-sm uppercase mb-1">{expert.name} misiniz?</p>
                                <p className="text-xs text-blue-600 font-bold">
                                    Profilinizi ücretsiz sahiplenerek danışanlarınızın Rejimde Skorlarını yönetmeye başlayabilirsiniz. 
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder About */}
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 opacity-70">
                        <h2 className="text-xl font-extrabold text-gray-400 mb-4 uppercase">Hakkında</h2>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 mt-4 italic">
                            *Uzman henüz biyografi eklemedi. 
                        </p>
                    </div>

                    {/* Locked Services */}
                    <div className="relative overflow-hidden rounded-3xl">
                        <h2 className="text-xl font-extrabold text-gray-400 mb-6 px-2 uppercase">Hizmet Paketleri</h2>
                        
                        <div className="grid grid-cols-1 md: grid-cols-2 gap-6 blur-sm opacity-50 pointer-events-none select-none">
                            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
                                 <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 top-12">
                            <div className="bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-xl text-center max-w-sm">
                                <i className="fa-solid fa-lock text-rejimde-yellow text-4xl mb-3"></i>
                                <h3 className="font-extrabold text-gray-700 text-lg mb-2">Paketler Görüntülenemiyor</h3>
                                <p className="text-xs text-gray-500 font-bold mb-4">
                                    Bu uzman henüz online randevu sistemini aktifleştirmedi.
                                </p>
                                <button className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-sm uppercase shadow-btn shadow-gray-800 btn-game">
                                    Uzmanı Davet Et
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- SENARYO 2: ONAYLI / AKTİF PROFİL ---
  // Compute style and prefix once for the profile card
  const expertStyle = getExpertStyle(expert.profession || expert.type);
  const expertPrefix = getProfessionPrefix(expert.profession || expert.type);
  const displayName = expertPrefix ? `${expertPrefix} ${expert.name}` : expert.name;
  
  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
        
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                <Link href="/experts" className="hover:text-rejimde-blue transition">Uzmanlar</Link>
                <i className="fa-solid fa-chevron-right text-xs"></i>
                <span className="text-rejimde-text">{expert.name}</span>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN:  Profile Card (Sticky) */}
                <div className="lg:col-span-4">
                    <div className={`bg-white rounded-[2rem] border-2 ${expertStyle.border} shadow-[0_6px_0_rgba(0,0,0,0.08)] relative group overflow-hidden transition-transform hover:-translate-y-1 sticky top-24`}>
                        
                        {/* Uzman Ribbon */}
                        <div className={`absolute top-0 right-0 ${expertStyle?.btnMain || 'bg-indigo-500 text-white'} text-[10px] font-black px-4 py-1.5 rounded-bl-2xl z-20 border-b-2 border-l-2 border-black/10 shadow-sm uppercase tracking-wider`}>
                            UZMAN
                        </div>
                        
                        {/* Header Pattern */}
                        <div className={`h-24 ${expertStyle.bg} w-full relative overflow-hidden`}>
                            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine"></div>
                            <i className={`fa-solid ${expertStyle.decorationIcon} ${expertStyle.iconColor} text-7xl absolute -bottom-4 -right-2 rotate-12 opacity-30`}></i>
                            <i className={`fa-solid ${expertStyle.decorationIcon} ${expertStyle.iconColor} text-5xl absolute top-2 left-4 -rotate-12 opacity-30`}></i>
                        </div>

                        {/* Avatar & Info */}
                        <div className="px-6 relative -mt-12 text-center z-10">
                            <div className="relative inline-block group-hover:scale-105 transition-transform duration-300">
                                <img src={expert.image} alt={expert.name} className="w-24 h-24 rounded-full border-[4px] border-white shadow-md object-cover bg-white" />
                                {/* Online/Offline Status */}
                                <div className={`absolute bottom-0 right-0 w-7 h-7 ${expert.is_online ? 'bg-rejimde-green' : 'bg-gray-400'} border-2 border-white rounded-full flex items-center justify-center shadow-sm`} title={expert.is_online ? 'Online' : 'Offline'}>
                                    <i className={`fa-solid ${expert.is_online ? 'fa-check' : 'fa-minus'} text-white text-xs`}></i>
                                </div>
                            </div>
                            
                            <div className="mt-2">
                                <h1 className="text-xl font-extrabold text-gray-800 leading-tight">
                                    {displayName}
                                </h1>
                                {/* Dinamik Meslek Badge */}
                                <span className={`inline-flex items-center gap-1.5 ${expertStyle?.badgeBg || 'bg-gray-100'} ${expertStyle?.text || 'text-gray-700'} text-[10px] font-black px-3 py-1 rounded-full border-b-2 border-black/5 mt-2 uppercase tracking-wider`}>
                                    <i className={`fa-solid ${expertStyle.decorationIcon}`}></i>
                                    {getProfessionLabel(expert.profession || expert.type) || expert.title || 'Rejimde Uzmanı'}
                                </span>
                                
                                {/* Onaylı Badge */}
                                {expert.is_verified && (
                                    <div className="inline-flex items-center gap-1 bg-blue-50 text-rejimde-blue border border-blue-100 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mt-2">
                                        <i className="fa-solid fa-certificate"></i> Onaylı
                                    </div>
                                )}
                            </div>
                            
                            {/* Motto */}
                            {expert.motto && (
                                <p className="text-gray-500 text-sm italic mt-3 px-2">&quot;{expert.motto}&quot;</p>
                            )}

                            {/* Lokasyon */}
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-3">
                                <i className="fa-solid fa-location-dot text-rejimde-green"></i>
                                <span className="font-bold">
                                    {expert.country && expert.country !== 'TR' 
                                        ?  `${expert.city || ''}, ${COUNTRY_OPTIONS.find(c => c.id === expert.country)?.label || expert.country}`
                                        : expert.location || `${expert.city || ''}, ${expert.district || ''}`
                                    }
                                </span>
                            </div>

                            {/* RejiScore */}
                            <RejiScore
                                score={expert.reji_score || 50}
                                trustScore={expert.trust_score || 50}
                                contributionScore={expert.contribution_score || 50}
                                freshnessScore={expert.freshness_score || 50}
                                isVerified={expert.is_verified}
                                userRating={parseFloat(expert.rating) || 0}
                                reviewCount={expert.review_count || 0}
                                contentCount={expert.content_count || 0}
                                trendPercentage={expert.trend_percentage || 0}
                                className="mt-4"
                            />
                            
                            {/* Hizmet Dilleri */}
                            {expert.service_languages && expert.service_languages.length > 0 && (
                                <div className="flex justify-center gap-2 mt-3">
                                    {expert.service_languages.map(langId => {
                                        const lang = LANGUAGE_OPTIONS.find(l => l.id === langId);
                                        return lang ? (
                                            <span key={langId} className="text-lg" title={lang.label}>{lang.flag}</span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Stats Grid with Icon Boxes */}
                        <div className="grid grid-cols-3 gap-2 px-4 py-5 text-center mt-2">
                            {/* RejiScore */}
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center mb-1 text-sm shadow-sm">
                                    <i className="fa-solid fa-chart-simple"></i>
                                </div>
                                <span className="font-black text-gray-700 text-sm">{expert.reji_score || '--'}</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">RejiScore</span>
                            </div>
                            
                            {/* Danışan Sayısı */}
                            <div className="flex flex-col items-center border-l border-r border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-1 text-sm shadow-sm">
                                    <i className="fa-solid fa-users"></i>
                                </div>
                                <span className="font-black text-gray-700 text-sm">{expert.client_count || 0}</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Danışan</span>
                            </div>
                            
                            {/* Takipçi Sayısı */}
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center mb-1 text-sm shadow-sm">
                                    <i className="fa-solid fa-heart"></i>
                                </div>
                                <span className="font-black text-gray-700 text-sm">{followersCount}</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Takipçi</span>
                            </div>
                        </div>

                        {/* Actions with 3D Button Effects */}
                        <div className="px-6 pb-6 space-y-3 mt-4">
                            <button 
                                onClick={() => setShowRequestModal(true)}
                                className={`w-full font-bold py-3 rounded-2xl border-b-[4px] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase text-sm shadow-md ${expertStyle?.btnMain || 'bg-indigo-500 hover:bg-indigo-600 border-indigo-700 text-white'}`}
                            >
                                <i className="fa-solid fa-calendar-check text-base"></i>
                                Randevu Al
                            </button>
                            
                            <button 
                                onClick={() => setShowAskQuestionModal(true)}
                                className="w-full font-bold py-3 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs bg-white text-gray-500 border-gray-200 hover:text-gray-700"
                            >
                                <i className="fa-regular fa-message"></i>
                                Soru Sor
                            </button>
                            
                            <button 
                                onClick={handleFollow}
                                disabled={actionLoading}
                                className={`w-full font-bold py-3 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs ${isFollowing ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200' : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700'} ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <i className={`fa-solid ${isFollowing ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                                {isFollowing ? 'Takipten Çık' : 'Takip Et'}
                            </button>
                            
                            {/* Extra Info */}
                            <div className="flex justify-between items-center px-2 pt-1 text-[10px] font-bold text-gray-400">
                                <span>{expert.experience ? `${expert.experience} Tecrübe` : ''}</span>
                                <span>{formatResponseTime(expert.response_time)} Yanıt</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Content */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 1.  GAMIFIED STATS */}
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rejimde-yellow opacity-10 rounded-full -mr-10 -mt-10"></div>
                        
                        <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-trophy text-rejimde-yellow"></i>
                            BAŞARI İSTATİSTİKLERİ
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* 1. RejiScore */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 text-center border-2 border-transparent hover:border-indigo-300 transition">
                                <div className="w-10 h-10 mx-auto bg-white rounded-xl flex items-center justify-center text-indigo-500 text-xl shadow-sm mb-2">
                                    <i className="fa-solid fa-chart-simple"></i>
                                </div>
                                <div className="text-2xl font-black text-gray-800">{expert.reji_score || 50}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">RejiScore</div>
                            </div>
                            
                            {/* 2. Trend (Son Dönem İlgi) */}
                            <div className={`rounded-2xl p-4 text-center border-2 border-transparent transition ${
                                (expert.trend_percentage || 0) > 0 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300' 
                                    : (expert.trend_percentage || 0) < 0 
                                        ? 'bg-gradient-to-br from-red-50 to-orange-50 hover:border-red-300'
                                        : 'bg-gradient-to-br from-orange-50 to-red-50 hover:border-orange-300'
                            }`}>
                                <div className={`w-10 h-10 mx-auto bg-white rounded-xl flex items-center justify-center text-xl shadow-sm mb-2 ${
                                    (expert.trend_percentage || 0) > 0 ? 'text-green-500' : (expert.trend_percentage || 0) < 0 ? 'text-red-500' : 'text-orange-500'
                                }`}>
                                    <i className={`fa-solid ${(expert.trend_percentage || 0) > 0 ? 'fa-arrow-trend-up' : (expert.trend_percentage || 0) < 0 ? 'fa-arrow-trend-down' : 'fa-fire'}`}></i>
                                </div>
                                <div className={`text-2xl font-black ${
                                    (expert.trend_percentage || 0) > 0 ? 'text-green-600' : (expert.trend_percentage || 0) < 0 ? 'text-red-600' : 'text-orange-500'
                                }`}>
                                    {(expert.trend_percentage || 0) > 0 ? '+' : ''}{expert.trend_percentage || 0}%
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Son 7 Gün</div>
                            </div>
                            
                            {/* 3. Değerlendirme (Yorum yerine) */}
                            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-4 text-center border-2 border-transparent hover:border-yellow-300 transition">
                                <div className="w-10 h-10 mx-auto bg-white rounded-xl flex items-center justify-center text-yellow-500 text-xl shadow-sm mb-2">
                                    <i className="fa-solid fa-star"></i>
                                </div>
                                <div className="text-2xl font-black text-gray-800">{expert.review_count || 0}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Değerlendirme</div>
                            </div>
                            
                            {/* 4. Katkı (İçerik yerine) */}
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 text-center border-2 border-transparent hover:border-purple-300 transition">
                                <div className="w-10 h-10 mx-auto bg-white rounded-xl flex items-center justify-center text-purple-500 text-xl shadow-sm mb-2">
                                    <i className="fa-solid fa-brain"></i>
                                </div>
                                <div className="text-2xl font-black text-gray-800">{expert.content_count || 0}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Katkı</div>
                            </div>
                        </div>

                        {/* Alt Detay Barları */}
                        <div className="mt-6 space-y-3">
                            {/* Trust Score Bar */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                        <i className="fa-solid fa-heart text-red-400"></i> Kullanıcı Memnuniyeti
                                    </span>
                                    <span className="text-xs font-black text-gray-700">{expert.trust_score || 50}/100</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-red-400 to-pink-500 rounded-full transition-all duration-500" 
                                        style={{ width: `${expert.trust_score || 50}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            {/* Contribution Score Bar */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                        <i className="fa-solid fa-brain text-purple-500"></i> Uzman Katkısı
                                    </span>
                                    <span className="text-xs font-black text-gray-700">{expert.contribution_score || 50}/100</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500" 
                                        style={{ width: `${expert.contribution_score || 50}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            {/* Freshness Score Bar */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                        <i className="fa-solid fa-fire text-orange-500"></i> Son Dönem Aktivite
                                    </span>
                                    <span className="text-xs font-black text-gray-700">{expert.freshness_score || 50}/100</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-500" 
                                        style={{ width: `${expert.freshness_score || 50}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Onay Bonusu Badge */}
                        {expert.is_verified && (
                            <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-bold">
                                <i className="fa-solid fa-circle-check"></i>
                                <span>Onaylı Uzman Bonusu: +20 puan</span>
                            </div>
                        )}

                        {/* Mascot Tip - Dinamik mesaj */}
                        <div className="mt-6 flex items-start gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <MascotDisplay state="success_milestone" size={48} showBubble={false} className="shrink-0" />
                            <div>
                                <p className="font-bold text-rejimde-blueDark text-sm leading-relaxed">
                                    {(expert.trend_percentage || 0) > 10 
                                        ? `"${expert.name} son günlerde çok popüler! 🔥 İlgi %${expert.trend_percentage} arttı!"`
                                        : (expert.review_count || 0) > 10
                                            ? `"${expert.name} ile çalışanlar çok memnun! ${expert.review_count} danışan değerlendirme bırakmış. 👏"`
                                            : `"${expert.name} ile çalışanlar, disiplinli ama eğlenceli bir süreç geçiriyor. Skor artışı garanti! 😉"`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. HAKKINDA & BİYOGRAFİ */}
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                        <h2 className="text-xl font-extrabold text-gray-800 mb-4 uppercase tracking-wide">HAKKINDA</h2>
                        {expert.bio ?  (
                            <div 
                                className="text-gray-500 font-medium leading-relaxed mb-6 prose prose-sm max-w-none
                                           prose-strong:text-gray-700 prose-em:text-gray-600 
                                           prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4"
                                dangerouslySetInnerHTML={{ __html: renderContent(expert.bio) }}
                            />
                        ) : (
                            <p className="text-gray-400 italic mb-6">Uzman henüz biyografisini eklememiş.</p>
                        )}
                    </div>

                    {/* 3. UZMANLIK ALANLARI */}
                    {expert.expertise_tags && expert.expertise_tags.length > 0 && (
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                            <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-tags text-rejimde-purple"></i>
                                UZMANLIK ALANLARI
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {expert.expertise_tags.map(tagId => (
                                    <span 
                                        key={tagId} 
                                        className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-sm font-bold"
                                    >
                                        {getTagLabel(tagId, EXPERTISE_TAGS)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. ÇALIŞTIĞI HEDEFLER */}
                    {expert.goal_tags && expert.goal_tags.length > 0 && (
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                            <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-bullseye text-rejimde-blue"></i>
                                ÇALIŞTIĞI HEDEFLER
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {expert.goal_tags.map(tagId => {
                                    const tag = GOAL_TAGS.find(t => t.id === tagId);
                                    return tag ? (
                                        <div 
                                            key={tagId} 
                                            className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl"
                                        >
                                            <i className={`fa-solid ${tag.icon} text-rejimde-blue text-lg`}></i>
                                            <span className="text-sm font-bold text-gray-700">{tag.label}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {/* 5. YAŞ GRUPLARI & DANIŞAN TİPİ */}
                    {(expert.age_groups && expert.age_groups.length > 0) || expert.client_type ?  (
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                            <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-users text-rejimde-teal"></i>
                                DANIŞAN PROFİLİ
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Danışan Türü */}
                                {expert.client_type && (
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Danışan Türü</h4>
                                        <span className="inline-block px-4 py-2 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl text-sm font-bold capitalize">
                                            {expert.client_type === 'woman' ? 'Kadın' : 
                                             expert. client_type === 'man' ? 'Erkek' : 
                                             expert.client_type === 'child' ?  'Çocuk' : 'Hepsi'}
                                        </span>
                                    </div>
                                )}

                                {/* Yaş Grupları */}
                                {expert.age_groups && expert. age_groups.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Çalıştığı Yaş Grupları</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {expert.age_groups.map(groupId => {
                                                const group = AGE_GROUP_OPTIONS.find(g => g.id === groupId);
                                                return group ? (
                                                    <span 
                                                        key={groupId} 
                                                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold"
                                                    >
                                                        {group.label} ({group.range})
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* 6. ÇALIŞMA & İLETİŞİM */}
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                        <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-clock text-rejimde-green"></i>
                            ÇALIŞMA & İLETİŞİM
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Danışan Metodları */}
                            {expert.communication_preference && expert.communication_preference. length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Danışan Metodları</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {expert.communication_preference.map(pref => (
                                            <span 
                                                key={pref} 
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-100 rounded-xl text-sm font-bold"
                                            >
                                                <i className={`fa-solid ${getCommunicationIcon(pref)}`}></i>
                                                {getCommunicationLabel(pref)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Yanıt Süresi */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Ortalama Yanıt Süresi</h4>
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-bolt text-rejimde-yellow text-lg"></i>
                                    <span className="text-lg font-bold text-gray-700">{formatResponseTime(expert.response_time)}</span>
                                </div>
                            </div>

                            {/* Çalışma Saatleri */}
                            {expert.working_hours && (expert.working_hours. weekday || expert.working_hours.weekend) && (
                                <div className="md:col-span-2">
                                    <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Çalışma Saatleri</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {expert.working_hours.weekday && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <i className="fa-solid fa-briefcase text-gray-400"></i>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Hafta İçi</div>
                                                    <div className="text-sm font-bold text-gray-700">{expert.working_hours. weekday}</div>
                                                </div>
                                            </div>
                                        )}
                                        {expert.working_hours. weekend && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <i className="fa-solid fa-umbrella-beach text-gray-400"></i>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Hafta Sonu</div>
                                                    <div className="text-sm font-bold text-gray-700">{expert.working_hours.weekend}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Adres (Yüz Yüze varsa) */}
                            {expert. address && expert.communication_preference?. includes('face') && (
                                <div className="md:col-span-2">
                                    <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Adres</h4>
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                        <i className="fa-solid fa-map-marker-alt text-rejimde-green mt-1"></i>
                                        <p className="text-sm font-bold text-gray-700">{expert.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 7. EĞİTİM & SERTİFİKALAR */}
                    {((expert.education && expert.education. length > 0) || (expert.certificates && expert.certificates. length > 0)) && (
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                            <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-graduation-cap text-rejimde-orange"></i>
                                EĞİTİM & SERTİFİKALAR
                            </h2>
                            
                            <div className="space-y-6">
                                {/* Eğitim */}
                                {expert.education && expert.education.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Eğitim Bilgileri</h4>
                                        <div className="space-y-3">
                                            {expert.education. map((edu, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                                    <i className="fa-solid fa-university text-orange-500 mt-1"></i>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{edu.school}</div>
                                                        <div className="text-sm text-gray-500">{edu.department} • {edu.year}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sertifikalar */}
                                {expert. certificates && expert.certificates.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Sertifikalar</h4>
                                        <div className="space-y-3">
                                            {expert.certificates.map((cert, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                                                    <i className="fa-solid fa-certificate text-yellow-500 mt-1"></i>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{cert. name}</div>
                                                        <div className="text-sm text-gray-500">{cert.institution} • {cert.year}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 8. ÇALIŞMADIĞI DURUMLAR */}
                    {expert. excluded_cases && expert.excluded_cases.length > 0 && (
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                            <h2 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-triangle-exclamation text-rejimde-red"></i>
                                ÇALIŞMADIĞI DURUMLAR
                            </h2>
                            <p className="text-sm text-gray-500 mb-4 font-medium">
                                Aşağıdaki durumlarda uzman yönlendirme veya reddiye yapabilir:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {expert.excluded_cases.map(caseId => (
                                    <span 
                                        key={caseId} 
                                        className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold"
                                    >
                                        <i className="fa-solid fa-xmark mr-1"></i>
                                        {getExcludedCaseLabel(caseId)}
                                    </span>
                                ))}
                            </div>
                            {expert.referral_note && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600 font-medium italic">&quot;{expert.referral_note}&quot;</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 9. HİZMET PAKETLERİ */}
                    {services.length > 0 && (
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800 mb-6 px-2 uppercase tracking-wide">
                                Hizmet Paketleri
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {services.map((service) => {
                                    const typeLabels: Record<typeof service.type, string> = {
                                        online: 'Online',
                                        face_to_face: 'Yüzyüze',
                                        group: 'Grup',
                                        package: 'Paket',
                                        consultation: 'Danışmanlık',
                                        session: 'Seans',
                                        one_time: 'Tek Seferlik'
                                    };
                                    
                                    return (
                                        <div key={service.id} className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card hover:shadow-xl transition-shadow">
                                            {/* Header with type badge */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-extrabold text-gray-700">{service.name}</h3>
                                                    {service.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                                    )}
                                                </div>
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-black uppercase whitespace-nowrap ml-2">
                                                    {typeLabels[service.type]}
                                                </span>
                                            </div>
                                            
                                            {/* Price */}
                                            <div className="text-3xl font-black text-gray-800 mb-4">
                                                {formatCurrency(service.price)}
                                            </div>
                                            
                                            {/* Details */}
                                            <div className="space-y-2 mb-6 text-sm text-gray-600">
                                                {service.duration_minutes > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-solid fa-clock w-4"></i>
                                                        <span>{service.duration_minutes} dakika</span>
                                                    </div>
                                                )}
                                                {service.session_count && (
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-solid fa-layer-group w-4"></i>
                                                        <span>{service.session_count} seans</span>
                                                    </div>
                                                )}
                                                {service.validity_days && (
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-solid fa-calendar-check w-4"></i>
                                                        <span>{service.validity_days} gün geçerli</span>
                                                    </div>
                                                )}
                                                {service.capacity && (service.type === 'group' || service.type === 'package') && (
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-solid fa-user-group w-4"></i>
                                                        <span>Kontenjan: {service.capacity} kişi</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* CTA Button */}
                                            <button 
                                                onClick={() => handleRequestService(service)}
                                                className="w-full border-2 border-rejimde-green text-rejimde-green hover:bg-rejimde-green hover:text-white py-3 rounded-xl font-extrabold uppercase transition"
                                            >
                                                <i className="fa-solid fa-paper-plane mr-2"></i>
                                                Talep Et
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 10. BLOG YAZILARI */}
                    {blogPosts.length > 0 && (
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800 mb-6 px-2 uppercase tracking-wide flex items-center gap-2">
                                <i className="fa-solid fa-newspaper text-rejimde-blue"></i>
                                Blog Yazıları
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogPosts.slice(0, 4).map((post) => (
                                    <Link 
                                        href={`/blog/${post.slug}`} 
                                        key={post.id}
                                        className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-card hover:shadow-xl transition-shadow group"
                                    >
                                        <div className="h-40 overflow-hidden bg-gray-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                                src={post.image} 
                                                alt={post.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold text-gray-400">{post.date}</span>
                                                <span className="text-xs font-bold text-gray-300">•</span>
                                                <span className="text-xs font-bold text-rejimde-blue">{post.read_time}</span>
                                            </div>
                                            <h3 className="text-lg font-extrabold text-gray-800 mb-2 line-clamp-2 group-hover:text-rejimde-blue transition">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {blogPosts.length > 4 && (
                                <div className="text-center mt-6">
                                    <span className="text-sm font-bold text-gray-400">
                                        +{blogPosts.length - 4} yazı daha
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 11. DİYET PLANLARI */}
                    {dietPlans.length > 0 && (
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800 mb-6 px-2 uppercase tracking-wide flex items-center gap-2">
                                <i className="fa-solid fa-utensils text-rejimde-green"></i>
                                Diyet Planları
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {dietPlans.slice(0, 4).map((plan) => (
                                    <Link 
                                        href={`/plans/${plan.slug}`} 
                                        key={plan.id}
                                        className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card hover:shadow-xl transition-shadow group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-extrabold text-gray-800 group-hover:text-rejimde-green transition line-clamp-2">
                                                {plan.title}
                                            </h3>
                                            {plan.difficulty && (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-black uppercase whitespace-nowrap ml-2">
                                                    {plan.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        {plan.description && (
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{plan.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            {plan.category && (
                                                <span className="flex items-center gap-1">
                                                    <i className="fa-solid fa-tag"></i>
                                                    {plan.category}
                                                </span>
                                            )}
                                            {plan.created_at && (
                                                <span>{new Date(plan.created_at).toLocaleDateString('tr-TR')}</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {dietPlans.length > 4 && (
                                <div className="text-center mt-6">
                                    <span className="text-sm font-bold text-gray-400">
                                        +{dietPlans.length - 4} plan daha
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 12. EGZERSİZ PLANLARI */}
                    {exercisePlans.length > 0 && (
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800 mb-6 px-2 uppercase tracking-wide flex items-center gap-2">
                                <i className="fa-solid fa-dumbbell text-rejimde-red"></i>
                                Egzersiz Planları
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exercisePlans.slice(0, 4).map((plan) => (
                                    <Link 
                                        href={`/exercises/${plan.slug}`} 
                                        key={plan.id}
                                        className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card hover:shadow-xl transition-shadow group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-extrabold text-gray-800 group-hover:text-rejimde-red transition line-clamp-2">
                                                {plan.title}
                                            </h3>
                                            {plan.difficulty && (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-black uppercase whitespace-nowrap ml-2">
                                                    {plan.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        {plan.description && (
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{plan.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            {plan.category && (
                                                <span className="flex items-center gap-1">
                                                    <i className="fa-solid fa-tag"></i>
                                                    {plan.category}
                                                </span>
                                            )}
                                            {plan.created_at && (
                                                <span>{new Date(plan.created_at).toLocaleDateString('tr-TR')}</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {exercisePlans.length > 4 && (
                                <div className="text-center mt-6">
                                    <span className="text-sm font-bold text-gray-400">
                                        +{exercisePlans.length - 4} plan daha
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 13. REVIEWS */}
                    <div id="comments-section" className="scroll-mt-32">
                        <ExpertReviewsContainer expertId={expert.id} expertSlug={expert.slug} />
                    </div>

                </div>
            </div>
        </div>
        {showAskQuestionModal && expert && (
        <AskQuestionModal
            expertId={expert.related_user_id ?? expert.user_id ?? expert.id}
            expertName={expert.name}
            expertAvatar={expert.image}
            onClose={() => setShowAskQuestionModal(false)}
            onSuccess={(threadId) => {
              setShowAskQuestionModal(false);
              // Optional: Redirect to inbox to see the message
              // router.push(`/dashboard/inbox`);
            }}
        />
        )}
        {/* Appointment Request Modal */}
        {showRequestModal && expert && (
            <AppointmentRequestModal
                expertId={expert.related_user_id ?? expert.user_id ?? expert.id}
                expertName={expert.name}
                onClose={() => setShowRequestModal(false)}
                onSuccess={() => {
                    setShowRequestModal(false);
                    // Optionally show a success message
                }}
            />
        )}
        
        {/* Service Request Modal */}
        {showServiceRequestModal && selectedService && expert && (
            <ServiceRequestModal
                expertId={expert.related_user_id ?? expert.user_id ?? expert.id}
                expertName={expert.name}
                service={selectedService}
                onClose={() => {
                    setShowServiceRequestModal(false);
                    setSelectedService(null);
                }}
                onSuccess={() => {
                    setShowServiceRequestModal(false);
                    setSelectedService(null);
                    // Toast göster
                    alert('Talebiniz başarıyla gönderildi!');
                }}
            />
        )}
      </div>
    );
}