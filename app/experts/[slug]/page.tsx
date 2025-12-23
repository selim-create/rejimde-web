"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getExpertBySlug } from "@/lib/api";
import MascotDisplay from "@/components/MascotDisplay";
import ExpertReviews from "@/components/CommentsExperts"; // Import new component

// API'den gelecek detaylı uzman tipi
interface ExpertDetail {
    id: number;
    name: string;
    slug: string;
    type: string;
    title: string;
    image: string;
    rating: string;
    score_impact: string;
    is_verified: boolean;
    is_featured?: boolean;
    location?: string;
    brand?: string;
    bio?: string;
    branches?: string; 
    services?: string; 
    client_types?: string; 
    consultation_types?: string; 
    address?: string; 
    is_claimed?: boolean; 
    // İstatistikler 
    client_count?: string;
    experience?: string;
    response_time?: string;
}

export default function ExpertProfilePage() {
  const params = useParams();
  const [expert, setExpert] = useState<ExpertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const rawSlug = params?.slug 
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
                // is_claimed kontrolü
                const isClaimedRaw = (data as any).is_claimed; 
                const isClaimed = isClaimedRaw === true || isClaimedRaw === '1' || isClaimedRaw === 1;
                
                setExpert({
                    ...data,
                    is_claimed: isClaimed,
                    // Eğer resim yoksa Dicebear
                    image: data.image && data.image !== 'https://placehold.co/150' && data.image !== 'https://placehold.co/300'
                            ? data.image 
                            : `https://api.dicebear.com/9.x/personas/svg?seed=${data.slug}`,
                    // Eksik istatistikleri varsayılan ile doldur
                    client_count: (data as any).client_count || '10+',
                    experience: (data as any).experience || '1 Yıl',
                    response_time: (data as any).response_time || '24s'
                });
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

  // Yükleniyor Durumu
  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20">
              <div className="animate-spin text-rejimde-green text-4xl mb-4"><i className="fa-solid fa-circle-notch"></i></div>
              <p className="text-gray-500 font-bold">Uzman bilgileri yükleniyor...</p>
          </div>
      );
  }

  // Bulunamadı Durumu
  if (notFound || !expert) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20 text-center px-4">
              <MascotDisplay state="cheat_meal_detected" size={200} showBubble={false} />
              <h1 className="text-2xl font-black text-gray-700 mt-6 mb-2">Uzman Bulunamadı</h1>
              <p className="text-gray-500 font-bold mb-6 max-w-md">Aradığınız uzman sistemde kayıtlı değil veya yayından kaldırılmış olabilir.</p>
              <Link href="/experts" className="bg-rejimde-blue text-white px-6 py-3 rounded-xl font-extrabold shadow-btn btn-game inline-block">Listeye Dön</Link>
          </div>
      );
  }

  // --- SENARYO 1: ONAYSIZ / SAHİPLENİLMEMİŞ PROFİL (Gri Kart) ---
  if (!expert.is_claimed) {
    return (
      <div className="min-h-screen pb-20 bg-gray-50 font-sans text-rejimde-text">
        
        {/* CLAIM BANNER (Sticky Top) */}
        <div className="bg-rejimde-blue text-white py-3 sticky top-20 z-40 shadow-md">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <i className="fa-solid fa-circle-info text-2xl animate-pulse"></i>
                    <div>
                        <p className="font-extrabold text-sm uppercase">Bu Profil Sizin mi?</p>
                        <p className="text-xs font-bold text-blue-100 hidden md:block">Profilinizi sahiplenin, bilgilerinizi güncelleyin ve danışan kabul etmeye başlayın.</p>
                    </div>
                </div>
                <Link href="/register/pro" className="bg-white text-rejimde-blue px-6 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-blue-900/20 btn-game uppercase hover:bg-blue-50 whitespace-nowrap">
                    Profili Yönet
                </Link>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Basic Info */}
                <div className="lg:col-span-4">
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-0 sticky top-40 overflow-hidden shadow-card opacity-90">
                        {/* Generic Cover */}
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

                            <h1 className="text-2xl font-extrabold text-gray-600 mb-1">{expert.name}</h1>
                            <p className="text-gray-400 font-bold text-sm mb-4">{expert.title} • {expert.location || 'Konum Belirtilmemiş'}</p>

                            <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
                                <div className="flex text-gray-300 text-xs">
                                    <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                                </div>
                                <span className="font-extrabold text-gray-400">0.0</span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="relative group cursor-not-allowed">
                                    <button className="bg-gray-200 text-gray-400 w-full py-3 rounded-xl font-extrabold text-lg uppercase tracking-wide flex items-center justify-center gap-2 pointer-events-none">
                                        <i className="fa-solid fa-lock"></i> Randevu Al
                                    </button>
                                </div>
                                
                                <button className="bg-white border-2 border-rejimde-green text-rejimde-green w-full py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:bg-green-50 uppercase flex items-center justify-center gap-2">
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
                                <p className="text-gray-800 font-bold">{expert.location || 'Adres Gizli'}...</p>
                            </div>
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
                                <i className="fa-solid fa-eye-slash text-gray-400 text-2xl mb-2"></i>
                                <span className="text-xs font-black text-gray-500 uppercase">İletişim Bilgileri Gizli</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Empty States */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Empty Stats */}
                    <div className="bg-white border-2 border-gray-200 border-dashed rounded-3xl p-8 text-center relative overflow-hidden group hover:border-rejimde-blue transition">
                        <i className="fa-solid fa-chart-simple text-6xl text-gray-200 mb-4 group-hover:text-rejimde-blue transition transform group-hover:scale-110 duration-300"></i>
                        <h2 className="text-xl font-extrabold text-gray-400 mb-2">İstatistik Yok</h2>
                        <p className="text-gray-400 font-bold text-sm max-w-md mx-auto mb-6">
                            Bu uzman henüz Rejimde Ligi&apos;ne katılmadığı için danışan başarı oranları ve skor etkileri görüntülenemiyor.
                        </p>
                        
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-lg mx-auto flex items-start gap-4 text-left">
                            <div className="w-10 h-10 bg-rejimde-blue rounded-full flex items-center justify-center text-white shrink-0 font-bold text-xl">?</div>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 blur-sm opacity-50 pointer-events-none select-none">
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
                
                {/* LEFT COLUMN: Profile Card (Sticky) */}
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

                        <div className="pt-20 pb-8 px-6 text-center">
                            {expert.is_verified && (
                                <div className="inline-flex items-center gap-1 bg-blue-50 text-rejimde-blue border border-blue-100 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                                    <i className="fa-solid fa-certificate"></i> Onaylı Uzman
                                </div>
                            )}

                            <h1 className="text-2xl font-extrabold text-gray-800 mb-1">{expert.name}</h1>
                            <p className="text-gray-400 font-bold text-sm mb-4">
                                {expert.title} 
                                {expert.brand ? ` • ${expert.brand}` : ''}
                                {expert.location ? ` • ${expert.location}` : ''}
                            </p>

                            <div className="flex justify-center items-center gap-2 mb-6">
                                <div className="flex text-rejimde-yellow text-xs">
                                    <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                                </div>
                                <span className="font-extrabold text-gray-600">{expert.rating}</span>
                                <span 
                                    className="text-gray-400 text-xs font-bold underline cursor-pointer hover:text-rejimde-blue"
                                    onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    (Değerlendirmeleri Gör)
                                </span>
                            </div>
                            
                            {/* Uzmanlık Alanları (Tag) */}
                            {expert.branches && (
                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                    {expert.branches.split(',').map((branch, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase">{branch.trim()}</span>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                                <button className="bg-rejimde-green text-white w-full py-3 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-calendar-check"></i> Randevu Al
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-white border-2 border-gray-200 text-gray-500 w-full py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-blue hover:border-rejimde-blue transition">
                                        <i className="fa-regular fa-message text-lg block mb-1"></i> Soru Sor
                                    </button>
                                    <button className="bg-white border-2 border-gray-200 text-gray-500 w-full py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-purple hover:border-rejimde-purple transition">
                                        <i className="fa-solid fa-user-plus text-lg block mb-1"></i> Takip Et
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Footer (YENİ: Eksik Veriler Eklendi) */}
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
                                <div className="text-xl font-black text-rejimde-text">{expert.response_time}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Yanıt</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Content */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 1. GAMIFIED STATS (Rejimde Skoru Etkisi) */}
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rejimde-yellow opacity-10 rounded-full -mr-10 -mt-10"></div>
                        
                        <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-trophy text-rejimde-yellow"></i>
                            BAŞARI İSTATİSTİKLERİ
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-rejimde-bg rounded-2xl p-4 flex items-center gap-4 border-2 border-transparent hover:border-rejimde-green transition">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rejimde-green text-2xl shadow-sm">
                                    <i className="fa-solid fa-arrow-trend-up"></i>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-800">{expert.score_impact}</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase">Ort. Skor Artışı</div>
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
                                    &quot;{expert.name} ile çalışanlar, disiplinli ama eğlenceli bir süreç geçiriyor. Skor artışı garanti! 😉&quot;
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. ABOUT & DETAILS */}
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                        <h2 className="text-xl font-extrabold text-gray-800 mb-4 uppercase tracking-wide">HAKKINDA</h2>
                        {expert.bio ? (
                            <p className="text-gray-500 font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                                {expert.bio}
                            </p>
                        ) : (
                            <p className="text-gray-400 italic mb-6">Uzman henüz biyografisini eklememiş.</p>
                        )}

                        {/* Ekstra Bilgiler Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                             {expert.client_types && (
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Danışan Türü</h4>
                                    <p className="text-sm font-bold text-gray-700">{expert.client_types}</p>
                                </div>
                             )}
                             {expert.consultation_types && (
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Konsültasyon Tipi</h4>
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-rejimde-blue rounded-lg text-xs font-bold uppercase border border-blue-100">
                                        {expert.consultation_types === 'online' ? 'Sadece Online' : expert.consultation_types === 'face' ? 'Yüz Yüze' : 'Hibrit'}
                                    </span>
                                </div>
                             )}
                             {expert.address && (
                                <div className="md:col-span-2">
                                    <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Adres</h4>
                                    <p className="text-sm font-bold text-gray-700">{expert.address}</p>
                                </div>
                             )}
                        </div>
                        
                        {/* Services List */}
                        {expert.services && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-black text-gray-700 uppercase mb-3">Sunduğu Hizmetler</h3>
                                <div className="flex flex-wrap gap-2">
                                    {expert.services.split(',').map((service, index) => (
                                        <span key={index} className="px-3 py-2 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl text-xs font-bold flex items-center gap-2">
                                            <i className="fa-solid fa-check text-rejimde-green"></i>
                                            {service.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. SERVICES (PACKAGES) - DEMO */}
                    <div className="opacity-50 pointer-events-none grayscale">
                        <h2 className="text-xl font-extrabold text-gray-800 mb-6 px-2 uppercase tracking-wide">HİZMET PAKETLERİ (YAKINDA)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Package 1 */}
                            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-extrabold text-gray-700">Standart Takip</h3>
                                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-black uppercase">AYLIK</span>
                                </div>
                                <div className="text-3xl font-black text-gray-800 mb-6">
                                    ₺1.500 <span className="text-sm text-gray-400 font-bold">/ ay</span>
                                </div>
                                <button className="w-full border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-extrabold uppercase text-sm">
                                    Paketi İncele
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 4. REVIEWS (YENİ: ÖZEL TASARIM UZMAN DEĞERLENDİRME MODÜLÜ) */}
                    <div id="comments-section" className="scroll-mt-32">
                        <ExpertReviews expertId={expert.id} expertSlug={expert.slug} />
                    </div>

                </div>
            </div>
        </div>
      </div>
    );
  }