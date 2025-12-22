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
  fitness_level: string; // beginner, intermediate, advanced
  goal: string; // muscle, lose_weight, endurance, flexibility
  equipment: string; // gym, home_equipment, bodyweight
  duration: string; // 15, 30, 45, 60
  limitations: string; // Sakatlıklar vb.
}

// --- SABİTLER ---
const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Başlangıç', desc: 'Yeni başlıyorum', icon: 'fa-baby' },
  { id: 'intermediate', label: 'Orta Seviye', desc: 'Düzenli spor yapıyorum', icon: 'fa-person-running' },
  { id: 'advanced', label: 'İleri Seviye', desc: 'Yüksek performans', icon: 'fa-dumbbell' },
];

const GOALS = [
  { id: 'lose_weight', label: 'Kilo Vermek / Yağ Yakmak', icon: 'fa-fire' },
  { id: 'muscle_build', label: 'Kas Yapmak / Hacim', icon: 'fa-arm-flex' },
  { id: 'endurance', label: 'Dayanıklılık / Kondisyon', icon: 'fa-heart-pulse' },
  { id: 'flexibility', label: 'Esneklik / Mobilite', icon: 'fa-person-dots-from-line' },
];

const EQUIPMENTS = [
  { id: 'bodyweight', label: 'Sadece Vücut Ağırlığı', icon: 'fa-person' },
  { id: 'home_equipment', label: 'Ev Ekipmanları (Dambıl vb.)', icon: 'fa-house' },
  { id: 'gym', label: 'Spor Salonu (Tam Ekipman)', icon: 'fa-building' },
];

const LOADING_MESSAGES = [
  "Fitness seviyen analiz ediliyor...",
  "Kas grupları hedefleniyor...",
  "En etkili hareketler seçiliyor...",
  "Set ve tekrar sayıları optimize ediliyor...",
  "Dinlenme süreleri ayarlanıyor...",
  "Antrenman programın hazırlanıyor..."
];

export default function AIWorkoutGeneratorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  
  const [formData, setFormData] = useState<FormData>({
    gender: 'female',
    age: '',
    height: '',
    weight: '',
    fitness_level: 'beginner',
    goal: 'lose_weight',
    equipment: 'bodyweight',
    duration: '30',
    limitations: ''
  });

  // Loading Animasyonu
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
    if (step === 1) {
      if (!formData.age || !formData.height || !formData.weight) return alert("Lütfen fiziksel bilgilerinizi giriniz.");
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
      const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';
      
      const response = await fetch(`${apiUrl}/rejimde/v1/ai/generate-exercise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Sunucu hatası: ${response.status}`);
      }

      if (result.status === 'success') {
        router.push(`/exercises/${result.data.slug}`);
      } else {
        alert(result.message || "Bir hata oluştu.");
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
      <div className="min-h-screen bg-blue-600 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl absolute top-1/4 left-1/4 animate-pulse"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl relative">
             <i className="fa-solid fa-bolt text-4xl text-yellow-300 animate-pulse"></i>
             <div className="absolute inset-0 border-4 border-t-white/80 border-r-white/40 border-b-white/10 border-l-white/40 rounded-full animate-spin"></div>
          </div>
          
          <h2 className="text-2xl font-black mb-2">AI Antrenörün Çalışıyor</h2>
          <p className="text-blue-200 text-lg font-medium min-h-[30px] animate-fade-in">
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
        <Link href="/exercises" className="text-gray-400 hover:text-gray-600 transition">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black text-gray-800">AI Antrenman Asistanı</h1>
          <div className="flex justify-center gap-1 mt-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'}`}></div>
            ))}
          </div>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* STEP 1: Profil */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Fiziksel Profil</h2>
              <p className="text-gray-500">Antrenman yoğunluğunu ayarlamak için bu bilgilere ihtiyacımız var.</p>
            </div>

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

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Yaşın</label>
                <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="Örn: 28" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Boy (cm)</label>
                  <input type="number" value={formData.height} onChange={(e) => handleInputChange('height', e.target.value)} placeholder="Örn: 175" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Kilo (kg)</label>
                  <input type="number" value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} placeholder="Örn: 75" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 transition" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Seviye & Hedef */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Seviye ve Hedef</h2>
              <p className="text-gray-500">Sana en uygun programı seçelim.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Fitness Seviyesi</label>
              <div className="grid grid-cols-3 gap-2">
                {FITNESS_LEVELS.map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => handleInputChange('fitness_level', lvl.id)}
                    className={`p-3 rounded-2xl border-2 text-center transition ${formData.fitness_level === lvl.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-400 hover:border-blue-200'}`}
                  >
                    <i className={`fa-solid ${lvl.icon} text-2xl mb-2 block`}></i>
                    <span className="text-xs font-bold">{lvl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase ml-1">Ana Hedefin</label>
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleInputChange('goal', g.id)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition ${formData.goal === g.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.goal === g.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <i className={`fa-solid ${g.icon}`}></i>
                    </div>
                    <span className="font-bold">{g.label}</span>
                  </div>
                  {formData.goal === g.id && <i className="fa-solid fa-circle-check text-xl text-blue-600"></i>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Ekipman & Süre */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Ortam ve Süre</h2>
              <p className="text-gray-500">Nerede ve ne kadar süreyle çalışacaksın?</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {EQUIPMENTS.map(eq => (
                <button
                  key={eq.id}
                  onClick={() => handleInputChange('equipment', eq.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-4 ${formData.equipment === eq.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${formData.equipment === eq.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <i className={`fa-solid ${eq.icon}`}></i>
                  </div>
                  <span className={`font-bold ${formData.equipment === eq.id ? 'text-indigo-900' : 'text-gray-700'}`}>{eq.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Antrenman Süresi (Dakika)</label>
              <div className="flex justify-between gap-2">
                {['15', '30', '45', '60'].map(num => (
                  <button
                    key={num}
                    onClick={() => handleInputChange('duration', num)}
                    className={`flex-1 h-12 rounded-xl font-black text-lg border-2 transition ${formData.duration === num ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Kısıtlamalar */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Özel Durumlar</h2>
              <p className="text-gray-500">Varsa sakatlık veya kısıtlamalarını belirt.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Sakatlıklar / Kısıtlamalar</label>
              <textarea 
                value={formData.limitations}
                onChange={(e) => handleInputChange('limitations', e.target.value)}
                placeholder="Örn: Bel fıtığım var, dizlerim ağrıyor, zıplama yapamam..." 
                className="w-full h-40 bg-gray-50 border-none rounded-xl p-4 font-medium text-gray-700 focus:ring-2 focus:ring-gray-200 outline-none resize-none"
              ></textarea>
              <p className="text-[10px] text-gray-400 mt-2 text-right">Opsiyonel - Boş bırakılabilir</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
               <i className="fa-solid fa-circle-info text-blue-500 mt-1"></i>
               <p className="text-xs text-blue-800 leading-relaxed">
                 Yapay zeka, verdiğin bilgilere göre sana özel bir program hazırlayacak. Bu program bir öneri niteliğindedir, ciddi sağlık sorunların varsa doktoruna danışmalısın.
               </p>
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
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2 animate-pulse-slow"
            >
              <i className="fa-solid fa-bolt"></i> Programı Hazırla
            </button>
          )}
        </div>
      </div>

    </div>
  );
}