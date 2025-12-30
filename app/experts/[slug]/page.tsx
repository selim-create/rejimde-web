"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getExpertBySlug, getExpertPublicServices, type Service } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import MascotDisplay from "@/components/MascotDisplay";
import ExpertReviews from "@/components/CommentsExperts";
import AppointmentRequestModal from "@/components/AppointmentRequestModal";
import AskQuestionModal from "@/components/AskQuestionModal";
import { 
  EXPERTISE_TAGS, 
  GOAL_TAGS, 
  AGE_GROUP_OPTIONS, 
  LANGUAGE_OPTIONS,
  COUNTRY_OPTIONS 
} from "@/lib/constants";

// Profession ID'den Label'a çevir
const getProfessionLabel = (professionId: string): string => {
    const map:  Record<string, string> = {
        'dietitian': 'Diyetisyen',
        'nutritionist': 'Beslenme Uzmanı',
        'pt': 'Personal Trainer',
        'fitness_coach': 'Fitness Koçu',
        'yoga': 'Yoga Eğitmeni',
        'pilates': 'Pilates Eğitmeni',
        'reformer': 'Reformer Pilates',
        'psychologist': 'Psikolog',
        'life_coach': 'Yaşam Koçu',
        'physiotherapist': 'Fizyoterapist',
        'doctor': 'Doktor',
        'box':  'Boks Eğitmeni',
        'kickbox': 'Kickboks Eğitmeni',
        'mma': 'MMA Eğitmeni',
        'functional':  'Fonksiyonel Antrenman',
        'crossfit': 'CrossFit Eğitmeni',
        'swim':  'Yüzme Eğitmeni',
        'run': 'Koşu Eğitmeni',
        'breath': 'Nefes & Meditasyon',
        'defense': 'Savunma Eğitmeni',
    };
    return map[professionId] || professionId;
};

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
                    client_count: (data as any).client_count || '10+',
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
                
                // Load expert's services
                // Use user_id instead of post ID (data.id)
                // Try related_user_id first (primary field), then user_id (fallback)
                const userId = data?.related_user_id ?? data?.user_id;
                if (userId) {
                    const servicesData = await getExpertPublicServices(userId);
                    // Filter only active services
                    setServices(servicesData.filter(s => s.is_active));
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

    fetchExpert();
  }, [slug]);

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
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-0 sticky top-24 overflow-hidden shadow-card">
                        {/* Cover & Photo */}
                        <div className="h-32 bg-rejimde-blue relative">
                            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                                <div className="relative">
                                    <img src={expert.image} alt={expert.name} className="w-32 h-32 rounded-3xl border-4 border-white shadow-md bg-white object-cover" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-rejimde-green border-4 border-white rounded-full flex items-center justify-center" title="Online">
                                        <i className="fa-solid fa-check text-white text-xs"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-20 pb-6 px-6 text-center">
                            {expert.is_verified && (
                                <div className="inline-flex items-center gap-1 bg-blue-50 text-rejimde-blue border border-blue-100 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                                    <i className="fa-solid fa-certificate"></i> Onaylı Uzman
                                </div>
                            )}

                            <h1 className="text-2xl font-extrabold text-gray-800 mb-1">{expert.name}</h1>
                            <p className="text-gray-400 font-bold text-sm mb-2">
                                {expert. title} 
                                {expert.brand ?  ` • ${expert.brand}` : ''}
                            </p>
                            
                            {/* Motto */}
                            {expert.motto && (
                                <p className="text-gray-500 text-sm italic mb-3 px-4">&quot;{expert. motto}&quot;</p>
                            )}

                            {/* Lokasyon */}
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                                <i className="fa-solid fa-location-dot text-rejimde-green"></i>
                                <span className="font-bold">
                                    {expert.country && expert.country !== 'TR' 
                                        ?  `${expert.city || ''}, ${COUNTRY_OPTIONS. find(c => c.id === expert.country)?.label || expert.country}`
                                        : expert. location || `${expert.city || ''}, ${expert.district || ''}`
                                    }
                                </span>
                            </div>

                            {/* Rating */}
                            <div className="flex justify-center items-center gap-2 mb-4">
                                <div className="flex text-rejimde-yellow text-xs">
                                    <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star-half-stroke"></i>
                                </div>
                                <span className="font-extrabold text-gray-600">{expert.rating}</span>
                                <span 
                                    className="text-gray-400 text-xs font-bold underline cursor-pointer hover:text-rejimde-blue"
                                    onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    (Değerlendirmeler)
                                </span>
                            </div>
                            
                            {/* Hizmet Dilleri */}
                            {expert.service_languages && expert.service_languages.length > 0 && (
                                <div className="flex justify-center gap-2 mb-4">
                                    {expert.service_languages.map(langId => {
                                        const lang = LANGUAGE_OPTIONS.find(l => l.id === langId);
                                        return lang ? (
                                            <span key={langId} className="text-lg" title={lang.label}>{lang.flag}</span>
                                        ) : null;
                                    })}
                                </div>
                            )}

                            {/* CTA Buttons */}
                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    onClick={() => setShowRequestModal(true)}
                                    className="bg-rejimde-green text-white w-full py-3 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-calendar-plus"></i> Randevu Al
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                    onClick={() => setShowAskQuestionModal(true)}
                                    className="bg-white border-2 border-gray-200 text-gray-500 w-full py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-blue hover:border-rejimde-blue transition"
                                    >
                                    <i className="fa-regular fa-message text-lg block mb-1"></i> Soru Sor
                                    </button>
                                    <button className="bg-white border-2 border-gray-200 text-gray-500 w-full py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-purple hover:border-rejimde-purple transition flex flex-col items-center justify-center">
                                        <i className="fa-solid fa-user-plus text-lg block mb-1"></i> Takip Et
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Footer */}
                        <div className="bg-gray-50 border-t-2 border-gray-100 p-4 grid grid-cols-3 divide-x divide-gray-200 text-center">
                            <div>
                                <div className="text-xl font-black text-rejimde-text">{expert.client_count}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Danışan</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-rejimde-text">{expert.experience}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Tecrübe</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-rejimde-text">{formatResponseTime(expert.response_time)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Yanıt</div>
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

                        <div className="grid grid-cols-1 md: grid-cols-2 gap-6">
                            <div className="bg-rejimde-bg rounded-2xl p-4 flex items-center gap-4 border-2 border-transparent hover:border-rejimde-green transition">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rejimde-green text-2xl shadow-sm">
                                    <i className="fa-solid fa-arrow-trend-up"></i>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-800">{expert.score_impact}</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase">Ort.  Skor Artışı</div>
                                </div>
                            </div>
                            
                            <div className="bg-rejimde-bg rounded-2xl p-4 flex items-center gap-4 border-2 border-transparent hover:border-rejimde-blue transition">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rejimde-blue text-2xl shadow-sm">
                                    <i className="fa-solid fa-users"></i>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-800">%92</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase">Hedef Başarısı</div>
                                </div>
                            </div>
                        </div>

                        {/* Mascot Tip */}
                        <div className="mt-6 flex items-start gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                             <MascotDisplay state="success_milestone" size={48} showBubble={false} className="shrink-0" />
                            <div>
                                <p className="font-bold text-rejimde-blueDark text-sm leading-relaxed">
                                    &quot;{expert.name} ile çalışanlar, disiplinli ama eğlenceli bir süreç geçiriyor.  Skor artışı garanti!  😉&quot;
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. HAKKINDA & BİYOGRAFİ */}
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                        <h2 className="text-xl font-extrabold text-gray-800 mb-4 uppercase tracking-wide">HAKKINDA</h2>
                        {expert.bio ?  (
                            <div 
                                className="text-gray-500 font-medium leading-relaxed mb-6 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: expert.bio. replace(/\n/g, '<br/>') }}
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
                                        {caseId}
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
                                            <button className="w-full border-2 border-rejimde-blue text-rejimde-blue hover:bg-rejimde-blue hover:text-white py-3 rounded-xl font-extrabold uppercase text-sm transition">
                                                Detayları Gör
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 10. REVIEWS */}
                    <div id="comments-section" className="scroll-mt-32">
                        <ExpertReviews expertId={expert.id} expertSlug={expert.slug} />
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
      </div>
    );
}