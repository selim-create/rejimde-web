"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ExpertCard from "@/components/ExpertCard";
import { getExperts } from "@/lib/api"; 
import { Expert } from "@/types"; 
import MascotDisplay from "@/components/MascotDisplay";
import { CITIES } from "@/lib/locations";
import { PROFESSION_CATEGORIES, getProfessionLabel } from "@/lib/constants";

// Helper function: Format trend percentage
const formatTrend = (trend: number | string | undefined | null): string => {
    if (trend === undefined || trend === null || trend === 0 || trend === '0') return '—';
    const numTrend = typeof trend === 'string' ? parseFloat(trend) : trend;
    if (isNaN(numTrend) || numTrend === 0) return '—';
    const prefix = numTrend > 0 ? '+' : '';
    return `${prefix}${numTrend}%`;
};

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  // FİLTRE STATE'LERİ
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("all"); 
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(5000); // Max fiyat
  const [consultationType, setConsultationType] = useState<string[]>([]); // 'online', 'face', 'hybrid'
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const expertsPerPage = 12;

  // Veriyi ve Kullanıcı Rolünü Çek
  useEffect(() => {
    // Rol kontrolü (Client-side)
    if (typeof window !== 'undefined') {
        const role = localStorage.getItem('user_role') || "";
        setUserRole(role);
    }

    async function fetchData() {
      try {
        const data = await getExperts();
        setExperts(data);
      } catch (err) {
        console.error("Uzmanlar yüklenirken hata:", err);
        setError("Uzman listesi şu an alınamıyor.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helper fonksiyon: Meslek prefix'ini al
  const getProfessionPrefix = (profession: string): string => {
    for (const cat of PROFESSION_CATEGORIES) {
      const item = cat.items.find(i => i.id === profession || profession?.includes(i.id));
      if (item && item.prefix) return item.prefix;
    }
    return '';
  };

  // FİLTRELEME MANTIĞI
  const filteredExperts = useMemo(() => {
    return experts.filter(expert => {
      // 1. Arama (İsim veya Unvan)
      const searchMatch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          expert.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (!searchMatch) return false;

      // 2. Meslek Filtresi (Tablar)
      if (selectedProfession !== 'all') {
          // Backend'den gelen 'type' veya 'profession' alanını kontrol et
          // Eğer 'other' seçildiyse ana kategoriler dışındakileri getir
          if (selectedProfession === 'other') {
              const mainProfessions = ['dietitian', 'pt', 'yoga'];
              if (mainProfessions.includes(expert.type)) return false;
          } else {
              if (expert.type !== selectedProfession) return false;
          }
      }

      // 3. Lokasyon (Şehir ve İlçe)
      if (selectedCity) {
          const expertCity = (expert as any).city || ""; 
          if (expertCity !== selectedCity) return false;
      }
      if (selectedDistrict) {
          const expertDistrict = (expert as any).district || "";
          if (expertDistrict !== selectedDistrict) return false;
      }

      // 5. Görüşme Tipi
      if (consultationType.length > 0) {
          const expType = (expert as any).consultation_types || "online";
          const matches = consultationType.some(type => {
              if (expType === 'hybrid') return true;
              return expType === type;
          });
          if (!matches) return false;
      }

      return true;
    });
  }, [experts, searchTerm, selectedProfession, selectedCity, selectedDistrict, consultationType]);

  // SIRALAMA: is_featured, is_verified ve RejiScore'a göre sırala
  const sortedExperts = useMemo(() => {
    return [...filteredExperts].sort((a, b) => {
      // 1. Önce Editörün Seçimi (is_featured) en üste
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      
      // 2. Sonra Onaylı Uzmanlar (is_verified)
      if (a.is_verified && !b.is_verified) return -1;
      if (!a.is_verified && b.is_verified) return 1;
      
      // 3. Son olarak RejiScore'a göre sırala (yüksekten düşüğe)
      const scoreA = a.reji_score || 0;
      const scoreB = b.reji_score || 0;
      return scoreB - scoreA;
    });
  }, [filteredExperts]);

  // PAGINATION: Sayfalama mantığı
  const totalPages = Math.ceil(sortedExperts.length / expertsPerPage);
  const paginatedExperts = useMemo(() => {
    const startIndex = (currentPage - 1) * expertsPerPage;
    const endIndex = startIndex + expertsPerPage;
    return sortedExperts.slice(startIndex, endIndex);
  }, [sortedExperts, currentPage, expertsPerPage]);
  
  // Filtre değiştiğinde ilk sayfaya dön
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProfession, selectedCity, selectedDistrict, consultationType]);

  // Seçilen şehre göre ilçeleri bul
  const activeCityData = CITIES.find(c => c.id === selectedCity);

  const toggleFilter = (state: string[], setState: any, value: string) => {
      if (state.includes(value)) {
          setState(state.filter(item => item !== value));
      } else {
          setState([...state, value]);
      }
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      
      {/* Page Header */}
      <div className="bg-white border-b-2 border-gray-200 py-8 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">Takım Kaptanını Seç</h1>
            
            {/* Search & Main Filter */}
            <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* Profession Tabs */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button onClick={() => setSelectedProfession('all')} className={`px-4 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game flex items-center gap-2 transition ${selectedProfession === 'all' ? 'bg-rejimde-text text-white shadow-gray-800' : 'bg-white border-2 border-gray-200 text-gray-500 shadow-gray-200'}`}>
                        <i className="fa-solid fa-filter"></i> Tümü
                    </button>
                    <button onClick={() => setSelectedProfession('dietitian')} className={`px-4 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game transition ${selectedProfession === 'dietitian' ? 'bg-rejimde-green text-white shadow-rejimde-greenDark' : 'bg-white border-2 border-gray-200 text-gray-500 hover:text-rejimde-green hover:border-rejimde-green'}`}>
                        🥦 Diyetisyen
                    </button>
                    <button onClick={() => setSelectedProfession('pt')} className={`px-4 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game transition ${selectedProfession === 'pt' ? 'bg-rejimde-blue text-white shadow-rejimde-blueDark' : 'bg-white border-2 border-gray-200 text-gray-500 hover:text-rejimde-blue hover:border-rejimde-blue'}`}>
                        🏋️ PT / Koç
                    </button>
                    <button onClick={() => setSelectedProfession('yoga')} className={`px-4 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game transition ${selectedProfession === 'yoga' ? 'bg-rejimde-purple text-white shadow-purple-800' : 'bg-white border-2 border-gray-200 text-gray-500 hover:text-rejimde-purple hover:border-rejimde-purple'}`}>
                        🧘 Yoga / Pilates
                    </button>
                    <button onClick={() => setSelectedProfession('other')} className={`px-4 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game transition ${selectedProfession === 'other' ? 'bg-gray-600 text-white shadow-gray-800' : 'bg-white border-2 border-gray-200 text-gray-500 hover:text-gray-600 hover:border-gray-600'}`}>
                        ✨ Diğer
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="İsim veya uzmanlık ara..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-2 pl-10 pr-4 font-bold text-gray-600 outline-none transition text-sm" 
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS */}
        <div className="hidden lg:block space-y-6">
            
            {/* Lokasyon Filtresi */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-5">
                <h3 className="font-extrabold text-gray-700 text-sm uppercase mb-4">Konum</h3>
                <div className="space-y-3">
                    <div className="relative">
                        <i className="fa-solid fa-location-dot absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <select 
                            value={selectedCity}
                            onChange={(e) => { setSelectedCity(e.target.value); setSelectedDistrict(""); }}
                            className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-green rounded-xl py-3 pl-10 pr-4 font-bold text-gray-600 outline-none transition text-sm appearance-none cursor-pointer"
                        >
                            <option value="">İl Seçiniz</option>
                            {CITIES.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="relative">
                        <select 
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedCity}
                            className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-green rounded-xl py-3 pl-4 pr-4 font-bold text-gray-600 outline-none transition text-sm appearance-none cursor-pointer disabled:opacity-50"
                        >
                            <option value="">İlçe Seçiniz</option>
                            {activeCityData?.districts.map(dist => (
                                <option key={dist} value={dist}>{dist}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Hedef Filtresi */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-5">
                <h3 className="font-extrabold text-gray-700 text-sm uppercase mb-4">Hedefin Ne?</h3>
                <div className="space-y-2">
                    {['Kilo Vermek', 'Kas Yapmak', 'Gebelik'].map((goal) => (
                        <label key={goal} className="cursor-pointer block">
                            <input 
                                type="checkbox" 
                                className="hidden peer" 
                                checked={selectedGoal.includes(goal)}
                                onChange={() => toggleFilter(selectedGoal, setSelectedGoal, goal)}
                            />
                            <div className="border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-500 hover:bg-gray-50 transition flex justify-between items-center peer-checked:bg-blue-50 peer-checked:border-rejimde-blue peer-checked:text-rejimde-blue">
                                <span>{goal === 'Kilo Vermek' ? '📉' : goal === 'Kas Yapmak' ? '💪' : '🤰'} {goal}</span>
                                <i className="fa-solid fa-check hidden peer-checked:block"></i>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Bütçe Filtresi */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-5">
                <h3 className="font-extrabold text-gray-700 text-sm uppercase mb-4">Bütçe (Aylık Max)</h3>
                <input 
                    type="range" 
                    min="500" max="10000" step="500" 
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full accent-rejimde-green h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2" 
                />
                <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>₺500</span>
                    <span className="text-rejimde-green">₺{priceRange}</span>
                </div>
            </div>

            {/* Görüşme Tipi Filtresi */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-5">
                <h3 className="font-extrabold text-gray-700 text-sm uppercase mb-4">Görüşme Tipi</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            className="hidden peer" 
                            checked={consultationType.includes('online')}
                            onChange={() => toggleFilter(consultationType, setConsultationType, 'online')}
                        />
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white peer-checked:bg-rejimde-green peer-checked:border-rejimde-green transition">
                            <i className="fa-solid fa-check text-white text-sm opacity-0 peer-checked:opacity-100"></i>
                        </div>
                        <span className="font-bold text-gray-600 text-sm group-hover:text-rejimde-green transition">Sadece Online</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            className="hidden peer"
                            checked={consultationType.includes('face')}
                            onChange={() => toggleFilter(consultationType, setConsultationType, 'face')}
                        />
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white peer-checked:bg-rejimde-green peer-checked:border-rejimde-green transition">
                            <i className="fa-solid fa-check text-white text-sm opacity-0 peer-checked:opacity-100"></i>
                        </div>
                        <span className="font-bold text-gray-600 text-sm group-hover:text-rejimde-green transition">Yüz Yüze (Yakınımda)</span>
                    </label>
                </div>
            </div>

        </div>

        {/* EXPERT GRID */}
        <div className="lg:col-span-3">
            
            {loading && <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Uzmanlar sahaya çıkıyor...</div>}

            {!loading && paginatedExperts.length === 0 && (
                <div className="bg-gray-50 border-2 border-gray-100 rounded-3xl p-12 text-center col-span-3">
                    <MascotDisplay state="idle_dashboard" size={150} showBubble={false} />
                    <h3 className="font-extrabold text-gray-700 text-xl mt-4">Henüz Uzman Yok</h3>
                    <p className="text-gray-500 font-bold mb-4">Bu kriterlere uygun uzman bulunamadı. Filtreleri temizlemeyi dene.</p>
                    <button 
                        onClick={() => {setSearchTerm(""); setSelectedCity(""); setSelectedProfession("all");}}
                        className="text-rejimde-blue font-bold hover:underline"
                    >
                        Filtreleri Temizle
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedExperts.map((expert) => {
                    // Uzmanın kendi yazdığı ünvan varsa onu kullan, yoksa profession label
                    const displayTitle = expert.title || getProfessionLabel(expert.type || expert.profession || '') || 'Sağlık Uzmanı';
                    
                    // Prefix'i sadece title yoksa ekle
                    const prefix = !expert.title ? getProfessionPrefix(expert.type || expert.profession || '') : '';
                    const displayName = prefix ? `${prefix} ${expert.name}` : expert.name;
                    
                    return (
                        <ExpertCard 
                            key={expert.id}
                            type={expert.type as any || 'dietitian'}
                            name={displayName}
                            slug={expert.slug}
                            title={displayTitle}
                            image={expert.image && expert.image !== 'https://placehold.co/150' 
                                    ? expert.image 
                                    : `https://api.dicebear.com/9.x/personas/svg?seed=${expert.slug}`}
                            rating={expert.rating || '5.0'}
                            scoreImpact={expert.score_impact || '+10 P'}
                            trendPercentage={formatTrend(expert.trend_percentage)}
                            
                            // Onay ve Editör Seçimi
                            isVerified={expert.is_verified}
                            isFeatured={Boolean(expert.is_featured)}
                            
                            isOnline={expert.is_online}
                            
                            // YENİ PROPS - RejiScore ve metrikler
                            rejiScore={expert.reji_score}
                            clientCount={expert.client_count}
                            followersCount={expert.followers_count}
                        />
                    );
                })}

                {/* Promo Card - Sadece Pro olmayanlara göster */}
                {userRole !== 'rejimde_pro' && (
                    <div className="bg-rejimde-purple rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center items-center text-center shadow-float cursor-pointer group col-span-1 md:col-span-2 xl:col-span-1">
                        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)'}}></div>
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white text-3xl mb-4 border-2 border-white/20 group-hover:scale-110 transition">
                            <i className="fa-solid fa-briefcase"></i>
                        </div>
                        <h3 className="text-xl font-extrabold text-white mb-2">Uzman Mısın?</h3>
                        <p className="text-purple-100 text-xs font-bold mb-6">Profilini oluştur, danışanlarını ücretsiz yönet ve ligde yerini al.</p>
                        <Link href="/register/pro" className="bg-white text-rejimde-purple px-8 py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-purple-900/30 btn-game uppercase tracking-wide">
                            ÜCRETSİZ BAŞVUR
                        </Link>
                    </div>
                )}
            </div>
            
            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl font-bold text-sm border-2 border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${
                                    currentPage === pageNum 
                                    ? 'bg-rejimde-blue text-white border-rejimde-blue shadow-btn shadow-rejimde-blueDark' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl font-bold text-sm border-2 border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}