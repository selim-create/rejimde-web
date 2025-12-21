"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MascotDisplay from "@/components/MascotDisplay";
import { registerUser } from "@/lib/api"; 

export default function UserRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tüm kayıt verilerini tutan state (birth_date eklendi, age kaldırıldı)
  const [formData, setFormData] = useState({
    goal: "",
    gender: "female",
    birth_date: "", // ÖNEMLİ: Backend bu alanı bekliyor (YYYY-MM-DD)
    height: "",
    weight: "", // Backend bunu 'current_weight' olarak eşleyecek
    username: "",
    email: "",
    password: ""
  });
  
  const progress = step === 1 ? '33%' : step === 2 ? '66%' : '100%';

  const handleNext = (nextStep: number) => {
      setStep(nextStep);
      setError(""); 
  };

  const handleRegister = async () => {
      if(!formData.username || !formData.email || !formData.password) {
          setError("Lütfen tüm alanları doldurun.");
          return;
      }
      
      // Doğum tarihi kontrolü
      if(!formData.birth_date) {
           setError("Lütfen doğum tarihinizi girin.");
           setStep(2); // 2. adıma geri götür
           return;
      }

      setLoading(true);
      setError("");

      const result = await registerUser(formData);

      if (result.success) {
          router.push("/dashboard");
      } else {
          setError(result.message || "Kayıt işlemi başarısız oldu.");
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-rejimde-text bg-[#f7f7f7]">

      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 h-16 flex items-center justify-center relative shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
            <i className="fa-solid fa-leaf text-rejimde-green text-2xl group-hover:rotate-12 transition"></i>
            <span className="text-2xl font-extrabold text-rejimde-green tracking-tight">rejimde</span>
        </Link>
        <Link href="/" className="absolute left-4 text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-2xl"></i>
        </Link>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div 
            className="bg-rejimde-green h-2 transition-all duration-500 ease-out" 
            style={{ width: progress }}
        ></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">

        {/* STEP 1: GOAL */}
        {step === 1 && (
            <div className="w-full text-center animate-fadeIn">
                <div className="flex justify-center mb-6">
                    <MascotDisplay state="onboarding_welcome" size={150} showBubble={false} />
                </div>
                
                <h1 className="text-2xl md:text-3xl font-black text-gray-700 mb-8">Seni buraya getiren hedef ne?</h1>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => { setFormData({...formData, goal: 'weight_loss'}); handleNext(2); }} 
                        className="w-full bg-white border-2 border-gray-200 p-4 rounded-2xl flex items-center gap-4 hover:border-rejimde-blue hover:bg-blue-50 transition group shadow-sm hover:shadow-md text-left btn-game"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                            ⚖️
                        </div>
                        <div>
                            <h3 className="font-extrabold text-gray-700 text-lg">Kilo Vermek</h3>
                            <p className="text-xs font-bold text-gray-400">Fazlalıklardan kurtulmak istiyorum.</p>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => { setFormData({...formData, goal: 'muscle_gain'}); handleNext(2); }}
                        className="w-full bg-white border-2 border-gray-200 p-4 rounded-2xl flex items-center gap-4 hover:border-rejimde-green hover:bg-green-50 transition group shadow-sm hover:shadow-md text-left btn-game"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                            💪
                        </div>
                        <div>
                            <h3 className="font-extrabold text-gray-700 text-lg">Kas Yapmak</h3>
                            <p className="text-xs font-bold text-gray-400">Daha güçlü ve fit görünmek istiyorum.</p>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => { setFormData({...formData, goal: 'healthy_living'}); handleNext(2); }}
                        className="w-full bg-white border-2 border-gray-200 p-4 rounded-2xl flex items-center gap-4 hover:border-rejimde-purple hover:bg-purple-50 transition group shadow-sm hover:shadow-md text-left btn-game"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                            🍎
                        </div>
                        <div>
                            <h3 className="font-extrabold text-gray-700 text-lg">Sağlıklı Yaşamak</h3>
                            <p className="text-xs font-bold text-gray-400">Daha enerjik ve zinde hissetmek.</p>
                        </div>
                    </button>
                </div>
            </div>
        )}

        {/* STEP 2: STATS */}
        {step === 2 && (
            <div className="w-full text-center animate-fadeIn">
                <h1 className="text-2xl md:text-3xl font-black text-gray-700 mb-2">Vücudunu tanıyalım</h1>
                <p className="text-gray-400 font-bold mb-8">Sana özel Rejimde Skoru oluşturmak için buna ihtiyacımız var.</p>

                <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm mb-8 space-y-6 text-left">
                    
                    {/* Cinsiyet */}
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Cinsiyet</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['female', 'male', 'other', 'prefer_not_to_say'].map((g) => (
                                <button 
                                    key={g}
                                    onClick={() => setFormData({...formData, gender: g})}
                                    className={`py-3 border-2 rounded-xl font-extrabold text-xs transition ${formData.gender === g ? 'border-rejimde-blue bg-blue-50 text-rejimde-blue' : 'border-gray-200 text-gray-500 hover:border-blue-200'}`}
                                >
                                    {g === 'female' ? 'Kadın' : g === 'male' ? 'Erkek' : g === 'other' ? 'Diğer' : 'Belirtmem'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-left text-xs font-black text-gray-400 uppercase mb-1">Doğum Tarihi</label>
                            <input 
                                type="date" 
                                value={formData.birth_date}
                                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                                className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-green rounded-xl py-3 px-2 font-bold text-gray-700 outline-none text-center text-sm md:text-lg transition" 
                            />
                        </div>
                        <div>
                            <label className="block text-left text-xs font-black text-gray-400 uppercase mb-1">Boy (cm)</label>
                            <input 
                                type="number" 
                                placeholder="170" 
                                value={formData.height}
                                onChange={(e) => setFormData({...formData, height: e.target.value})}
                                className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-green rounded-xl py-3 px-4 font-black text-gray-700 outline-none text-center text-lg transition" 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-left text-xs font-black text-gray-400 uppercase mb-1">Güncel Kilo (kg)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                placeholder="70" 
                                value={formData.weight}
                                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-green rounded-xl py-3 px-4 font-black text-gray-700 outline-none text-center text-xl transition" 
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs font-bold">KG</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                     <button onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-200 transition">
                        Geri
                    </button>
                    <button onClick={() => handleNext(3)} className="flex-1 bg-rejimde-green text-white py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide">
                        Devam Et
                    </button>
                </div>
            </div>
        )}

        {/* STEP 3: CREATE ACCOUNT */}
        {step === 3 && (
            <div className="w-full text-center animate-fadeIn">
                <div className="mb-8 flex flex-col items-center">
                    <i className="fa-solid fa-trophy text-rejimde-yellow text-6xl mb-4 animate-bounce"></i>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-700 mb-2">Harika! Profilin Hazır.</h1>
                    <p className="text-gray-400 font-bold">Hesabını oluştur ve <span className="text-rejimde-green">+50 Puan</span> ile başla.</p>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm font-bold animate-pulse">
                        {error}
                    </div>
                )}

                <div className="space-y-4 max-w-sm mx-auto">
                    
                    <div className="space-y-3">
                        <div className="text-left">
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1">Kullanıcı Adı</label>
                            <input 
                                type="text" 
                                placeholder="kullanici_adi" 
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold text-gray-600 outline-none transition" 
                            />
                        </div>
                        <div className="text-left">
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1">E-posta</label>
                            <input 
                                type="email" 
                                placeholder="ornek@email.com" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold text-gray-600 outline-none transition" 
                            />
                        </div>
                        <div className="text-left">
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1">Şifre</label>
                            <input 
                                type="password" 
                                placeholder="********" 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold text-gray-600 outline-none transition" 
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-rejimde-blue text-white py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-blueDark btn-game uppercase tracking-wide mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : "HESAP OLUŞTUR"}
                    </button>

                    <div className="flex items-center gap-4 py-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-gray-400 text-xs font-bold uppercase">veya</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <button className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-extrabold flex items-center justify-center gap-3 shadow-btn shadow-gray-200 btn-game hover:bg-gray-50 transition">
                        <img src="https://img.icons8.com/color/48/google-logo.png" className="w-6 h-6" alt="Google" />
                        Google ile Devam Et
                    </button>
                </div>
                
                <p className="text-[10px] text-gray-400 font-bold mt-6">
                    Kayıt olarak <a href="#" className="text-rejimde-blue hover:underline">Kullanım Şartları</a>nı kabul etmiş olursun.
                </p>
                <button onClick={() => setStep(2)} className="mt-4 text-gray-400 font-bold text-xs hover:text-gray-600">Geri Dön</button>
            </div>
        )}

      </main>
    </div>
  );
}