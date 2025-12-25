'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/LayoutWrapper';
import { auth } from '@/lib/api';
import { createdCircle } from '@/lib/events';
import { usePoints } from '@/hooks/usePoints';
import PointsToast from '@/components/PointsToast';

// Hazır Circle Avatarları - Genişletilmiş Kütüphane
const CIRCLE_AVATARS = [
  // Personas
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle2&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle4&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle5&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle6&backgroundColor=c0aede',
  // Bottts
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle7&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle8&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle9&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle10&backgroundColor=ffd5dc',
  // Fun Emoji
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Circle11&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Circle12&backgroundColor=c0aede',
  // Thumbs
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Circle13&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Circle14&backgroundColor=ffdfbf',
  // Icons
  'https://api.dicebear.com/9.x/icons/svg?seed=Circle15&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/icons/svg?seed=Circle16&backgroundColor=ffd5dc',
];

export default function CreateCirclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { lastEarned, lastMessage, showToast, handleEventResponse, hideToast } = usePoints();
  const [formData, setFormData] = useState<{
    name: string;
    motto: string;
    description: string;
    privacy: 'public' | 'invite_only';
    chat_status: 'open' | 'closed';
    logo: string;
  }>({
    name: '',
    motto: '',
    description: '',
    privacy: 'public',
    chat_status: 'open',
    logo: CIRCLE_AVATARS[0] // Varsayılan avatar
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API'ye gönder (logo verisiyle birlikte)
      const res = await auth.createCircle(formData);
      
      // Send gamification v2 event if we have circle ID
      if (res && typeof res === 'object' && 'id' in res) {
        const eventResponse = await createdCircle(res.id as number);
        handleEventResponse(eventResponse);
      }
      
      alert('Circle başarıyla kuruldu! Circle Mentor sensin.');
      router.push('/circles'); 
    } catch (error: any) {
      console.error(error);
      alert('Hata: ' + (error.message || 'Circle kurulamadı.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      {showToast && <PointsToast points={lastEarned} message={lastMessage} onClose={hideToast} />}
      <div className="min-h-screen pb-20 font-sans text-gray-800 flex flex-col items-center bg-gray-50/50">
        
        {/* Header */}
        <div className="w-full max-w-4xl mx-auto px-4 py-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-3xl mb-6 text-purple-600 shadow-[0_8px_0_rgb(147,51,234)] border-4 border-white transform hover:scale-105 transition duration-300">
                <i className="fa-solid fa-crown text-4xl"></i>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-3 tracking-tight">Circle'ını Oluştur</h1>
            <p className="text-gray-500 font-bold text-lg max-w-2xl mx-auto">
                Kendi topluluğunu kur, Circle Mentor ol ve hedefine birlikte ilerle.
            </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-2xl mx-auto px-4 mb-12">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-[0_8px_0_rgba(229,231,235,0.7)] relative overflow-hidden">
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    
                    {/* Avatar Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <i className="fa-solid fa-image text-purple-600"></i> Circle Logosu Seç
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                            {CIRCLE_AVATARS.map((url, index) => (
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

                    {/* Circle Name */}
                    <div className="space-y-3">
                        <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <i className="fa-solid fa-shield-halved text-purple-600"></i> Circle Adı
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

                    {/* Circle Motto */}
                    <div className="space-y-3">
                        <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <i className="fa-solid fa-quote-left text-purple-600"></i> Circle Mottosu
                        </label>
                        <input 
                            type="text" 
                            placeholder="Örn: Birlikte Güçlüyüz"
                            value={formData.motto}
                            onChange={(e) => setFormData({...formData, motto: e.target.value})}
                            className="w-full bg-gray-100 border-2 border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl py-4 px-5 font-bold text-gray-800 text-lg outline-none transition placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400 font-bold px-2">Circle'ınızı temsil eden bir slogan (opsiyonel).</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <i className="fa-solid fa-pen-nib text-purple-600"></i> Açıklama
                        </label>
                        <textarea 
                            rows={3}
                            placeholder="Circle'ın amacı ne? Kimler katılabilir?"
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
                                    <p className="text-xs font-bold text-gray-400">Yalnızca Mentor onayıyla.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Status */}
                    <div className="space-y-3">
                        <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide block">Sohbet Durumu</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Option 1: Open */}
                            <div 
                                onClick={() => setFormData({...formData, chat_status: 'open'})}
                                className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${
                                    formData.chat_status === 'open' 
                                    ? 'border-blue-500 bg-blue-50 shadow-[0_4px_0_rgb(59,130,246)] translate-y-[-2px]' 
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition ${
                                    formData.chat_status === 'open' ? 'text-blue-600' : 'text-gray-400'
                                }`}>
                                    <i className="fa-solid fa-comments"></i>
                                </div>
                                <div>
                                    <h4 className={`font-extrabold ${formData.chat_status === 'open' ? 'text-blue-700' : 'text-gray-700'}`}>Chat Açık</h4>
                                    <p className="text-xs font-bold text-gray-400">Üyeler mesajlaşabilir.</p>
                                </div>
                            </div>

                            {/* Option 2: Closed */}
                            <div 
                                onClick={() => setFormData({...formData, chat_status: 'closed'})}
                                className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${
                                    formData.chat_status === 'closed' 
                                    ? 'border-gray-500 bg-gray-50 shadow-[0_4px_0_rgb(107,114,128)] translate-y-[-2px]' 
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition ${
                                    formData.chat_status === 'closed' ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                    <i className="fa-solid fa-comment-slash"></i>
                                </div>
                                <div>
                                    <h4 className={`font-extrabold ${formData.chat_status === 'closed' ? 'text-gray-700' : 'text-gray-700'}`}>Chat Kapalı</h4>
                                    <p className="text-xs font-bold text-gray-400">Sohbet devre dışı.</p>
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
                                    <i className="fa-solid fa-check"></i> Circle'ı Oluştur
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