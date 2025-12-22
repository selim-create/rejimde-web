"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- TİPLER ---
interface FormData {
  gender: string;
  age: string;
  height: string;
  weight: string;
  activity_level: string;
  goal: string;
  diet_type: string;
  meals_count: string;
  budget: string;
  allergies: string;
}

// --- SABİTLER ---
const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Hareketsiz', desc: 'Masa başı iş, spor yok', icon: 'fa-chair' },
  { id: 'light', label: 'Az Hareketli', desc: 'Haftada 1-3 gün hafif spor', icon: 'fa-person-walking' },
  { id: 'moderate', label: 'Orta Hareketli', desc: 'Haftada 3-5 gün spor', icon: 'fa-person-running' },
  { id: 'active', label: 'Çok Hareketli', desc: 'Haftada 6-7 gün yoğun spor', icon: 'fa-dumbbell' },
];

const GOALS = [
  { id: 'lose_weight', label: 'Kilo Vermek', icon: 'fa-arrow-trend-down' },
  { id: 'maintain', label: 'Korumak', icon: 'fa-scale-balanced' },
  { id: 'gain_muscle', label: 'Kas Yapmak', icon: 'fa-arm-flex' },
];

const DIET_TYPES = [
  { id: 'standard', label: 'Standart', desc: 'Her şeyden dengeli', icon: 'fa-utensils' },
  { id: 'mediterranean', label: 'Akdeniz', desc: 'Sebze, zeytinyağı, balık', icon: 'fa-fish' },
  { id: 'keto', label: 'Ketojenik', desc: 'Yüksek yağ, düşük karbonhidrat', icon: 'fa-bacon' },
  { id: 'vegan', label: 'Vegan', desc: 'Sadece bitkisel kaynaklı', icon: 'fa-leaf' },
  { id: 'vegetarian', label: 'Vejetaryen', desc: 'Et yok, süt/yumurta var', icon: 'fa-carrot' },
  { id: 'gluten_free', label: 'Glutensiz', desc: 'Buğday ve türevleri yok', icon: 'fa-bread-slice' },
];

const LOADING_MESSAGES = [
  "Metabolizman analiz ediliyor...",
  "Besin değerleri hesaplanıyor...",
  "Market listesi kontrol ediliyor...",
  "Sana en uygun tarifler seçiliyor...",
  "Diyetisyenin notları ekleniyor...",
  "Neredeyse hazır..."
];

