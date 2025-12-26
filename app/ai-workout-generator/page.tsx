"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/api";

// --- TİPLER ---
interface FormData {
  // Temel
  gender: string;
  age: string;
  height: string;
  weight: string;
  fitness_level: string; 
  goal: string; 
  
  // Lojistik
  equipment: string;
  equipment_details: string[]; // Dambıl, Mat, Barfiks vb.
  duration: string; // Günlük seans süresi (dk)
  days: string;     // Program süresi (gün)
  days_per_week: string; // Haftalık sıklık

  // Detay & Tercih
  focus_area: string; 
  split_preference: string; // Full Body, Upper/Lower, PPL
  workout_type: string; // Kuvvet, HIIT, Karışık
  silent_mode: boolean; // Apartman modu
  warmup: boolean;

  // Kısıtlamalar
  limitations: string;
  disliked_exercises: string[];
}

// Varsayılan Değerler
const INITIAL_DATA: FormData = {
  gender: 'female', age: '', height: '', weight: '',
  fitness_level: 'beginner', goal: 'lose_weight',
  equipment: 'bodyweight', equipment_details: [], 
  duration: '30', days: '7', days_per_week: '3',
  focus_area: 'full_body', split_preference: 'full_body', workout_type: 'mixed',
  silent_mode: false, warmup: true,
  limitations: '', disliked_exercises: []
};

// --- SABİTLER ---
const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Başlangıç', desc: 'Yeni başlıyorum', icon: 'fa-baby' },
  { id: 'intermediate', label: 'Orta Seviye', desc: 'Düzenli spor yapıyorum', icon: 'fa-person-running' },
  { id: 'advanced', label: 'İleri Seviye', desc: 'Yüksek performans', icon: 'fa-dumbbell' },
];

const GOALS = [
  { id: 'lose_weight', label: 'Yağ Yakımı', icon: 'fa-fire' },
  { id: 'muscle_build', label: 'Kas İnşası', icon: 'fa-arm-flex' },
  { id: 'endurance', label: 'Kondisyon', icon: 'fa-heart-pulse' },
  { id: 'flexibility', label: 'Esneklik', icon: 'fa-person-dots-from-line' },
];

const EQUIPMENTS = [
  { id: 'bodyweight', label: 'Sadece Vücut', icon: 'fa-person' },
  { id: 'home_equipment', label: 'Ev Ekipmanı', icon: 'fa-house' },
  { id: 'gym', label: 'Spor Salonu', icon: 'fa-building' },
];

const SPLIT_OPTIONS = [
    { id: 'full_body', label: 'Full Body (Tüm Vücut)' },
    { id: 'upper_lower', label: 'Alt / Üst Vücut' },
    { id: 'ppl', label: 'İtiş / Çekiş / Bacak (PPL)' },
    { id: 'regional', label: 'Bölgesel (Split)' },
];

const WORKOUT_TYPES = [
    { id: 'mixed', label: 'Karışık (Önerilen)' },
    { id: 'strength', label: 'Kuvvet Odaklı' },
    { id: 'hiit', label: 'HIIT / Kardiyo' },
    { id: 'pilates_yoga', label: 'Pilates / Yoga' },
];

const EQUIPMENT_DETAILS_LIST = ["Dambıl", "Mat", "Direnç Bandı", "Kettlebell", "Barfiks Barı", "Bench/Sehpa", "Koşu Bandı"];
const DISLIKED_LIST = ["Burpee", "Şınav", "Plank", "Lunge", "Squat", "Zıplama"];

const LOADING_MESSAGES = [
  "Vücut tipin analiz ediliyor...",
  "Kas grupları hedefleniyor...",
  "En etkili hareketler seçiliyor...",
  "Set ve tekrar sayıları optimize ediliyor...",
  "Dinlenme süreleri ayarlanıyor...",
  "Program görseli hazırlanıyor...",
  "Antrenman programın oluşturuluyor..."
];

