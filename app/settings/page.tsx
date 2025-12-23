"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getMe, updateUser, changePassword, uploadAvatar, AVATAR_PACK } from "@/lib/api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "", // YENİ: Kullanıcı Adı Eklendi
    email: "",
    description: "",
    avatar_url: "https://i.pravatar.cc/150?img=5",
    birth_date: "",
    gender: "female",
    height: "",
    current_weight: "",
    target_weight: "",
    activity_level: "sedentary",
    location: "", // YENİ
    goals: {
        weight_loss: false,
        muscle_gain: false,
        healthy_living: false
    },
    notifications: {
        email: true,
        push: true
    }
  });

  const [passwordData, setPasswordData] = useState({
      current: "",
      new: "",
      confirm: ""
  });

  useEffect(() => {
    async function loadData() {
      const user = await getMe();
      if (user) {
        setFormData(prev => ({
            ...prev,
            name: user.name || "",
            username: user.username || "", // API'den gelen kullanıcı adı
            email: user.email || "",
            description: user.description || "",
            avatar_url: user.avatar_url || user.avatar_urls?.['96'] || prev.avatar_url,
            birth_date: user.birth_date || "",
            gender: user.gender || "female",
            height: user.height || "",
            current_weight: user.current_weight || "",
            target_weight: user.target_weight || "",
            activity_level: user.activity_level || "sedentary",
            location: user.location || "", // YENİ
            goals: { ...prev.goals, ...(user.goals || {}) },
            notifications: { ...prev.notifications, ...(user.notifications || {}) }
        }));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Avatar Seçimi
  const handleAvatarSelect = async (url: string) => {
      setFormData(prev => ({ ...prev, avatar_url: url }));
      setIsAvatarModalOpen(false);
      setSaving(true);
      const updatedData = { ...formData, avatar_url: url };
      const res = await updateUser(updatedData);
      if(res.success) {
          setMessage({ type: 'success', text: 'Yeni avatarın çok havalı! 😎' });
          localStorage.setItem('user_avatar', url);
          window.dispatchEvent(new Event('storage'));
      } else {
          setMessage({ type: 'error', text: 'Avatar değiştirilemedi.' });
      }
      setSaving(false);
  };

  // Dosya Yükleme
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 2 * 1024 * 1024) {
              setMessage({ type: 'error', text: 'Dosya boyutu 2MB\'dan küçük olmalıdır.' });
              return;
          }
          setIsAvatarModalOpen(false);
          setSaving(true);

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
                      setMessage({ type: 'success', text: 'Profil fotoğrafı yüklendi.' });
                      localStorage.setItem('user_avatar', uploadRes.url);
                      window.dispatchEvent(new Event('storage'));
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

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateUser(formData);
    if (result.success) {
      setMessage({ type: 'success', text: 'Profilin başarıyla güncellendi!' });
      localStorage.setItem('user_name', formData.name);
      window.dispatchEvent(new Event('storage'));
    } else {
      setMessage({ type: 'error', text: result.message || 'Bir hata oluştu.' });
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Yükleniyor...</div>;

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text bg-[#f7f7f7]">
      
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-4">
            <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-rejimde-green hover:text-white transition">
                <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <h1 className="text-2xl font-black text-gray-800">Ayarlar</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Mesaj */}
        {message && (
            <div className={`p-4 rounded-xl font-bold text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}`}></i>
                {message.text}
            </div>
        )}

        {/* 1. KİŞİSEL BİLGİLER */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-700 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-id-card text-rejimde-blue"></i> Profil Bilgileri
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
                
                {/* Avatar */}
                <div 
                    className="relative group cursor-pointer w-24 h-24 shrink-0" 
                    onClick={() => setIsAvatarModalOpen(true)}
                >
                    <img 
                        src={formData.avatar_url || "https://i.pravatar.cc/150?img=5"} 
                        className="w-full h-full rounded-2xl border-4 border-gray-100 object-cover group-hover:border-rejimde-blue transition shadow-sm" 
                        alt="Avatar" 
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                        {saving ? <i className="fa-solid fa-circle-notch animate-spin text-white text-xl"></i> : <i className="fa-solid fa-pen text-white text-xl"></i>}
                    </div>
                </div>
                
                <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* YENİ: KULLANICI ADI ALANI (READ-ONLY) */}
                         <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1">Kullanıcı Adı</label>
                            <input 
                                type="text" 
                                value={formData.username} 
                                readOnly
                                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl py-2 px-4 font-bold text-gray-500 outline-none cursor-not-allowed" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1">Görünen İsim</label>
                            <input 
                                type="text" 
                                value={formData.name || ""} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-2 px-4 font-bold text-gray-700 outline-none transition" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-1">E-posta</label>
                        <input 
                            type="email" 
                            value={formData.email || ""} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-gray-50 border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-2 px-4 font-bold text-gray-700 outline-none transition" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-1">Hakkımda (Motto)</label>
                        <input 
                            type="text" 
                            value={formData.description || ""} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Örn: O gelinlik o bele girecek! 💪"
                            className="w-full bg-gray-50 border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-2 px-4 font-bold text-gray-700 outline-none transition" 
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* 2. FİZİKSEL BİLGİLER */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-700 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-person-running text-rejimde-green"></i> Fiziksel Bilgiler
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                 <div className="col-span-1">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Cinsiyet</label>
                    <select 
                        value={formData.gender || "female"} 
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-gray-200 focus:border-rejimde-green rounded-xl py-2 px-3 font-bold text-gray-700 outline-none appearance-none"
                    >
                        <option value="female">Kadın</option>
                        <option value="male">Erkek</option>
                        <option value="other">Diğer</option>
                        <option value="prefer_not_to_say">Belirtmek İstemiyorum</option>
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Doğum Tarihi</label>
                    <input 
                        type="date" 
                        value={formData.birth_date || ""} 
                        onChange={(e) => setFormData({...formData, birth_date: e.target.value})} 
                        className="w-full bg-gray-50 border-2 border-gray-200 focus:border-rejimde-green rounded-xl py-2 px-4 font-bold text-gray-700 outline-none" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Boy (cm)</label>
                    <input type="number" value={formData.height || ""} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-200 focus:border-rejimde-green rounded-xl py-2 px-4 font-bold text-gray-700 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Aktiflik</label>
                    <select 
                        value={formData.activity_level || "sedentary"} 
                        onChange={(e) => setFormData({...formData, activity_level: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-gray-200 focus:border-rejimde-green rounded-xl py-2 px-3 font-bold text-gray-700 outline-none appearance-none"
                    >
                        <option value="sedentary">Hareketsiz</option>
                        <option value="light">Az Hareketli</option>
                        <option value="moderate">Orta Hareketli</option>
                        <option value="active">Çok Hareketli</option>
                    </select>
                </div>
                <div className="col-span-2 md:col-span-4">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Lokasyon</label>
                    <input 
                        type="text" 
                        value={formData.location || ""} 
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Örn: İstanbul, Türkiye"
                        className="w-full bg-gray-50 border-2 border-gray-200 focus:border-rejimde-green rounded-xl py-2 px-4 font-bold text-gray-700 outline-none transition" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-rejimde-green transition">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Güncel Kilo (kg)</label>
                    <input type="number" value={formData.current_weight || ""} onChange={(e) => setFormData({...formData, current_weight: e.target.value})} className="w-full bg-transparent font-black text-2xl text-gray-800 outline-none" placeholder="00.0" />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-rejimde-red transition">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Hedef Kilo (kg)</label>
                    <input type="number" value={formData.target_weight || ""} onChange={(e) => setFormData({...formData, target_weight: e.target.value})} className="w-full bg-transparent font-black text-2xl text-gray-800 outline-none" placeholder="00.0" />
                </div>
            </div>
        </div>

        {/* 3. HEDEFLER */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-700 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-bullseye text-rejimde-red"></i> Hedefler
            </h2>
            <div className="flex flex-wrap gap-4">
                <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition select-none hover:bg-gray-50 ${formData.goals?.weight_loss ? 'border-rejimde-blue bg-blue-50' : ''}`}>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={!!formData.goals?.weight_loss} 
                        onChange={(e) => setFormData({...formData, goals: {...formData.goals, weight_loss: e.target.checked}})} 
                    />
                    <i className="fa-solid fa-weight-scale text-rejimde-blue"></i>
                    <span className="font-bold text-sm text-gray-700">Kilo Vermek</span>
                </label>

                <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition select-none hover:bg-gray-50 ${formData.goals?.muscle_gain ? 'border-rejimde-green bg-green-50' : ''}`}>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={!!formData.goals?.muscle_gain} 
                        onChange={(e) => setFormData({...formData, goals: {...formData.goals, muscle_gain: e.target.checked}})} 
                    />
                    <i className="fa-solid fa-dumbbell text-rejimde-green"></i>
                    <span className="font-bold text-sm text-gray-700">Kas Yapmak</span>
                </label>

                <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition select-none hover:bg-gray-50 ${formData.goals?.healthy_living ? 'border-rejimde-purple bg-purple-50' : ''}`}>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={!!formData.goals?.healthy_living} 
                        onChange={(e) => setFormData({...formData, goals: {...formData.goals, healthy_living: e.target.checked}})} 
                    />
                    <i className="fa-solid fa-apple-whole text-rejimde-purple"></i>
                    <span className="font-bold text-sm text-gray-700">Sağlıklı Yaşam</span>
                </label>
            </div>
        </div>

        {/* 4. BİLDİRİMLER */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-700 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-bell text-rejimde-yellowDark"></i> Bildirimler
            </h2>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-gray-700 text-sm">E-posta Bildirimleri</h4>
                        <p className="text-xs font-bold text-gray-400">Kampanyalar ve haftalık özetler.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={!!formData.notifications?.email} 
                            onChange={(e) => setFormData({...formData, notifications: {...formData.notifications, email: e.target.checked}})} 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rejimde-green"></div>
                    </label>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-gray-700 text-sm">Push Bildirimleri</h4>
                        <p className="text-xs font-bold text-gray-400">Maskotun (FitBuddy) motivasyon mesajları.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={!!formData.notifications?.push} 
                            onChange={(e) => setFormData({...formData, notifications: {...formData.notifications, push: e.target.checked}})} 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rejimde-green"></div>
                    </label>
                </div>
            </div>
        </div>
                
        {/* KAYDET BUTONU */}
        <div className="sticky bottom-6 flex justify-end z-30 pointer-events-none">
             <button 
                onClick={handleSave}
                disabled={saving}
                className="pointer-events-auto bg-rejimde-blue text-white px-8 py-3 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-blueDark btn-game uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 transition"
            >
                {saving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-save"></i>}
                {saving ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
            </button>
        </div>

      </div>

      {/* AVATAR MODAL */}
      {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setIsAvatarModalOpen(false)}>
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-extrabold text-gray-800">Avatarını Seç</h3>
                      <button onClick={() => setIsAvatarModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <i className="fa-solid fa-xmark text-2xl"></i>
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-8">
                      {AVATAR_PACK.map((avatar) => (
                          <button 
                              key={avatar.id}
                              onClick={() => handleAvatarSelect(avatar.url)}
                              className="aspect-square rounded-2xl border-2 border-gray-100 hover:border-rejimde-green hover:scale-110 transition overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm"
                          >
                              <img src={avatar.url} className="w-full h-full object-cover" alt="Avatar" />
                          </button>
                      ))}
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase">veya</span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-gray-100 text-gray-600 py-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-3 shadow-sm"
                  >
                      <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
                      Kendi Fotoğrafını Yükle
                  </button>
                  
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                  />
              </div>
          </div>
      )}

    </div>
  );
}