export default function AIDietGeneratorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  
  const [formData, setFormData] = useState<FormData>({
    gender: 'female',
    age: '',
    height: '',
    weight: '',
    activity_level: 'sedentary',
    goal: 'lose_weight',
    diet_type: 'standard',
    meals_count: '3',
    budget: 'standard',
    allergies: ''
  });

  // Loading mesaj animasyonu
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Basit Validasyonlar
    if (step === 1) {
      if (!formData.age || !formData.height || !formData.weight) return alert("Lütfen tüm alanları doldurun.");
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      // API URL'sinin sonuna /wp-json eklenmiş olması önemlidir.
      // process.env.NEXT_PUBLIC_WP_API_URL yoksa varsayılan olarak http://localhost/wp-json kullanılır.
      const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';
      
      // Backend Endpoint
      const response = await fetch(`${apiUrl}/rejimde/v1/ai/generate-diet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(formData)
      });

      // Hata durumunu kontrol et ve JSON olarak parse et
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Sunucu hatası: ${response.status}`);
      }

      if (result.status === 'success') {
        // Başarılı, yeni plana yönlendir
        router.push(`/diets/${result.data.slug}`);
      } else {
        alert(result.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      alert(`Hata oluştu: ${error.message}`);
      setLoading(false);
    }
  };

  // --- LOADING EKRANI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-rejimde-purple text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Arkaplan Efektleri */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="w-64 h-64 bg-rejimde-blue/30 rounded-full blur-3xl absolute top-1/4 left-1/4 animate-pulse"></div>
        <div className="w-64 h-64 bg-rejimde-yellow/20 rounded-full blur-3xl absolute bottom-1/4 right-1/4 animate-pulse delay-700"></div>

        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl relative">
             <i className="fa-solid fa-wand-magic-sparkles text-4xl text-yellow-300 animate-bounce"></i>
             <div className="absolute inset-0 border-4 border-t-white/80 border-r-white/40 border-b-white/10 border-l-white/40 rounded-full animate-spin"></div>
          </div>
          
          <h2 className="text-2xl font-black mb-2">Rejimde AI Çalışıyor</h2>
          <p className="text-purple-200 text-lg font-medium min-h-[30px] animate-fade-in">
            {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-20">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-40">
        <Link href="/diets" className="text-gray-400 hover:text-gray-600 transition">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black text-gray-800">AI Diyet Asistanı</h1>
          <div className="flex justify-center gap-1 mt-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'w-6 bg-rejimde-purple' : 'w-2 bg-gray-200'}`}></div>
            ))}
          </div>
        </div>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* STEP 1: Vücut Analizi */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Seni Tanıyalım</h2>
              <p className="text-gray-500">Doğru hesaplama için vücut ölçülerin önemli.</p>
            </div>

            {/* Cinsiyet */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleInputChange('gender', 'female')}
                className={`p-6 rounded-2xl border-2 transition flex flex-col items-center gap-3 ${formData.gender === 'female' ? 'border-pink-400 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-400 hover:border-pink-200'}`}
              >
                <i className="fa-solid fa-venus text-3xl"></i>
                <span className="font-bold">Kadın</span>
              </button>
              <button 
                onClick={() => handleInputChange('gender', 'male')}
                className={`p-6 rounded-2xl border-2 transition flex flex-col items-center gap-3 ${formData.gender === 'male' ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-400 hover:border-blue-200'}`}
              >
                <i className="fa-solid fa-mars text-3xl"></i>
                <span className="font-bold">Erkek</span>
              </button>
            </div>

            {/* Inputlar */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Yaşın</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Örn: 28" 
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-rejimde-purple transition" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Boy (cm)</label>
                  <input 
                    type="number" 
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="Örn: 170" 
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-rejimde-purple transition" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Kilo (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="Örn: 70" 
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-rejimde-purple transition" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Hedef & Aktivite */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Hedefin Ne?</h2>
              <p className="text-gray-500">Sana en uygun kaloriyi hesaplayacağız.</p>
            </div>

            <div className="space-y-3">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleInputChange('goal', g.id)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition ${formData.goal === g.id ? 'border-rejimde-purple bg-purple-50 text-rejimde-purple' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.goal === g.id ? 'bg-rejimde-purple text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <i className={`fa-solid ${g.icon}`}></i>
                    </div>
                    <span className="font-bold">{g.label}</span>
                  </div>
                  {formData.goal === g.id && <i className="fa-solid fa-circle-check text-xl"></i>}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Günlük Hareketin</label>
              <div className="grid grid-cols-2 gap-3">
                {ACTIVITY_LEVELS.map(act => (
                  <button
                    key={act.id}
                    onClick={() => handleInputChange('activity_level', act.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition ${formData.activity_level === act.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'}`}
                  >
                    <div className="text-2xl mb-2">
                        <i className={`fa-solid ${act.icon} ${formData.activity_level === act.id ? 'text-blue-600' : 'text-gray-300'}`}></i>
                    </div>
                    <div className={`font-bold text-sm ${formData.activity_level === act.id ? 'text-blue-800' : 'text-gray-700'}`}>{act.label}</div>
                    <div className="text-[10px] text-gray-400 leading-tight mt-1">{act.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Beslenme Tercihleri */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Mutfak Tercihlerin</h2>
              <p className="text-gray-500">Damak tadına uygun bir liste hazırlayalım.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DIET_TYPES.map(dt => (
                <button
                  key={dt.id}
                  onClick={() => handleInputChange('diet_type', dt.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition relative overflow-hidden ${formData.diet_type === dt.id ? 'border-rejimde-green bg-green-50' : 'border-gray-200 bg-white hover:border-green-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <i className={`fa-solid ${dt.icon} text-2xl ${formData.diet_type === dt.id ? 'text-rejimde-green' : 'text-gray-300'}`}></i>
                    {formData.diet_type === dt.id && <i className="fa-solid fa-check text-rejimde-green bg-white rounded-full p-1 text-xs"></i>}
                  </div>
                  <div className={`font-bold text-sm ${formData.diet_type === dt.id ? 'text-green-800' : 'text-gray-700'}`}>{dt.label}</div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-1">{dt.desc}</div>
                </button>
              ))}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Günde Kaç Öğün?</label>
              <div className="flex justify-between gap-2">
                {['2', '3', '4', '5', '6'].map(num => (
                  <button
                    key={num}
                    onClick={() => handleInputChange('meals_count', num)}
                    className={`flex-1 h-12 rounded-xl font-black text-lg border-2 transition ${formData.meals_count === num ? 'border-rejimde-yellow bg-yellow-50 text-yellow-700' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Detaylar & Onay */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Son Dokunuşlar</h2>
              <p className="text-gray-500">Bütçeni ve varsa alerjilerini belirle.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              
              {/* Bütçe */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Bütçe Tercihi</label>
                <div className="flex gap-2">
                  {[
                    { id: 'economic', label: 'Ekonomik', icon: 'fa-piggy-bank' },
                    { id: 'standard', label: 'Standart', icon: 'fa-wallet' },
                    { id: 'premium', label: 'Premium', icon: 'fa-gem' }
                  ].map(b => (
                    <button
                      key={b.id}
                      onClick={() => handleInputChange('budget', b.id)}
                      className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-1 transition ${formData.budget === b.id ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                    >
                      <i className={`fa-solid ${b.icon}`}></i>
                      <span className="text-xs font-bold">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerjiler */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Yemediklerin / Alerjiler</label>
                <textarea 
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="Örn: Süt ürünleri, yumurta, mantar sevmem..." 
                  className="w-full h-32 bg-gray-50 border-none rounded-xl p-4 font-medium text-gray-700 focus:ring-2 focus:ring-gray-200 outline-none resize-none"
                ></textarea>
                <p className="text-[10px] text-gray-400 mt-2 text-right">Opsiyonel</p>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-2xl mx-auto flex gap-4">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="px-6 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition"
            >
              Geri
            </button>
          )}
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              Devam Et <i className="fa-solid fa-arrow-right"></i>
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="flex-1 bg-rejimde-purple text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-purple-200 hover:bg-purple-700 transition flex items-center justify-center gap-2 animate-pulse-slow"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> Diyetimi Oluştur
            </button>
          )}
        </div>
      </div>

    </div>
  );
}