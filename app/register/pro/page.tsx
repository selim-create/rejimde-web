"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, uploadAvatar, updateUser } from "@/lib/api";
import { CITIES } from "@/lib/locations";
import { 
  PROFESSION_CATEGORIES, 
  EXPERTISE_TAGS, 
  GOAL_TAGS, 
  COUNTRY_OPTIONS 
} from "@/lib/constants";

// Danışan Metodu seçenekleri (Çoklu seçim)
const CONSULTATION_METHOD_OPTIONS = [
  { id: 'message', icon: 'fa-message', label: 'Yazılı Mesaj' },
  { id: 'video', icon: 'fa-video', label: 'Video Görüşme' },
  { id: 'face', icon: 'fa-people-arrows', label: 'Yüz Yüze' },
];

export default function ProRegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  
  // Dosya State'i
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  // FORM STATE - Güncellenmiş
  const [formData, setFormData] = useState({
      // Adım 1: Uzmanlık
      profession: "", 
      profession_label: "",
      
      // Adım 2: Hesap & İletişim
      name: "",
      title: "", // YENİ:  Ünvan (opsiyonel)
      brand_name: "",
      country: "TR", // YENİ:  Ülke
      city: "",
      district: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      
      // Adım 3: Detaylar - Güncellenmiş
      expertise_tags: [] as string[], // Uzmanlık Alanları tagleri
      goal_tags: [] as string[], // Çalıştığı Hedefler tagleri
      communication_preference: [] as string[], // Danışan Metodu (çoklu)
      working_hours: {
        weekday: "",
        weekend: ""
      },
      response_time: "24h",
      address: ""
  });

  // Seçilen şehre göre ilçeleri getir
  const selectedCity = CITIES.find(c => c.id === formData.city);

  // Tag toggle helper
  const toggleTag = (field: 'expertise_tags' | 'goal_tags' | 'communication_preference', value: string) => {
    setFormData(prev => {
      const currentTags = prev[field] as string[];
      if (currentTags. includes(value)) {
        return { ...prev, [field]: currentTags. filter(t => t !== value) };
      }
      return { ... prev, [field]:  [...currentTags, value] };
    });
  };

  const handleFileChange = (e: React. ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e. target.files[0]) {
          const file = e. target.files[0];
          if (file.size > 5 * 1024 * 1024) {
              setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
              return;
          }
          setCertificateFile(file);
          setError("");
      }
  };

  const handleRegister = async () => {
      if (!formData.name || ! formData.email || !formData. password || !formData.username) {
          setError("Lütfen zorunlu alanları doldurun.");
          return;
      }

      setLoading(true);
      setError("");

      try {
          // Lokasyon string oluştur
          let locationStr = "";
          if (formData.country === "TR") {
              const cityName = CITIES.find(c => c.id === formData.city)?.name || '';
              locationStr = formData.district ?  `${cityName}, ${formData.district}` : cityName;
          } else {
              const countryLabel = COUNTRY_OPTIONS.find(c => c.id === formData.country)?.label || '';
              locationStr = formData.city ? `${formData.city}, ${countryLabel}` : countryLabel;
          }

          const payload = {
              username: formData.username,
              email: formData.email,
              password:  formData.password,
              role: 'rejimde_pro',
              meta: {
                  profession: formData.profession,
                  title: formData.title || formData.profession_label,
                  name: formData.name,
                  brand_name: formData.brand_name,
                  country:  formData.country,
                  city:  formData.city,
                  district: formData.district,
                  location: locationStr,
                  phone: formData.phone,
                  address: formData.address,
                  // Yeni alanlar
                  expertise_tags: formData.expertise_tags,
                  goal_tags:  formData.goal_tags,
                  communication_preference: formData.communication_preference,
                  working_hours: formData.working_hours,
                  response_time: formData.response_time,
              }
          };

          const result = await registerUser(payload);

          if (result. success) {
              if (certificateFile) {
                  try {
                      const uploadRes = await uploadAvatar(certificateFile); 
                      if (uploadRes.success && uploadRes.url) {
                          await updateUser({
                              certificate_url: uploadRes.url,
                              certificate_status: 'pending'
                          });
                      }
                  } catch (uploadErr) {
                      console.error("Sertifika yüklenirken hata", uploadErr);
                  }
              }
              router.push("/dashboard/pro");
          } else {
              setError(result.message || "Kayıt işlemi başarısız.");
          }
      } catch (err) {
          console.error("Kayıt Hatası:", err);
          setError("Sunucuya bağlanılamadı.");
      } finally {
          setLoading(false);
      }
  };

  const selectProfession = (id: string, label:  string) => {
      setFormData({ ...formData, profession: id, profession_label: label });
  };

  const handleNextStep = (targetStep: number) => {
      setError("");
      
      if (targetStep === 2) {
          if (!formData.profession) {
              setError("Lütfen bir uzmanlık alanı seçin.");
              return;
          }
      }
      
      if (targetStep === 3) {
          // Ülke TR ise şehir ve ilçe zorunlu, değilse sadece şehir
          if (formData.country === "TR") {
              if (!formData.name || !formData.email || !formData. phone || !formData.username || !formData.password || !formData.city || !formData.district) {
                  setError("Lütfen 2.  adımdaki tüm zorunlu alanları doldurun.");
                  return;
              }
          } else {
              if (!formData.name || !formData. email || !formData.phone || !formData. username || !formData.password) {
                  setError("Lütfen 2. adımdaki tüm zorunlu alanları doldurun.");
                  return;
              }
          }
      }
      
      setStep(targetStep);
  };

  return (
    <div className="min-h-screen flex font-sans text-rejimde-text bg-[#f8fafc]">

        {/* Left Side:  Image / Value Prop */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes. png)'}}></div>
            
            <div className="relative z-10">
                <Link href="/" className="flex items-center gap-2 mb-8 group w-fit">
                    <i className="fa-solid fa-leaf text-rejimde-green text-3xl group-hover:rotate-12 transition"></i>
                    <span className="text-3xl font-extrabold tracking-tight">rejimde <span className="text-rejimde-blue bg-blue-900/50 px-2 py-0.5 rounded text-xs ml-1 uppercase border border-blue-800">Pro</span></span>
                </Link>
                <h1 className="text-5xl font-black leading-tight mb-6">
                    Uzmanlığınızı <br />
                    <span className="text-rejimde-blue">Binlere</span> Ulaştırın. 
                </h1>
                <ul className="space-y-4 text-lg font-bold text-slate-300">
                    <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><i className="fa-solid fa-check text-rejimde-green"></i></div> Kendi danışan kitlenizi oluşturun</li>
                    <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><i className="fa-solid fa-check text-rejimde-green"></i></div> İçerik üretin, plan paylaşın</li>
                    <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><i className="fa-solid fa-check text-rejimde-green"></i></div> Danışanlarınızla etkileşime geçin</li>
                </ul>
            </div>
            
            <div className="relative z-10 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-2xl">👩‍⚕️</div>
                    <div>
                        <p className="text-sm italic text-slate-300">&quot;Danışan takibi hiç bu kadar kolay olmamıştı.&quot;</p>
                        <p className="text-xs font-bold text-rejimde-blue mt-1 uppercase tracking-wide">Dyt.  Selin Yılmaz</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 lg:p-12 relative overflow-y-auto">
            
            <div className="max-w-xl mx-auto w-full py-8">
                
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 text-xs font-black uppercase text-gray-400">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-rejimde-blue' :  ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-rejimde-blue text-white' : 'bg-gray-200'}`}>1</span>
                        <span className="hidden sm:inline">Uzmanlık</span>
                    </div>
                    <div className={`h-1 flex-1 mx-2 rounded-full ${step >= 2 ? 'bg-rejimde-blue' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-rejimde-blue' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-rejimde-blue text-white' : 'bg-gray-200'}`}>2</span>
                        <span className="hidden sm:inline">Hesap</span>
                    </div>
                    <div className={`h-1 flex-1 mx-2 rounded-full ${step >= 3 ? 'bg-rejimde-blue' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-rejimde-blue' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ?  'bg-rejimde-blue text-white' : 'bg-gray-200'}`}>3</span>
                        <span className="hidden sm:inline">Detaylar</span>
                    </div>
                </div>

                {error && <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border-l-4 border-red-500 animate-pulse">{error}</div>}

                {/* STEP 1: PROFESSION SELECTION */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Uzmanlık Alanınız? </h2>
                        <p className="text-gray-500 font-bold mb-6 text-sm">Sizi doğru danışanlarla eşleştirmemiz için kritik. </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button 
                                onClick={() => selectProfession('dietitian', 'Diyetisyen')}
                                className={`border-2 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-rejimde-blue transition h-32 ${formData.profession === 'dietitian' ? 'border-rejimde-blue bg-blue-50' : 'border-gray-200 bg-white'}`}
                            >
                                <i className="fa-solid fa-carrot text-4xl text-orange-500 mb-3"></i>
                                <span className="font-extrabold text-gray-700">Diyetisyen</span>
                            </button>

                            <button 
                                onClick={() => selectProfession('pt', 'PT / Koç')}
                                className={`border-2 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-rejimde-blue transition h-32 ${formData.profession === 'pt' ? 'border-rejimde-blue bg-blue-50' :  'border-gray-200 bg-white'}`}
                            >
                                <i className="fa-solid fa-dumbbell text-4xl text-blue-500 mb-3"></i>
                                <span className="font-extrabold text-gray-700">PT / Koç</span>
                            </button>

                            <button 
                                onClick={() => selectProfession('yoga', 'Yoga / Pilates')}
                                className={`border-2 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-rejimde-blue transition h-32 ${formData.profession === 'yoga' ? 'border-rejimde-blue bg-blue-50' : 'border-gray-200 bg-white'}`}
                            >
                                <i className="fa-solid fa-spa text-4xl text-green-500 mb-3"></i>
                                <span className="font-extrabold text-gray-700">Yoga / Pilates</span>
                            </button>

                            <button 
                                onClick={() => setShowOtherOptions(! showOtherOptions)}
                                className={`border-2 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-rejimde-purple transition h-32 ${showOtherOptions ? 'border-rejimde-purple bg-purple-50' : 'border-gray-200 bg-white'}`}
                            >
                                <i className="fa-solid fa-layer-group text-4xl text-purple-500 mb-3"></i>
                                <span className="font-extrabold text-gray-700">Diğer... </span>
                            </button>
                        </div>

                        {showOtherOptions && (
                            <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 mb-8 shadow-sm animate-fadeIn">
                                <h3 className="font-bold text-gray-400 text-xs uppercase mb-4">Detaylı Branş Seçimi</h3>
                                <div className="space-y-6">
                                    {PROFESSION_CATEGORIES.map((cat, idx) => (
                                        <div key={idx}>
                                            <h4 className="font-extrabold text-rejimde-blue text-sm mb-2">{cat.title}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.items.map((item) => (
                                                    <button
                                                        key={item. id}
                                                        onClick={() => selectProfession(item.id, item.label)}
                                                        className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition ${formData.profession === item.id ? 'bg-rejimde-text text-white border-rejimde-text' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => handleNextStep(2)} 
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-extrabold text-lg shadow-btn shadow-black btn-game uppercase tracking-wide hover: bg-slate-800 transition"
                        >
                            Devam Et
                        </button>
                    </div>
                )}

                {/* STEP 2: ACCOUNT & LOCATION */}
                {step === 2 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Hesap Bilgileri</h2>
                        <p className="text-gray-500 font-bold mb-8 text-sm">Giriş yapmak ve profilinizde görünmek için. </p>

                        <div className="space-y-4 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Ad Soyad <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-slate-800"
                                        value={formData.name} onChange={(e) => setFormData({... formData, name:  e.target.value})} placeholder="Örn:  Ali Veli" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Ünvan (Ops)</label>
                                    <input type="text" className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-slate-800"
                                        value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Örn: Uzm.  Dyt." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Kurum / Marka (Ops)</label>
                                <input type="text" className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-slate-800"
                                    value={formData.brand_name} onChange={(e) => setFormData({...formData, brand_name: e. target.value})} placeholder="Rejimde Klinik" />
                            </div>

                            {/* ÜLKE SEÇİMİ */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Ülke <span className="text-red-500">*</span></label>
                                <select 
                                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 font-bold outline-none text-slate-800 cursor-pointer"
                                    value={formData.country} 
                                    onChange={(e) => setFormData({...formData, country: e.target.value, city: '', district: ''})}
                                >
                                    {COUNTRY_OPTIONS. map(country => (
                                        <option key={country.id} value={country. id}>{country.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* LOKASYON - Ülkeye göre değişen */}
                            {formData.country === "TR" ?  (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-1">Şehir <span className="text-red-500">*</span></label>
                                        <select 
                                            className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 font-bold outline-none text-slate-800 cursor-pointer"
                                            value={formData.city} 
                                            onChange={(e) => setFormData({...formData, city: e.target. value, district: ''})}
                                        >
                                            <option value="">Seçiniz</option>
                                            {CITIES.map(city => (
                                                <option key={city.id} value={city. id}>{city. name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-1">İlçe <span className="text-red-500">*</span></label>
                                        <select 
                                            className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 font-bold outline-none text-slate-800 cursor-pointer disabled:bg-gray-100"
                                            value={formData. district} 
                                            onChange={(e) => setFormData({...formData, district: e.target.value})}
                                            disabled={! formData.city}
                                        >
                                            <option value="">Seçiniz</option>
                                            {selectedCity?. districts. map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Şehir / Bölge</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-slate-800"
                                        value={formData. city} 
                                        onChange={(e) => setFormData({...formData, city: e.target.value})} 
                                        placeholder="Şehir veya bölge adını yazın" 
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">E-posta <span className="text-red-500">*</span></label>
                                    <input type="email" className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-slate-800"
                                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Telefon <span className="text-red-500">*</span></label>
                                    <input type="tel" className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-slate-800"
                                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="05..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md: grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Kullanıcı Adı <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-slate-800"
                                        value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="kucuk_harf" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Şifre <span className="text-red-500">*</span></label>
                                    <input type="password" className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-slate-800"
                                        value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="w-1/3 bg-white border-2 border-gray-200 text-gray-500 py-4 rounded-xl font-bold btn-game hover:bg-gray-50">Geri</button>
                            <button onClick={() => handleNextStep(3)} className="w-2/3 bg-slate-900 text-white py-4 rounded-xl font-extrabold text-lg shadow-btn shadow-black btn-game uppercase tracking-wide">
                                Sonraki Adım
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: DETAILS - Güncellenmiş */}
                {step === 3 && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center gap-2 mb-2">
                             <h2 className="text-3xl font-black text-slate-800">Detaylar</h2>
                             <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-[10px] font-bold uppercase">Opsiyonel</span>
                        </div>
                        <p className="text-gray-500 font-bold mb-6 text-sm">Bu alanları daha sonra panelden de doldurabilirsiniz.</p>

                        <div className="space-y-6 mb-8 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                            
                            {/* UZMANLIK ALANLARI TAGLERİ */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-3">Uzmanlık Alanları</label>
                                <div className="flex flex-wrap gap-2">
                                    {EXPERTISE_TAGS.slice(0, 15).map(tag => (
                                        <button
                                            key={tag. id}
                                            type="button"
                                            onClick={() => toggleTag('expertise_tags', tag.id)}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition ${
                                                formData.expertise_tags.includes(tag. id)
                                                    ? 'bg-rejimde-purple text-white border-rejimde-purple'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-bold">Daha fazla uzmanlık alanını panelden ekleyebilirsiniz.</p>
                            </div>

                            {/* ÇALIŞTIĞI HEDEFLER TAGLERİ */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-3">Çalıştığı Hedefler</label>
                                <div className="flex flex-wrap gap-2">
                                    {GOAL_TAGS.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag('goal_tags', tag.id)}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition flex items-center gap-2 ${
                                                formData. goal_tags.includes(tag.id)
                                                    ? 'bg-rejimde-blue text-white border-rejimde-blue'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <i className={`fa-solid ${tag.icon}`}></i>
                                            {tag. label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* DANIŞAN METODU */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-3">Danışan Metodu</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {CONSULTATION_METHOD_OPTIONS.map(option => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => toggleTag('communication_preference', option.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition text-center ${
                                                formData.communication_preference. includes(option.id)
                                                    ? 'bg-rejimde-teal/10 border-rejimde-teal'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <i className={`fa-solid ${option.icon} text-xl mb-2 ${formData.communication_preference.includes(option. id) ? 'text-rejimde-teal' : 'text-gray-400'}`}></i>
                                            <div className={`text-xs font-bold ${formData.communication_preference. includes(option.id) ? 'text-rejimde-teal' : 'text-gray-600'}`}>{option.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ÇALIŞMA SAATLERİ */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Hafta İçi Saatleri</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-sm text-slate-700"
                                        placeholder="Örn: 09:00 - 18:00"
                                        value={formData. working_hours. weekday} 
                                        onChange={(e) => setFormData({... formData, working_hours: {... formData.working_hours, weekday:  e.target.value}})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Hafta Sonu Saatleri</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-sm text-slate-700"
                                        placeholder="Örn:  10:00 - 14:00"
                                        value={formData.working_hours.weekend} 
                                        onChange={(e) => setFormData({...formData, working_hours: {...formData.working_hours, weekend: e. target.value}})} 
                                    />
                                </div>
                            </div>

                            {/* YANITLAMA SÜRESİ */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Ortalama Yanıt Süresi</label>
                                <select 
                                    className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold outline-none transition text-sm text-slate-700 cursor-pointer"
                                    value={formData.response_time}
                                    onChange={(e) => setFormData({...formData, response_time: e.target. value})}
                                >
                                    <option value="1h">1 Saat İçinde</option>
                                    <option value="24h">24 Saat İçinde</option>
                                    <option value="48h">48 Saat İçinde</option>
                                    <option value="3d">3 Gün İçinde</option>
                                </select>
                            </div>

                            {/* AÇIK ADRES */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Açık Adres (Yüz Yüze İçin)</label>
                                <textarea 
                                    className="w-full bg-white border-2 border-gray-200 focus: border-rejimde-blue rounded-xl p-3 font-bold text-sm outline-none transition h-20 resize-none text-slate-700"
                                    value={formData.address} 
                                    onChange={(e) => setFormData({...formData, address: e.target. value})}
                                    placeholder="Tam adresinizi yazın..."
                                ></textarea>
                            </div>

                            {/* SERTİFİKA YÜKLEME ALANI */}
                            <div 
                                onClick={() => fileInputRef.current?. click()}
                                className={`border-2 border-dashed rounded-2xl p-6 cursor-pointer transition group text-center ${certificateFile ? 'border-rejimde-green bg-green-50' : 'border-gray-300 hover:border-rejimde-blue hover:bg-blue-50'}`}
                            >
                                {certificateFile ? (
                                    <>
                                        <i className="fa-solid fa-file-circle-check text-2xl text-rejimde-green mb-2"></i>
                                        <p className="text-xs font-bold text-gray-700">{certificateFile. name}</p>
                                        <p className="text-[10px] text-rejimde-green mt-1">Dosya seçildi</p>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-certificate text-2xl text-gray-300 mb-2 group-hover:text-rejimde-blue transition"></i>
                                        <p className="text-xs font-bold text-gray-500">Sertifika / Diploma Yükle</p>
                                        <p className="text-[10px] text-gray-400 mt-1 font-bold">PDF, JPG, PNG (Max 5MB)</p>
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                            </div>

                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-200">
                             <button onClick={() => setStep(2)} className="w-1/3 bg-white border-2 border-gray-200 text-gray-500 py-4 rounded-xl font-bold btn-game hover:bg-gray-50">Geri</button>
                             <button onClick={handleRegister} disabled={loading} className="w-2/3 bg-rejimde-green text-white py-4 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase disabled:opacity-50">
                                {loading ? 'Oluşturuluyor...' : 'Kaydı Tamamla'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
}