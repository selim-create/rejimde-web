"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/api"; // auth objesi üzerinden veri çekeceğiz

// --- TİPLER ---
interface FormData {
  // Temel
  gender: string;
  age: string;
  height: string;
  weight: string;
  activity_level: string;
  goal: string;
  diet_type: string;
  meals_count: string;
  days: string;
  cuisine: string;
  
  // Sağlık (Opsiyonel)
  is_pregnant?: string; 
  chronic_diseases: string[];
  medications: string;
  blood_test?: string;

  // Hedef Detay
  target_speed: string; 
  body_fat?: string;
  workout_type: string; 

  // Rutin
  sleep_time: string;
  wake_time: string;
  first_meal_time: string;
  intermittent_fasting: boolean;
  water_intake: string; 

  // Tercihler
  allergies: string[]; 
  dislikes: string[]; 
  other_restrictions: string; 

  // Oyunlaştırma
  daily_time_commit: string; 
  biggest_struggle: string;
  cheat_meals_per_week: string;
}

// Varsayılan Değerler
const INITIAL_DATA: FormData = {
  gender: 'female', age: '', height: '', weight: '', activity_level: 'sedentary',
  goal: 'lose_weight', diet_type: 'Standart', meals_count: '3', days: '3', cuisine: 'turkish',
  chronic_diseases: [], medications: '', target_speed: 'normal', workout_type: 'none',
  sleep_time: '23:00', wake_time: '07:00', first_meal_time: '08:00', intermittent_fasting: false, water_intake: 'medium',
  allergies: [], dislikes: [], other_restrictions: '',
  daily_time_commit: '30min', biggest_struggle: 'sweet_cravings', cheat_meals_per_week: '1'
};

// --- SABİTLER ---
const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Hareketsiz', desc: 'Masa başı iş', icon: 'fa-chair' },
  { id: 'light', label: 'Az Hareketli', desc: 'Haftada 1-3 gün', icon: 'fa-person-walking' },
  { id: 'moderate', label: 'Orta', desc: 'Haftada 3-5 gün', icon: 'fa-person-running' },
  { id: 'active', label: 'Çok', desc: 'Haftada 6-7 gün', icon: 'fa-dumbbell' },
];

const GOALS = [
  { id: 'lose_weight', label: 'Kilo Vermek', icon: 'fa-arrow-trend-down' },
  { id: 'maintain', label: 'Korumak', icon: 'fa-scale-balanced' },
  { id: 'gain_muscle', label: 'Kas Yapmak', icon: 'fa-dumbbell' },
];

// İstenilen Kategori Listesi
const DIET_CATEGORIES = [
    "Hızlı Sonuç", "Standart", "Keto", "Vegan", "Vejetaryen", 
    "Düşük Karbonhidrat", "Akdeniz", "Glutensiz", 
    "Ekonomik", "Detoks", "Protein Ağırlıklı", "Aralıklı Oruç"
];

const CHRONIC_OPTIONS = ["Diyabet", "İnsülin Direnci", "Tiroid", "Hipertansiyon", "Kolesterol", "IBS/Mide", "PCOS", "Çölyak"];
const ALLERGY_OPTIONS = ["Süt/Laktoz", "Yumurta", "Gluten", "Kuruyemiş", "Balık", "Soya"];
const DISLIKE_OPTIONS = ["Sakatat", "Mantar", "Kereviz", "Brokoli", "Balık", "Kırmızı Et"];

const LOADING_MESSAGES = [
  "Metabolizman analiz ediliyor...",
  "Sağlık verilerin kontrol ediliyor...",
  "Besin değerleri ve makrolar hesaplanıyor...",
  "Sana en uygun tarifler seçiliyor...",
  "Alışveriş listesi hazırlanıyor...",
  "Plan oluşturuluyor..."
];

