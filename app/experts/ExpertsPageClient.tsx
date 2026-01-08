"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ExpertCard from "@/components/ExpertCard";
import { Expert } from "@/types"; 
import MascotDisplay from "@/components/MascotDisplay";
import { CITIES } from "@/lib/locations";
import { PROFESSION_CATEGORIES, getProfessionLabel } from "@/lib/constants";

// Helper function: Format trend percentage
const formatTrend = (trend: number | string | undefined | null): string => {
    if (trend === undefined || trend === null) return '—';
    const numTrend = typeof trend === 'string' ? parseFloat(trend) : trend;
    if (isNaN(numTrend) || numTrend === 0) return '—';
    const prefix = numTrend > 0 ? '+' : '';
    return `${prefix}${numTrend}%`;
};

// Helper function: Get smart pagination page numbers with ellipsis
const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = [];
  const delta = 2; // Aktif sayfanın her iki yanında gösterilecek sayfa sayısı
  
  // Tek sayfa varsa sadece onu döndür
  if (totalPages === 1) {
    return [1];
  }
  
  // Her zaman ilk sayfayı ekle
  pages.push(1);
  
  // Sol ellipsis gerekli mi?
  if (currentPage - delta > 2) {
    pages.push('...');
  }
  
  // Aktif sayfa etrafındaki sayfalar (2'den totalPages-1'e kadar)
  for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
    pages.push(i);
  }
  
  // Sağ ellipsis gerekli mi?
  if (currentPage + delta < totalPages - 1) {
    pages.push('...');
  }
  
  // Son sayfayı ekle (loop zaten totalPages-1'e kadar gittiği için totalPages henüz eklenmedi)
  pages.push(totalPages);
  
  return pages;
};

