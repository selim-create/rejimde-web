"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getMe, updateUser, changePassword, uploadAvatar, uploadCertificate } from "@/lib/api";
import { CITIES } from "@/lib/locations";

export default function ProSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "", // Unvan (Dyt, Koç vb.)
    brand_name: "", // Kurum Adı
    bio: "",
    branches: "",
    services: "",
    client_types: "",
    consultation_types: "online",
    city: "",
    district: "",
    address: "",
    phone: "",
    avatar_url: "https://i.pravatar.cc/150?img=44", // Varsayılan Pro Avatar
    certificate_url: "",
    certificate_status: "" // pending, approved, rejected
  });

  const [passwordData, setPasswordData] = useState({
      current: "",
      new: "",
      confirm: ""
  });

  // Seçilen şehre göre ilçeleri getir
  const selectedCity = CITIES.find(c => c.id === formData.city);

  useEffect(() => {
    async function loadData() {
      const user = await getMe();
      if (user) {
        setFormData({
            name: user.name || "",
            email: user.email || "",
            title: (user as any).title || "",
            brand_name: (user as any).brand_name || "",
            bio: (user as any).bio || "", 
            branches: (user as any).branches || "",
            services: (user as any).services || "",
            client_types: (user as any).client_types || "",
            consultation_types: (user as any).consultation_types || "online",
            city: (user as any).city || "",
            district: (user as any).district || "",
            address: (user as any).address || "",
            phone: (user as any).phone || "",
            avatar_url: user.avatar_url || user.avatar_urls?.['96'] || "https://i.pravatar.cc/150?img=44",
            certificate_url: (user as any).certificate_url || "",
            certificate_status: (user as any).certificate_status || "none"
        });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Avatar Yükleme
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          
          if (file.size > 2 * 1024 * 1024) {
              setMessage({ type: 'error', text: 'Dosya boyutu 2MB\'dan küçük olmalıdır.' });
              return;
          }

          setSaving(true);

          // Önizleme
          const reader = new FileReader();
          reader.onload = (ev) => {
              setFormData(prev => ({ ...prev, avatar_url: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);

          try {
              const uploadRes = await uploadAvatar(file);
              
              if(uploadRes.success && uploadRes.url) {
                  const updatedFormData = { ...formData, avatar_url: uploadRes.url };
                  setFormData(updatedFormData);
                  const updateRes = await updateUser(updatedFormData);

                  if (updateRes.success) {
                      setMessage({ type: 'success', text: 'Profil fotoğrafı güncellendi.' });
                      if (typeof window !== 'undefined') {
                          localStorage.setItem('user_avatar', uploadRes.url);
                          window.dispatchEvent(new Event('storage'));
                      }
                  } else {
                      setMessage({ type: 'error', text: 'Fotoğraf yüklendi fakat profile atanamadı.' });
                  }
              } else {
                  setMessage({ type: 'error', text: uploadRes.message || 'Dosya yüklenemedi.' });
              }
          } catch (err) {
              setMessage({ type: 'error', text: 'Bir hata oluştu.' });
          } finally {
              setSaving(false);
              if(fileInputRef.current) fileInputRef.current.value = "";
          }
      }
  };

  // Sertifika Yükleme
  const handleCertificateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 5 * 1024 * 1024) {
              setMessage({ type: 'error', text: 'Dosya boyutu 5MB\'dan küçük olmalıdır.' });
              return;
          }
          setSaving(true);
          try {
              const uploadRes = await uploadCertificate(file);
              if(uploadRes.success && uploadRes.url) {
                   const updatedFormData = { 
                       ...formData, 
                       certificate_url: uploadRes.url,
                       certificate_status: 'pending' 
                   };
                   setFormData(updatedFormData);
                   // URL'i kullanıcı profiline işle (uploadCertificate içinde yapılıyor olabilir ama garantiye alalım)
                   await updateUser({
                      certificate_url: uploadRes.url,
                      certificate_status: 'pending'
                   });
                   setMessage({ type: 'success', text: 'Sertifika yüklendi ve onaya gönderildi.' });
              } else {
                   setMessage({ type: 'error', text: uploadRes.message || 'Yükleme başarısız.' });
              }
          } catch (err) {
              setMessage({ type: 'error', text: 'Hata oluştu.' });
          } finally {
              setSaving(false);
              if(certInputRef.current) certInputRef.current.value = "";
          }
      }
  };

  const handleSave = async () => {
    setSaving(true);
    // Backend location string bekliyorsa birleştirip gönderelim (veya ayrı ayrı)
    // Şimdilik ayrı gönderiyoruz, backend UserMeta.php'de tanımlı.
    const result = await updateUser(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Uzman profiliniz güncellendi.' });
      if (typeof window !== 'undefined') {
          localStorage.setItem('user_name', formData.name);
          window.dispatchEvent(new Event('storage'));
      }
    } else {
      setMessage({ type: 'error', text: 'Hata oluştu.' });
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
      if (passwordData.new !== passwordData.confirm) {
          setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
          return;
      }
      setSaving(true);
      const res = await changePassword(passwordData.current, passwordData.new);
      if (res.success) {
          setMessage({ type: 'success', text: 'Şifreniz değiştirildi.' });
          setPasswordData({ current: "", new: "", confirm: "" });
      } else {
          setMessage({ type: 'error', text: res.message || 'Şifre değiştirilemedi.' });
      }
      setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Pro Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center gap-4">
         <Link href="/dashboard/pro" className="text-slate-400 hover:text-white transition"><i className="fa-solid fa-arrow-left"></i> Panele Dön</Link>
         <h1 className="font-extrabold text-white text-xl">Uzman Profil Ayarları</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {message && (
            <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                {message.text}
            </div>
        )}

        {/* 1. KİMLİK & AVATAR */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-id-card text-rejimde-blue"></i> Kimlik & İletişim
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-6">
                {/* Avatar Change */}
                <div 
                    className="relative group cursor-pointer w-24 h-24 shrink-0" 
                    onClick={() => fileInputRef.current?.click()}
                >
                    <img 
                        src={formData.avatar_url} 
                        className="w-full h-full rounded-2xl border-4 border-slate-600 object-cover group-hover:border-rejimde-blue transition shadow-sm" 
                        alt="Avatar" 
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                         {saving ? <i className="fa-solid fa-circle-notch animate-spin text-white text-xl"></i> : <i className="fa-solid fa-camera text-white text-xl"></i>}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>

                <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ad Soyad / Marka</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">E-posta</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Telefon</label>
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Unvan (Örn: Uzman Diyetisyen)</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kurum / Klinik Adı</label>
                        <input type="text" value={formData.brand_name} onChange={(e) => setFormData({...formData, brand_name: e.target.value})} 
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue" placeholder="Varsa kurum adınız" />
                    </div>
                </div>
            </div>
        </div>

        {/* 2. LOKASYON BİLGİLERİ */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-rejimde-green"></i> Lokasyon & Adres
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Şehir</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-green cursor-pointer"
                        value={formData.city} 
                        onChange={(e) => setFormData({...formData, city: e.target.value, district: ''})}
                    >
                        <option value="">Seçiniz</option>
                        {CITIES.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">İlçe</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-green cursor-pointer disabled:opacity-50"
                        value={formData.district} 
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                        disabled={!formData.city}
                    >
                        <option value="">Seçiniz</option>
                        {selectedCity?.districts.map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>
                </div>
            </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Açık Adres (Yüz Yüze İçin)</label>
                <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green h-20 resize-none"></textarea>
            </div>
        </div>

        {/* 3. MESLEKİ DETAYLAR */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-briefcase text-rejimde-purple"></i> Mesleki Detaylar
            </h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Özgeçmiş / Biyografi</label>
                    <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-purple h-32 resize-none"></textarea>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Uzmanlık Alanları (Branşlar)</label>
                    <input type="text" value={formData.branches} onChange={(e) => setFormData({...formData, branches: e.target.value})} 
                        placeholder="Virgülle ayırın: Keto, Sporcu Beslenmesi..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-purple" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hizmetler</label>
                        <input type="text" value={formData.services} onChange={(e) => setFormData({...formData, services: e.target.value})} 
                            placeholder="Online Takip, Detoks..."
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-purple" />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Danışan Türü</label>
                        <input type="text" value={formData.client_types} onChange={(e) => setFormData({...formData, client_types: e.target.value})} 
                            placeholder="Kadın, Çocuk, Sporcu..."
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-purple" />
                    </div>
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Konsültasyon Tipi</label>
                     <select 
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-purple cursor-pointer"
                        value={formData.consultation_types} onChange={(e) => setFormData({...formData, consultation_types: e.target.value})}
                    >
                        <option value="online">Sadece Online</option>
                        <option value="face">Sadece Yüz Yüze</option>
                        <option value="hybrid">Hibrit (İkisi de)</option>
                    </select>
                </div>
            </div>
        </div>

        {/* 4. BELGELER & SERTİFİKA */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-file-contract text-rejimde-yellow"></i> Belgeler
            </h2>
            
            <div 
                onClick={() => certInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition group text-center ${formData.certificate_status === 'approved' ? 'border-green-500 bg-green-900/10' : 'border-slate-600 hover:bg-slate-700 hover:border-rejimde-yellow'}`}
            >
                {formData.certificate_status === 'approved' ? (
                    <>
                        <i className="fa-solid fa-circle-check text-3xl text-green-500 mb-3"></i>
                        <p className="text-sm font-bold text-green-400">Belgeleriniz Onaylandı</p>
                        <p className="text-xs text-slate-400 mt-1">Profilinizde "Onaylı Uzman" rozeti görünüyor.</p>
                    </>
                ) : formData.certificate_status === 'pending' ? (
                    <>
                        <i className="fa-solid fa-clock text-3xl text-yellow-500 mb-3"></i>
                        <p className="text-sm font-bold text-yellow-400">Onay Bekliyor</p>
                        <p className="text-xs text-slate-400 mt-1">Belgeniz inceleniyor. Yeni dosya yüklemek için tıklayın.</p>
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-3 group-hover:text-rejimde-yellow transition"></i>
                        <p className="text-sm font-bold text-slate-300">Sertifika / Diploma Yükle</p>
                        <p className="text-xs text-slate-500 mt-1 font-bold">PDF, JPG, PNG (Max 5MB)</p>
                    </>
                )}
                <input type="file" ref={certInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCertificateChange} />
            </div>
        </div>

        {/* KAYDET BUTONU */}
        <div className="flex justify-end sticky bottom-6 z-30 pointer-events-none">
             <button 
                onClick={handleSave}
                disabled={saving}
                className="pointer-events-auto bg-rejimde-green text-white px-8 py-3 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase disabled:opacity-50 flex items-center gap-2 transform hover:scale-105 transition"
            >
                {saving && <i className="fa-solid fa-circle-notch animate-spin"></i>}
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
        </div>

        {/* 5. GÜVENLİK */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 mt-8">
            <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-lock text-slate-400"></i> Şifre Değiştir
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="password" placeholder="Mevcut Şifre" value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-rejimde-blue" />
                <input type="password" placeholder="Yeni Şifre" value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-rejimde-blue" />
                <input type="password" placeholder="Şifre Tekrar" value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-rejimde-blue" />
            </div>
            <button onClick={handlePasswordChange} className="bg-slate-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-btn shadow-black btn-game">
                Şifreyi Güncelle
            </button>
        </div>

        {/* Danger Zone */}
        <div className="border-2 border-red-900/30 bg-red-900/10 rounded-3xl p-6 md:p-8 mt-8">
            <h2 className="text-lg font-extrabold text-red-500 mb-2">Tehlikeli Bölge</h2>
            <p className="text-xs font-bold text-red-400 mb-4">
                Hesabını sildiğinde tüm danışan verilerin, planların ve profilin kalıcı olarak silinir.
            </p>
            <button className="bg-transparent border-2 border-red-900/50 text-red-500 px-6 py-2 rounded-xl font-extrabold text-sm shadow-none uppercase hover:bg-red-900/20 transition">
                Hesabımı Sil
            </button>
        </div>

      </div>
    </div>
  );
}