// --- BİLEŞEN: Accordion Section ---
const Section = ({ title, icon, children, isOpen, onToggle }: any) => (
    <div className="border-2 border-gray-100 rounded-3xl overflow-hidden bg-white shadow-[0_4px_0_0_rgba(0,0,0,0.02)] mb-4 transition-all hover:border-gray-200">
        <button 
            onClick={onToggle}
            className="w-full flex items-center justify-between p-5 bg-white transition text-left"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-b-4 transition-all ${isOpen ? 'bg-rejimde-purple text-white border-purple-700' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                    <i className={`fa-solid ${icon}`}></i>
                </div>
                <div>
                    <h3 className="font-extrabold text-gray-800 text-base">{title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Opsiyonel</p>
                </div>
            </div>
            <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180 text-rejimde-purple' : 'text-gray-300'}`}></i>
        </button>
        {isOpen && <div className="p-5 border-t-2 border-gray-100 bg-gray-50/30 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
);

export default function AIDietGeneratorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Accordion States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
      health: false,
      routine: false,
      preferences: false,
      gamification: false
  });

  // 1. AUTH & DATA FETCHING
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
        const token = localStorage.getItem('jwt_token');
        
        // Giriş yapmamışsa yönlendir
        if (!token) {
            router.push('/login?redirect=/ai-diet-generator');
            return;
        }

        try {
            // Kullanıcı verilerini çek
            const userData = await auth.me();
            if (userData) {
                // Mevcut verileri forma işle
                setFormData(prev => ({
                    ...prev,
                    gender: userData.gender || prev.gender,
                    age: userData.birth_date ? calculateAge(userData.birth_date).toString() : prev.age,
                    height: userData.height || prev.height,
                    weight: userData.current_weight || prev.weight,
                    activity_level: userData.activity_level || prev.activity_level,
                    // Varsa diğer alanlar da eklenebilir
                }));
            }
        } catch (e) {
            console.error("Veri çekme hatası", e);
        } finally {
            setIsAuthChecking(false);
        }
    };

    checkAuthAndFetchData();
  }, [router]);

  // Yardımcı: Yaş Hesaplama
  const calculateAge = (birthDate: string) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
      }
      return age;
  };

  // Loading Animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => setLoadingMsgIndex((p) => (p + 1) % LOADING_MESSAGES.length), 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'chronic_diseases' | 'allergies' | 'dislikes', item: string) => {
      setFormData(prev => {
          const list = prev[field];
          return list.includes(item) 
            ? { ...prev, [field]: list.filter(i => i !== item) }
            : { ...prev, [field]: [...list, item] };
      });
  };

  const toggleSection = (section: string) => {
      setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNext = () => {
    if (step === 1) {
        const age = parseInt(formData.age);
        const height = parseInt(formData.height);
        const weight = parseInt(formData.weight);

        if (!age || age < 10 || age > 100) return alert("Lütfen geçerli bir yaş giriniz.");
        if (!height || height < 100 || height > 250) return alert("Lütfen geçerli bir boy giriniz.");
        if (!weight || weight < 30 || weight > 300) return alert("Lütfen geçerli bir kilo giriniz.");
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('jwt_token');
      // @ts-ignore - lib/api içinde generateDiet mevcut
      const response = await auth.generateDiet(formData); // API fonksiyonunu kullan

      if (response.success && response.redirect_url) {
        localStorage.removeItem('rejimde_ai_diet_draft');
        router.push(response.redirect_url);
      } else {
        setError(response.message || "Beklenmedik bir hata oluştu.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      setError(`Bağlantı Hatası: ${error.message}`);
      setLoading(false);
    }
  };

  if (isAuthChecking) return null; // Veya basit bir loader

  // --- LOADING EKRANI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-rejimde-purple text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="w-96 h-96 bg-rejimde-blue/30 rounded-full blur-[100px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

        <div className="relative z-10 text-center max-w-md w-full">
          <div className="w-24 h-24 mx-auto mb-8 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border-2 border-white/20 shadow-2xl relative">
             <i className="fa-solid fa-brain text-4xl text-yellow-300 animate-pulse"></i>
             <div className="absolute inset-0 border-4 border-t-white/80 border-r-transparent border-b-white/20 border-l-transparent rounded-3xl animate-spin"></div>
          </div>
          
          <h2 className="text-3xl font-black mb-4 tracking-tight">Rejimde AI Çalışıyor</h2>
          <p className="text-purple-200 text-lg font-bold min-h-[60px] animate-fade-in transition-all">
            {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
          
          <div className="mt-8 bg-white/10 rounded-2xl p-5 text-left text-sm text-purple-100 border-2 border-white/10 shadow-lg">
            <div className="flex items-center gap-2 mb-2 font-black text-yellow-300 uppercase tracking-wide text-xs">
                <i className="fa-solid fa-circle-info"></i> Bilgi
            </div>
            <p className="font-medium">15 güne kadar detaylı plan oluşturmak 1-2 dakika sürebilir. Lütfen sayfayı kapatmayın.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-32">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm border-b border-gray-100 sticky top-0 z-40 flex items-center justify-between">
        <Link href="/diets" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 border-b-4 border-gray-200 hover:bg-gray-200 hover:border-gray-300 hover:text-gray-600 transition-all active:border-b-0 active:translate-y-1">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2.5 w-10 rounded-full transition-all duration-500 ${i <= step ? 'bg-rejimde-purple' : 'bg-gray-200'}`}></div>
            ))}
        </div>
        <div className="w-12"></div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold border-2 border-red-100 animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-xl"></i>
            <div>{error}</div>
          </div>
        )}
        
        {/* STEP 1: Temel Vücut Analizi */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Seni Tanıyalım</h1>
              <p className="text-gray-500 font-medium">Kişisel planın için temel ölçümlerine ihtiyacımız var.</p>
            </div>

            <div className="bg-white p-2 rounded-3xl border-2 border-gray-100 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] flex gap-2">
                {['female', 'male'].map(g => (
                    <button 
                        key={g}
                        onClick={() => handleInputChange('gender', g)}
                        className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${formData.gender === g ? 'bg-rejimde-purple text-white border-purple-700' : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}`}
                    >
                        <i className={`fa-solid ${g === 'female' ? 'fa-venus' : 'fa-mars'}`}></i>
                        {g === 'female' ? 'Kadın' : 'Erkek'}
                    </button>
                ))}
            </div>

            <div className="space-y-5">
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase ml-3 mb-2 block tracking-wide">Yaş</label>
                    <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="Örn: 28" className="w-full bg-white border-2 border-gray-200 rounded-3xl px-6 py-4 text-xl font-black outline-none focus:border-rejimde-purple focus:ring-4 focus:ring-purple-50 transition placeholder-gray-300" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase ml-3 mb-2 block tracking-wide">Boy (cm)</label>
                        <input type="number" value={formData.height} onChange={(e) => handleInputChange('height', e.target.value)} placeholder="170" className="w-full bg-white border-2 border-gray-200 rounded-3xl px-6 py-4 text-xl font-black outline-none focus:border-rejimde-purple focus:ring-4 focus:ring-purple-50 transition placeholder-gray-300" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase ml-3 mb-2 block tracking-wide">Kilo (kg)</label>
                        <input type="number" value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} placeholder="70" className="w-full bg-white border-2 border-gray-200 rounded-3xl px-6 py-4 text-xl font-black outline-none focus:border-rejimde-purple focus:ring-4 focus:ring-purple-50 transition placeholder-gray-300" />
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* STEP 2: Hedef & Aktivite */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Hedefin Ne?</h2>
              <p className="text-gray-500 font-medium">Sana en uygun kaloriyi ve makro dengesini ayarlayacağız.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleInputChange('goal', g.id)}
                  className={`p-4 rounded-3xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 flex flex-col items-center gap-3 transition text-center ${formData.goal === g.id ? 'border-rejimde-purple bg-purple-50 text-rejimde-purple' : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'}`}
                >
                  <i className={`fa-solid ${g.icon} text-3xl`}></i>
                  <span className="text-xs font-black">{g.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-[0_4px_0_0_rgba(0,0,0,0.02)]">
                <label className="block text-xs font-black text-gray-400 uppercase mb-4 tracking-wide">Günlük Hareketin</label>
                <div className="space-y-3">
                    {ACTIVITY_LEVELS.map(act => (
                    <button
                        key={act.id}
                        onClick={() => handleInputChange('activity_level', act.id)}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition active:scale-[0.98] ${formData.activity_level === act.id ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.activity_level === act.id ? 'bg-blue-200' : 'bg-white'}`}>
                                <i className={`fa-solid ${act.icon} text-sm`}></i>
                            </div>
                            <div className="text-left">
                                <div className="font-extrabold text-sm">{act.label}</div>
                                <div className="text-[10px] font-semibold opacity-60 uppercase tracking-wide">{act.desc}</div>
                            </div>
                        </div>
                        {formData.activity_level === act.id && <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs"><i className="fa-solid fa-check"></i></div>}
                    </button>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* STEP 3: Diyet & Süre */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Plan Detayları</h2>
              <p className="text-gray-500 font-medium">Hayat tarzına ve damak tadına uygun bir plan.</p>
            </div>

            {/* Süre Seçimi */}
            <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-[0_4px_0_0_rgba(0,0,0,0.02)]">
                <label className="block text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2 tracking-wide">
                    <i className="fa-regular fa-calendar"></i> Plan Süresi
                </label>
                <div className="grid grid-cols-4 gap-3">
                    {['1', '3', '7', '15'].map(d => (
                        <button
                            key={d}
                            onClick={() => handleInputChange('days', d)}
                            className={`py-3 rounded-2xl font-black text-xl border-b-4 active:border-b-0 active:translate-y-1 transition-all ${formData.days === d ? 'border-purple-600 bg-rejimde-purple text-white' : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'}`}
                        >
                            {d} <span className="text-[9px] uppercase font-bold block -mt-1 opacity-70">Gün</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Diyet Tipi */}
            <div className="grid grid-cols-2 gap-3">
              {DIET_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleInputChange('diet_type', cat)}
                  className={`p-3 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 text-left transition ${formData.diet_type === cat ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <div className="font-extrabold text-xs">{cat}</div>
                </button>
              ))}
            </div>

            {/* Mutfak ve Öğün Sayısı */}
            <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-[0_4px_0_0_rgba(0,0,0,0.02)] space-y-4">
                {/* Mutfak */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 border-b-4 border-orange-200">
                        <i className="fa-solid fa-utensils"></i>
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide">Mutfak Tercihi</label>
                        <select 
                            value={formData.cuisine} 
                            onChange={(e) => handleInputChange('cuisine', e.target.value)}
                            className="w-full bg-transparent font-extrabold text-gray-800 outline-none text-lg"
                        >
                            <option value="turkish">Türk Mutfağı</option>
                            <option value="world">Dünya Mutfağı</option>
                            <option value="practical">Pratik / Öğrenci</option>
                        </select>
                    </div>
                </div>

                <div className="w-full h-0.5 bg-gray-100 rounded-full"></div>

                {/* Öğün Sayısı */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 border-b-4 border-blue-200">
                        <i className="fa-regular fa-clock"></i>
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide">Öğün Sayısı</label>
                        <select 
                            value={formData.meals_count} 
                            onChange={(e) => handleInputChange('meals_count', e.target.value)}
                            className="w-full bg-transparent font-extrabold text-gray-800 outline-none text-lg"
                        >
                            <option value="2">2 Öğün</option>
                            <option value="3">3 Öğün</option>
                            <option value="4">4 Öğün</option>
                            <option value="5">5 Öğün</option>
                            <option value="6">6 Öğün</option>
                        </select>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* STEP 4: Gelişmiş Ayarlar (Accordion) */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Son Dokunuşlar</h2>
              <p className="text-gray-500 font-medium">Aşağıdaki alanlar isteğe bağlıdır, boş bırakabilirsin.</p>
            </div>

            {/* 1. SAĞLIK & GÜVENLİK */}
            <Section title="Sağlık Durumu" icon="fa-heart-pulse" isOpen={openSections.health} onToggle={() => toggleSection('health')}>
                <div className="space-y-4">
                    {formData.gender === 'female' && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Hamilelik / Emzirme?</span>
                            <div className="flex bg-gray-200 p-1 rounded-xl">
                                {['yes', 'no'].map(opt => (
                                    <button 
                                        key={opt} 
                                        onClick={() => handleInputChange('is_pregnant', opt === 'yes' ? 'yes' : '')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${formData.is_pregnant === (opt === 'yes' ? 'yes' : '') ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                                    >
                                        {opt === 'yes' ? 'Evet' : 'Hayır'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wide">Kronik Rahatsızlıklar</label>
                        <div className="flex flex-wrap gap-2">
                            {CHRONIC_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleArrayItem('chronic_diseases', opt)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${formData.chronic_diseases.includes(opt) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wide">Kullandığın İlaçlar</label>
                        <input type="text" value={formData.medications} onChange={(e) => handleInputChange('medications', e.target.value)} placeholder="Örn: İnsülin, Tiroid ilacı..." className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-rejimde-purple transition" />
                    </div>
                </div>
            </Section>

            {/* 2. RUTİN & SAATLER */}
            <Section title="Günlük Rutin" icon="fa-clock" isOpen={openSections.routine} onToggle={() => toggleSection('routine')}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-wide">Uyanış</label>
                        <input type="time" value={formData.wake_time} onChange={(e) => handleInputChange('wake_time', e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-2xl px-3 py-3 text-sm font-bold outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-wide">Uyku</label>
                        <input type="time" value={formData.sleep_time} onChange={(e) => handleInputChange('sleep_time', e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-2xl px-3 py-3 text-sm font-bold outline-none" />
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-gray-100">
                    <input type="checkbox" checked={formData.intermittent_fasting} onChange={(e) => handleInputChange('intermittent_fasting', e.target.checked)} className="w-5 h-5 text-rejimde-purple rounded focus:ring-0" />
                    <span className="text-sm font-bold text-gray-700">Aralıklı Oruç (IF) uyguluyorum</span>
                </div>
            </Section>

            {/* 3. TERCİHLER */}
            <Section title="Besin Tercihleri" icon="fa-carrot" isOpen={openSections.preferences} onToggle={() => toggleSection('preferences')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wide">Alerjiler / Hassasiyet</label>
                        <div className="flex flex-wrap gap-2">
                            {ALLERGY_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleArrayItem('allergies', opt)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${formData.allergies.includes(opt) ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wide">Sevmediklerim</label>
                        <div className="flex flex-wrap gap-2">
                            {DISLIKE_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleArrayItem('dislikes', opt)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${formData.dislikes.includes(opt) ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea 
                        value={formData.other_restrictions}
                        onChange={(e) => handleInputChange('other_restrictions', e.target.value)}
                        placeholder="Başka özel bir durum? (Helal, Kosher vb.)" 
                        className="w-full h-24 bg-white border-2 border-gray-200 rounded-2xl p-4 text-sm font-medium resize-none outline-none focus:border-rejimde-purple transition"
                    ></textarea>
                </div>
            </Section>

            {/* 4. OYUNLAŞTIRMA */}
            <Section title="Alışkanlıklar & Hedef" icon="fa-trophy" isOpen={openSections.gamification} onToggle={() => toggleSection('gamification')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wide">En Büyük Zorluğun?</label>
                        <select value={formData.biggest_struggle} onChange={(e) => handleInputChange('biggest_struggle', e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none">
                            <option value="sweet_cravings">Tatlı Krizleri</option>
                            <option value="night_eating">Gece Yeme</option>
                            <option value="portion_control">Porsiyon Kontrolü</option>
                            <option value="motivation">Motivasyon</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wide">Haftalık Kaçamak Hakkı?</label>
                        <div className="flex gap-2">
                            {['0', '1', '2', '3'].map(n => (
                                <button 
                                    key={n}
                                    onClick={() => handleInputChange('cheat_meals_per_week', n)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-black border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition ${formData.cheat_meals_per_week === n ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white border-gray-200 text-gray-500'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

          </div>
        )}

      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40 pb-safe">
        <div className="max-w-xl mx-auto flex gap-4">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="px-8 py-4 rounded-2xl font-black text-gray-400 bg-gray-100 border-b-4 border-gray-200 hover:bg-gray-200 active:border-b-0 active:translate-y-1 transition-all"
            >
              GERİ
            </button>
          )}
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="flex-1 bg-rejimde-purple text-white py-4 rounded-2xl font-black text-lg border-b-4 border-purple-700 hover:bg-purple-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              DEVAM ET <i className="fa-solid fa-arrow-right"></i>
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="flex-1 bg-rejimde-green text-white py-4 rounded-2xl font-black text-lg border-b-4 border-green-700 hover:bg-green-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-200/50"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> DİYETİ OLUŞTUR
            </button>
          )}
        </div>
      </div>

    </div>
  );
}