export default function ExpertsPageClient() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  // FİLTRE STATE'LERİ
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("all"); 
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(5000); // Max fiyat
  const [consultationType, setConsultationType] = useState<string[]>([]); // 'online', 'face', 'hybrid'
  
  // SIRALAMA STATE
  const [sortBy, setSortBy] = useState('score'); // 'score', 'trend', 'newest', 'oldest', 'rating'
  
  // PAGINATION STATE - Server-side pagination
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 24,
    current_page: 1,
    total_pages: 1
  });

  // Fetch experts with server-side pagination and profession filter
  const fetchExperts = async (page = 1, profession = 'all') => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://api.rejimde.com/wp-json';
      
      // Profession parametresini API'ye gönder
      let url = `${API_URL}/rejimde/v1/professionals?page=${page}&per_page=24`;
      if (profession && profession !== 'all') {
        url += `&profession=${profession}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      // Yeni response yapısı: { data: [], pagination: {} }
      if (data.data && Array.isArray(data.data)) {
        const experts = data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          type: item.profession || item.type || 'dietitian',
          title: item.title || '',
          image: item.image,
          rating: item.rating || '5.0',
          score_impact: item.score_impact || '+10 P',
          is_verified: item.is_verified === true || item.is_verified === '1' || item.is_verified === 1,
          is_featured: item.is_featured === true || item.is_featured === '1' || item.is_featured === 1,
          is_online: item.is_online,
          location: item.location,
          reji_score: item.reji_score || 50,
          trend_percentage: item.trend_percentage || 0,
          trend_direction: item.trend_direction || 'stable',
          client_count: item.client_count || 0,
          profession: item.profession || 'dietitian',
          experience_years: item.experience_years || 0,
          followers_count: item.followers_count || 0,
          content_count: item.content_count || 0
        }));
        setExperts(experts);
        
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        // Eski response yapısı için fallback
        const expertsData = Array.isArray(data) ? data : [];
        const mappedExperts = expertsData.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          type: item.profession || item.type || 'dietitian',
          title: item.title || '',
          image: item.image,
          rating: item.rating || '5.0',
          score_impact: item.score_impact || '+10 P',
          is_verified: item.is_verified === true || item.is_verified === '1' || item.is_verified === 1,
          is_featured: item.is_featured === true || item.is_featured === '1' || item.is_featured === 1,
          is_online: item.is_online,
          location: item.location,
          reji_score: item.reji_score || 50,
          trend_percentage: item.trend_percentage || 0,
          trend_direction: item.trend_direction || 'stable',
          client_count: item.client_count || 0,
          profession: item.profession || 'dietitian',
          experience_years: item.experience_years || 0,
          followers_count: item.followers_count || 0,
          content_count: item.content_count || 0
        }));
        setExperts(mappedExperts);
      }
    } catch (err) {
      console.error("Uzmanlar yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  // Veriyi ve Kullanıcı Rolünü Çek
  useEffect(() => {
    // Rol kontrolü (Client-side)
    if (typeof window !== 'undefined') {
        const role = localStorage.getItem('user_role') || "";
        setUserRole(role);
    }

    fetchExperts(1, selectedProfession);
  }, [selectedProfession]);

  // Helper fonksiyon: Meslek prefix'ini al
  const getProfessionPrefix = (profession: string): string => {
    for (const cat of PROFESSION_CATEGORIES) {
      const item = cat.items.find(i => i.id === profession || profession?.includes(i.id));
      if (item && item.prefix) return item.prefix;
    }
    return '';
  };

  // FİLTRELEME MANTIĞI (Client-side filtering for other filters)
  const filteredExperts = useMemo(() => {
    return experts.filter(expert => {
      // 1. Arama (İsim veya Unvan)
      const searchMatch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          expert.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (!searchMatch) return false;

      // 2. Meslek Filtresi - REMOVED (now server-side)
      // The profession filtering is now handled by the API

      // 3. Lokasyon (Şehir ve İlçe)
      if (selectedCity) {
          const expertCity = (expert as any).city || ""; 
          if (expertCity !== selectedCity) return false;
      }
      if (selectedDistrict) {
          const expertDistrict = (expert as any).district || "";
          if (expertDistrict !== selectedDistrict) return false;
      }

      // 4. Görüşme Tipi
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
  }, [experts, searchTerm, selectedCity, selectedDistrict, consultationType]);

  // SIRALAMA MANTIĞI
  const sortedExperts = useMemo(() => {
    return [...filteredExperts].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          // Önce featured, sonra verified, sonra score
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.is_verified && !b.is_verified) return -1;
          if (!a.is_verified && b.is_verified) return 1;
          return (b.reji_score || 0) - (a.reji_score || 0);
        
        case 'trend':
          return (b.trend_percentage || 0) - (a.trend_percentage || 0);
        
        case 'newest':
          return new Date((b as any).created_at || 0).getTime() - new Date((a as any).created_at || 0).getTime();
        
        case 'oldest':
          return new Date((a as any).created_at || 0).getTime() - new Date((b as any).created_at || 0).getTime();
        
        case 'rating':
          return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
        
        default:
          return 0;
      }
    });
  }, [filteredExperts, sortBy]);

  // Sayfa değiştiğinde API'yi tekrar çağır
  const handlePageChange = (page: number) => {
    fetchExperts(page, selectedProfession);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Filtre değiştiğinde ilk sayfaya dön ve yeniden fetch et (profession hariç - o zaten useEffect'te)
  useEffect(() => {
    if (!loading) {
      fetchExperts(1, selectedProfession);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCity, selectedDistrict, consultationType]);

  // Seçilen şehre göre ilçeleri bul
  const activeCityData = CITIES.find(c => c.id === selectedCity);

  const toggleFilter = (state: string[], setState: any, value: string) => {
      if (state.includes(value)) {
          setState(state.filter(item => item !== value));
      } else {
          setState([...state, value]);
      }
  };

  // Helper function: Get Tailwind classes for profession category theme
  const getCategoryClasses = (theme: string, isActive: boolean) => {
      const themeClasses: Record<string, { active: string; inactive: string }> = {
          green: {
              active: 'bg-green-500 text-white shadow-green-700',
              inactive: 'bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
          },
          blue: {
              active: 'bg-blue-500 text-white shadow-blue-700',
              inactive: 'bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
          },
          teal: {
              active: 'bg-teal-500 text-white shadow-teal-700',
              inactive: 'bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
          },
          purple: {
              active: 'bg-purple-500 text-white shadow-purple-700',
              inactive: 'bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
          },
          red: {
              active: 'bg-red-500 text-white shadow-red-700',
              inactive: 'bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
          },
          orange: {
              active: 'bg-orange-500 text-white shadow-orange-700',
              inactive: 'bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
          }
      };
      
      const classes = themeClasses[theme] || themeClasses.green;
      return isActive ? classes.active : classes.inactive;
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      
      {/* Page Header */}
      <div className="bg-white border-b-2 border-gray-200 py-6 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4">Uzmanını Bul, Mentörünü Seç</h1>
            
            {/* Üst Satır: Search ve Sıralama */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
                {/* Search Bar - Sol */}
                <div className="relative w-full sm:w-72">
                    <input 
                        type="text" 
                        placeholder="İsim veya uzmanlık ara..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-2.5 pl-10 pr-4 font-bold text-gray-600 outline-none transition text-sm" 
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                
                {/* Sıralama Dropdown - Sağ */}
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold text-gray-600 text-sm w-full sm:w-auto appearance-none cursor-pointer hover:border-gray-300 transition"
                >
                    <option value="score">RejiScore'a Göre</option>
                    <option value="trend">Trend Oranına Göre</option>
                    <option value="newest">Yeniden Eskiye</option>
                    <option value="oldest">Eskiden Yeniye</option>
                    <option value="rating">Puana Göre</option>
                </select>
            </div>
            
            {/* Alt Satır: Meslek Filtreleri - Horizontal Scroll */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-2 min-w-max">
                    <button 
                        onClick={() => setSelectedProfession('all')} 
                        className={`px-4 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game flex items-center gap-2 transition ${
                            selectedProfession === 'all' ? 'bg-rejimde-green text-white shadow-rejimde-greenDark' : 'bg-white text-gray-500 border-2 border-gray-200'
                        }`}
                    >
                        <i className="fa-solid fa-filter"></i> Tümü
                    </button>
                    
                    {PROFESSION_CATEGORIES.map((category) => (
                        <button 
                            key={category.id}
                            onClick={() => setSelectedProfession(category.id)} 
                            className={`px-4 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game transition ${
                                getCategoryClasses(category.theme, selectedProfession === category.id)
                            }`}
                        >
                            <i className={`fa-solid ${category.icon} mr-1`}></i> {category.title}
                        </button>
                    ))}
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

            {!loading && sortedExperts.length === 0 && (
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
                {sortedExperts.map((expert) => {
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
            {!loading && pagination.total_pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                    {/* Önceki Butonu */}
                    <button 
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="px-4 py-2 rounded-xl font-bold text-sm border-2 border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <i className="fa-solid fa-chevron-left mr-1"></i> Önceki
                    </button>
                    
                    {/* Sayfa Numaraları */}
                    <div className="flex gap-1">
                        {getPageNumbers(pagination.current_page, pagination.total_pages).map((pageNum, index) => (
                            pageNum === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400 font-bold">...</span>
                            ) : (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum as number)}
                                    className={`min-w-[40px] px-3 py-2 rounded-xl font-bold text-sm border-2 transition ${
                                        pagination.current_page === pageNum 
                                        ? 'bg-rejimde-blue text-white border-rejimde-blue shadow-btn shadow-rejimde-blueDark' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        ))}
                    </div>
                    
                    {/* Sonraki Butonu */}
                    <button 
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.total_pages}
                        className="px-4 py-2 rounded-xl font-bold text-sm border-2 border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Sonraki <i className="fa-solid fa-chevron-right ml-1"></i>
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}