// --- BİLEŞEN: Accordion Section ---
const Section = ({ title, icon, children, isOpen, onToggle }: any) => (
    <div className="border-2 border-gray-100 rounded-3xl overflow-hidden bg-white shadow-[0_4px_0_0_rgba(0,0,0,0.02)] mb-4 transition-all hover:border-gray-200">
        <button 
            onClick={onToggle}
            className="w-full flex items-center justify-between p-5 bg-white transition text-left"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-b-4 transition-all ${isOpen ? 'bg-blue-600 text-white border-blue-800' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                    <i className={`fa-solid ${icon}`}></i>
                </div>
                <div>
                    <h3 className="font-extrabold text-gray-800 text-base">{title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Opsiyonel</p>
                </div>
            </div>
            <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-300'}`}></i>
        </button>
        {isOpen && <div className="p-5 border-t-2 border-gray-100 bg-gray-50/30 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
);

export default function AIWorkoutGeneratorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Accordion States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
      style: false,
      environment: false,
      limitations: false
  });

  // 1. AUTH & DATA FETCHING
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
            router.push('/login?redirect=/ai-workout-generator');
            return;
        }

        try {
            const userData = await auth.me();
            if (userData) {
                setFormData(prev => ({
                    ...prev,
                    gender: userData.gender || prev.gender,
                    age: userData.birth_date ? calculateAge(userData.birth_date).toString() : prev.age,
                    height: userData.height || prev.height,
                    weight: userData.current_weight || prev.weight,
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
      if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--;
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

  const toggleArrayItem = (field: 'equipment_details' | 'disliked_exercises', item: string) => {
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
      // @ts-ignore - lib/api içinde generateExercise mevcut
      const response = await auth.generateExercise(formData);

      if (response.success && response.data?.slug) {
        router.push(`/exercises/${response.data.slug}`);
      } else {
        setError(response.message || "Bir hata oluştu.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      setError(`Hata oluştu: ${error.message}`);
      setLoading(false);
    }
  };

  if (isAuthChecking) return null;

  // --- LOADING EKRANI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-600 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="w-96 h-96 bg-white/10 rounded-full blur-[100px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        
        <div className="relative z-10 text-center max-w-md w-full">
          <div className="w-24 h-24 mx-auto mb-8 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border-2 border-white/20 shadow-2xl relative">
             <i className="fa-solid fa-bolt text-4xl text-yellow-300 animate-pulse"></i>
             <div className="absolute inset-0 border-4 border-t-white/80 border-r-transparent border-b-white/20 border-l-transparent rounded-3xl animate-spin"></div>
          </div>
          
          <h2 className="text-3xl font-black mb-4 tracking-tight">AI Antrenörün Çalışıyor</h2>
          <p className="text-blue-200 text-lg font-bold min-h-[60px] animate-fade-in transition-all">
            {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
          
          <div className="mt-8 bg-white/10 rounded-2xl p-5 text-left text-sm text-blue-100 border-2 border-white/10 shadow-lg">
            <div className="flex items-center gap-2 mb-2 font-black text-yellow-300 uppercase tracking-wide text-xs">
                <i className="fa-solid fa-circle-info"></i> Bilgi
            </div>
            <p className="font-medium">Detaylı program oluşturmak 1-2 dakika sürebilir. Lütfen sayfayı kapatmayın.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-32">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm border-b border-gray-100 sticky top-0 z-40 flex items-center justify-between">
        <Link href="/exercises" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 border-b-4 border-gray-200 hover:bg-gray-200 hover:border-gray-300 hover:text-gray-600 transition-all active:border-b-0 active:translate-y-1">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2.5 w-10 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
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

        {/* STEP 1: Profil */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Fiziksel Profil</h1>
              <p className="text-gray-500 font-medium">Antrenman yoğunluğunu ayarlamak için bu bilgilere ihtiyacımız var.</p>
            </div>

            <div className="bg-white p-2 rounded-3xl border-2 border-gray-100 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] flex gap-2">
              {['female', 'male'].map(g => (
                <button 
                  key={g}
                  onClick={() => handleInputChange('gender', g)}
                  className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${formData.gender === g ? 'bg-blue-600 text-white border-blue-800' : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}`}
                >
                  <i className={`fa-solid ${g === 'female' ? 'fa-venus' : 'fa-mars'}`}></i>
                  {g === 'female' ? 'Kadın' : 'Erkek'}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase ml-3 mb-2 block tracking-wide">Yaş</label>
                <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="Örn: 28" className="w-full bg-white border-2 border-gray-200 rounded-3xl px-6 py-4 text-xl font-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition placeholder-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase ml-3 mb-2 block tracking-wide">Boy (cm)</label>
                  <input type="number" value={formData.height} onChange={(e) => handleInputChange('height', e.target.value)} placeholder="Örn: 175" className="w-full bg-white border-2 border-gray-200 rounded-3xl px-6 py-4 text-xl font-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition placeholder-gray-300" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase ml-3 mb-2 block tracking-wide">Kilo (kg)</label>
                  <input type="number" value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} placeholder="Örn: 75" className="w-full bg-white border-2 border-gray-200 rounded-3xl px-6 py-4 text-xl font-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition placeholder-gray-300" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Seviye & Hedef */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Seviye ve Hedef</h2>
              <p className="text-gray-500 font-medium">Sana en uygun programı seçelim.</p>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-4 tracking-wide ml-2">Fitness Seviyesi</label>
              <div className="grid grid-cols-3 gap-3">
                {FITNESS_LEVELS.map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => handleInputChange('fitness_level', lvl.id)}
                    className={`p-4 rounded-3xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 flex flex-col items-center gap-2 transition text-center ${formData.fitness_level === lvl.id ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'}`}
                  >
                    <i className={`fa-solid ${lvl.icon} text-2xl mb-1`}></i>
                    <span className="text-xs font-black">{lvl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-[0_4px_0_0_rgba(0,0,0,0.02)]">
                <label className="block text-xs font-black text-gray-400 uppercase mb-4 tracking-wide">Ana Hedefin</label>
                <div className="space-y-3">
                    {GOALS.map(g => (
                        <button
                        key={g.id}
                        onClick={() => handleInputChange('goal', g.id)}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition active:scale-[0.98] ${formData.goal === g.id ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
                        >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.goal === g.id ? 'bg-blue-200' : 'bg-white'}`}>
                                <i className={`fa-solid ${g.icon} text-sm`}></i>
                            </div>
                            <div className="text-left font-extrabold text-sm">{g.label}</div>
                        </div>
                        {formData.goal === g.id && <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs"><i className="fa-solid fa-check"></i></div>}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* STEP 3: Lojistik & Süre */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Ortam ve Süre</h2>
              <p className="text-gray-500 font-medium">Nerede ve ne kadar süreyle çalışacaksın?</p>
            </div>

            {/* Ekipman Ana Seçim */}
            <div className="grid grid-cols-1 gap-3">
              {EQUIPMENTS.map(eq => (
                <button
                  key={eq.id}
                  onClick={() => handleInputChange('equipment', eq.id)}
                  className={`p-5 rounded-3xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 text-left transition flex items-center gap-4 ${formData.equipment === eq.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${formData.equipment === eq.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <i className={`fa-solid ${eq.icon}`}></i>
                  </div>
                  <span className={`font-black text-lg ${formData.equipment === eq.id ? 'text-indigo-900' : 'text-gray-700'}`}>{eq.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-[0_4px_0_0_rgba(0,0,0,0.02)] space-y-6">
                
                {/* Program Süresi (Toplam Gün) */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2 tracking-wide">
                        <i className="fa-regular fa-calendar"></i> Program Süresi
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                        {['3', '7', '14', '28'].map(d => (
                            <button
                                key={d}
                                onClick={() => handleInputChange('days', d)}
                                className={`py-3 rounded-2xl font-black text-xl border-b-4 active:border-b-0 active:translate-y-1 transition-all ${formData.days === d ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'}`}
                            >
                                {d} <span className="text-[9px] uppercase font-bold block -mt-1 opacity-70">Gün</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Haftalık Sıklık */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2 tracking-wide">
                        <i className="fa-solid fa-rotate"></i> Haftada Kaç Gün?
                    </label>
                    <div className="flex gap-2">
                        {['2', '3', '4', '5', '6'].map(d => (
                            <button
                                key={d}
                                onClick={() => handleInputChange('days_per_week', d)}
                                className={`flex-1 py-3 rounded-2xl font-bold border-2 transition ${formData.days_per_week === d ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-500'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Seans Süresi */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2 tracking-wide">
                        <i className="fa-regular fa-clock"></i> Günlük Süre (Dk)
                    </label>
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
          </div>
        )}

        {/* STEP 4: Özelleştirme */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Kişiselleştirme</h2>
              <p className="text-gray-500 font-medium">Programı tam sana göre ayarlayalım.</p>
            </div>

            {/* 1. ANTRENMAN TARZI */}
            <Section title="Antrenman Tarzı" icon="fa-dumbbell" isOpen={openSections.style} onToggle={() => toggleSection('style')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Split Tercihi</label>
                        <div className="grid grid-cols-2 gap-2">
                            {SPLIT_OPTIONS.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleInputChange('split_preference', s.id)}
                                    className={`p-3 rounded-xl text-xs font-bold border-2 transition text-left ${formData.split_preference === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-500'}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Antrenman Tipi</label>
                        <div className="flex flex-wrap gap-2">
                            {WORKOUT_TYPES.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => handleInputChange('workout_type', w.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${formData.workout_type === w.id ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    {w.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* 2. ORTAM & EKİPMAN DETAYI */}
            <Section title="Ortam & Ekipman" icon="fa-house" isOpen={openSections.environment} onToggle={() => toggleSection('environment')}>
                <div className="space-y-4">
                    {formData.equipment !== 'gym' && (
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Elimdeki Ekipmanlar</label>
                            <div className="flex flex-wrap gap-2">
                                {EQUIPMENT_DETAILS_LIST.map(eq => (
                                    <button
                                        key={eq}
                                        onClick={() => toggleArrayItem('equipment_details', eq)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${formData.equipment_details.includes(eq) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-500 border-gray-200'}`}
                                    >
                                        {eq}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 cursor-pointer">
                            <input type="checkbox" checked={formData.silent_mode} onChange={(e) => handleInputChange('silent_mode', e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-0" />
                            <span className="text-sm font-bold text-gray-700">Apartman Modu (Sessiz, Zıplamasız)</span>
                        </label>
                        <label className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 cursor-pointer">
                            <input type="checkbox" checked={formData.warmup} onChange={(e) => handleInputChange('warmup', e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-0" />
                            <span className="text-sm font-bold text-gray-700">Isınma & Soğuma Eklensin</span>
                        </label>
                    </div>
                </div>
            </Section>

            {/* 3. KISITLAMALAR */}
            <Section title="Kısıtlamalar" icon="fa-user-injured" isOpen={openSections.limitations} onToggle={() => toggleSection('limitations')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Sevmediklerim</label>
                        <div className="flex flex-wrap gap-2">
                            {DISLIKED_LIST.map(ex => (
                                <button
                                    key={ex}
                                    onClick={() => toggleArrayItem('disliked_exercises', ex)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${formData.disliked_exercises.includes(ex) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Sakatlık / Özel Durum</label>
                        <textarea 
                            value={formData.limitations}
                            onChange={(e) => handleInputChange('limitations', e.target.value)}
                            placeholder="Örn: Bel fıtığım var, dizlerim hassas..." 
                            className="w-full h-24 bg-white border-2 border-gray-200 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500 transition resize-none"
                        ></textarea>
                    </div>
                </div>
            </Section>

            <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-100 flex gap-4 items-start">
               <div className="bg-blue-200 w-8 h-8 rounded-full flex items-center justify-center text-blue-700 flex-shrink-0">
                   <i className="fa-solid fa-user-doctor"></i>
               </div>
               <p className="text-xs text-blue-800 leading-relaxed font-medium pt-1">
                 Yapay zeka, verdiğin bilgilere göre sana özel bir program hazırlayacak. Bu program bir öneri niteliğindedir, ciddi sağlık sorunların varsa doktoruna danışmalısın.
               </p>
            </div>
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
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-lg border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              DEVAM ET <i className="fa-solid fa-arrow-right"></i>
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg border-b-4 border-indigo-800 hover:bg-indigo-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200/50"
            >
              <i className="fa-solid fa-bolt"></i> PROGRAMI HAZIRLA
            </button>
          )}
        </div>
      </div>

    </div>
  );
}