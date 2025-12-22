'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/LayoutWrapper';
import { auth } from '@/lib/api';

// Hazır Klan Avatarları (Duolingo / Oyun Tarzı)
const CLAN_AVATARS = [
  'https://api.dicebear.com/9.x/personas/svg?seed=Clan1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/personas/svg?seed=Clan2&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/personas/svg?seed=Clan3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/personas/svg?seed=Clan4&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/personas/svg?seed=Clan5&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/personas/svg?seed=Clan6&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Clan7&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Clan8&backgroundColor=ffdfbf',
];

export default function CreateClanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public',
    logo: CLAN_AVATARS[0] // Varsayılan avatar
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API'ye gönder (logo verisiyle birlikte)
      const res = await auth.createClan(formData);
      alert('Klan başarıyla kuruldu! Lider sensin.');
      router.push('/clans'); 
    } catch (error: any) {
      console.error(error);
      alert('Hata: ' + (error.message || 'Klan kurulamadı.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="min-h-screen pb-20 font-sans text-gray-800 flex flex-col items-center bg-gray-50/50">
        
        {/* Header */}
        <div className="w-full max-w-4xl mx-auto px-4 py-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-3xl mb-6 text-purple-600 shadow-[0_8px_0_rgb(147,51,234)] border-4 border-white transform hover:scale-105 transition duration-300">
                <i className="fa-solid fa-crown text-4xl"></i>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-3 tracking-tight">Klanını Oluştur</h1>
            <p className="text-gray-500 font-bold text-lg max-w-2xl mx-auto">
                Kendi topluluğunu kur, liderlik et ve liglerde zirveye oyna.
            </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-2xl mx-auto px-4 mb-12">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-[0_8px_0_rgba(229,231,235,0.7)] relative overflow-hidden">
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    
                    {/* Avatar Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <i className="fa-solid fa-image text-purple-600"></i> Klan Logosu Seç
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                            {CLAN_AVATARS.map((url, index) => (
                                <div 
                                    key={index}
                                    onClick={() => setFormData({...formData, logo: url})}
                                    className={`aspect-square rounded-2xl cursor-pointer border-4 transition-all duration-200 overflow-hidden relative ${
                                        formData.logo === url 
                                        ? 'border-purple-500 shadow-[0_4px_0_rgb(168,85,247)] translate-y-[-4px]' 
                                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <img src={url} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                                    {formData.logo === url && (
                                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                            <i className="fa-solid fa-check text-white text-xl drop-shadow-md"></i>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clan Name */}
                    <div className="space-y-3">
                        <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <i className="fa-solid fa-shield-halved text-purple-600"></i> Klan Adı
                        </label>
                        <input 
                            type="text" 
                            required
                            placeholder="Örn: Fit Savaşçılar"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-100 border-2 border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl py-4 px-5 font-bold text-gray-800 text-lg outline-none transition placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400 font-bold px-2">Akılda kalıcı, havalı bir isim seç.</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <i className="fa-solid fa-pen-nib text-purple-600"></i> Motto / Açıklama
                        </label>
                        <textarea 
                            rows={3}
                            placeholder="Klanın amacı ne? Kimler katılabilir?"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-gray-100 border-2 border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl py-4 px-5 font-bold text-gray-800 outline-none transition placeholder:text-gray-400 resize-none"
                        />
                    </div>

                    {/* Privacy */}
                    <div className="space-y-3">
                        <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide block">Gizlilik Ayarı</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Option 1: Public */}
                            <div 
                                onClick={() => setFormData({...formData, privacy: 'public'})}
                                className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${
                                    formData.privacy === 'public' 
                                    ? 'border-green-500 bg-green-50 shadow-[0_4px_0_rgb(34,197,94)] translate-y-[-2px]' 
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition ${
                                    formData.privacy === 'public' ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                    <i className="fa-solid fa-earth-americas"></i>
                                </div>
                                <div>
                                    <h4 className={`font-extrabold ${formData.privacy === 'public' ? 'text-green-700' : 'text-gray-700'}`}>Herkese Açık</h4>
                                    <p className="text-xs font-bold text-gray-400">Herkes bulup katılabilir.</p>
                                </div>
                            </div>

                            {/* Option 2: Invite Only */}
                            <div 
                                onClick={() => setFormData({...formData, privacy: 'invite_only'})}
                                className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${
                                    formData.privacy === 'invite_only' 
                                    ? 'border-amber-500 bg-amber-50 shadow-[0_4px_0_rgb(245,158,11)] translate-y-[-2px]' 
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition ${
                                    formData.privacy === 'invite_only' ? 'text-amber-600' : 'text-gray-400'
                                }`}>
                                    <i className="fa-solid fa-lock"></i>
                                </div>
                                <div>
                                    <h4 className={`font-extrabold ${formData.privacy === 'invite_only' ? 'text-amber-700' : 'text-gray-700'}`}>Sadece Davetle</h4>
                                    <p className="text-xs font-bold text-gray-400">Yalnızca lider onayıyla.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-extrabold uppercase text-lg shadow-[0_6px_0_rgb(126,34,206)] hover:bg-purple-700 hover:shadow-[0_4px_0_rgb(126,34,206)] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i> Klanı Oluştur
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>

      </div>
    </LayoutWrapper>
  );
}