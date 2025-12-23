'use client';

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth } from "@/lib/api"; 

// Lig Tanımları
const LEAGUES: Record<string, any> = {
  bronze: { name: 'Bronz Lig', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-500', icon: 'fa-medal' },
  silver: { name: 'Gümüş Lig', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-400', icon: 'fa-medal' },
  gold: { name: 'Altın Lig', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-400', icon: 'fa-crown' },
  sapphire: { name: 'Safir Lig', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-500', icon: 'fa-gem' },
  ruby: { name: 'Yakut Lig', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-500', icon: 'fa-gem' },
  diamond: { name: 'Elmas Lig', color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-500', icon: 'fa-gem' },
};

// --- MODERN MODAL BİLEŞENİ ---
const Modal = ({ isOpen, onClose, title, children, type = 'info' }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className={`p-6 text-center ${type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 shadow-sm border-4 border-white ${
                        type === 'success' ? 'bg-green-500 text-white' : 
                        type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                        <i className={`fa-solid ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-xmark' : 'fa-info'}`}></i>
                    </div>
                    <h3 className="font-black text-xl text-gray-800 mb-1">{title}</h3>
                </div>
                <div className="p-6 text-center">
                    <p className="text-gray-600 font-bold mb-6 text-sm leading-relaxed">{children}</p>
                    <button 
                        onClick={onClose} 
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-extrabold uppercase shadow-lg hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );
};

interface UserProfile {
    id: number;
    name: string;
    slug: string;
    avatar_url: string;
    description: string;
    registered_date: string;
    level: number;
    location?: string;
    total_score?: number;
    earned_badges?: number[]; 
    clan?: any;
    league?: any;
    
    // Sosyal
    followers_count: number;
    following_count: number;
    high_fives: number;
    is_following: boolean;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [badges, setBadges] = useState<any[]>([]); 
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  
  const rawUsername = params?.username 
    ? (Array.isArray(params.username) ? params.username[0] : params.username) 
    : "";
  const usernameParam = decodeURIComponent(rawUsername);

  // Modal Yardımcısı
  const showModal = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
      setModal({ isOpen: true, title, message, type });
  };
  const closeModal = () => setModal({ ...modal, isOpen: false });

  useEffect(() => {
    async function fetchData() {
        if (!usernameParam) return;
        setLoading(true);
        setNotFound(false);

        try {
            // 0. Current User (Sahiplik kontrolü için)
            const me = await auth.me();
            setCurrentUser(me);

            // 1. Rozetleri Çek
            const badgesData = await auth.getAllBadges();
            setBadges(badgesData);

            // 2. Profil Verisini Çek
            let userData: any = null;

            if (usernameParam === 'me') {
                if (me) {
                    userData = { ...me, registered_date: new Date().toISOString(), slug: me.username };
                }
            } else {
                const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';
                const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                let res = await fetch(`${apiUrl}/wp/v2/users?slug=${usernameParam}`, { headers });
                let users = [];

                if (res.ok) users = await res.json();
                if (users.length === 0) {
                    res = await fetch(`${apiUrl}/wp/v2/users?search=${usernameParam}`, { headers });
                    if (res.ok) users = await res.json();
                }

                if (users.length > 0) userData = users[0];
            }

            if (userData) {
                // Uzman Kontrolü
                const isPro = userData.roles && userData.roles.includes('rejimde_pro');
                if (isPro) {
                    router.replace(`/experts/${userData.slug}`);
                    return;
                }

                const avatar = userData.avatar_url || `https://api.dicebear.com/9.x/personas/svg?seed=${userData.slug}`;
                const regDate = userData.registered_date ? new Date(userData.registered_date) : new Date();
                const formattedDate = regDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

                setProfile({
                    id: userData.id,
                    name: userData.name,
                    slug: userData.slug,
                    avatar_url: avatar,
                    description: userData.description || "Henüz bir motto eklenmemiş.",
                    registered_date: formattedDate,
                    level: userData.rejimde_level || 1,
                    location: userData.location || "İstanbul, Türkiye",
                    total_score: userData.rejimde_total_score || 0,
                    earned_badges: userData.rejimde_earned_badges || [],
                    clan: userData.clan,
                    league: userData.league || { name: 'Bronz Lig', icon: 'fa-medal', color: 'text-amber-700' },
                    
                    followers_count: userData.followers_count || 0,
                    following_count: userData.following_count || 0,
                    high_fives: userData.high_fives || 0,
                    is_following: userData.is_following || false
                });
            } else {
                setNotFound(true);
            }

        } catch (error) {
            console.error("Profil hatası:", error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    fetchData();
  }, [usernameParam, router]);

  // Takip Et / Bırak
  const handleFollow = async () => {
      if (!profile) return;
      if (!currentUser) {
          showModal("Giriş Yapmalısın", "Bir kullanıcıyı takip etmek için önce giriş yapmalısın.", "error");
          return;
      }
      
      setActionLoading(true);
      const res = await auth.toggleFollow(profile.id);
      
      if (res && res.success) {
          setProfile({
              ...profile,
              is_following: res.is_following,
              followers_count: res.followers_count
          });
          if (res.is_following) {
              showModal("Takip Edildi!", `${profile.name} artık takip listenizde.`, "success");
          }
      } else {
          showModal("Hata", "İşlem sırasında bir sorun oluştu.", "error");
      }
      setActionLoading(false);
  };

  // Beşlik Gönder
  const handleHighFive = async () => {
      if (!profile) return;
      if (!currentUser) {
          showModal("Giriş Yapmalısın", "Beşlik çakmak için giriş yapmalısın.", "error");
          return;
      }

      // Optimistik UI
      setProfile({...profile, high_fives: profile.high_fives + 1});
      
      const res = await auth.sendHighFive(profile.id);
      if (res && res.success) {
          // Başarılı, ses efekti veya konfeti eklenebilir
      } else {
          // Geri al ve hata göster
          setProfile({...profile, high_fives: profile.high_fives}); 
          showModal("Hata", res?.message || "Hata oluştu", "error");
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-gray-500 font-bold">Profil aranıyor...</p>
          </div>
      );
  }

  if (notFound || !profile) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20 text-center px-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-6 text-4xl">
                  <i className="fa-solid fa-user-slash"></i>
              </div>
              <h1 className="text-2xl font-black text-gray-700 mb-2">Kullanıcı Bulunamadı</h1>
              <p className="text-gray-500 font-bold mb-6 max-w-md">Aradığınız kullanıcı sistemde bulunamadı.</p>
              <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-extrabold shadow-lg hover:bg-blue-700 transition inline-block">Panele Dön</Link>
          </div>
      );
  }

  const isOwnProfile = currentUser && currentUser.id === profile.id;
  const leagueConfig = LEAGUES[profile.league?.slug] || LEAGUES.bronze;
  
  const displayLeague = {
      name: profile.league?.name || leagueConfig.name,
      color: profile.league?.color || leagueConfig.color,
      border: leagueConfig.border,
      bg: leagueConfig.bg,
      icon: profile.league?.icon || leagueConfig.icon
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50/50">
      
      {/* Modal */}
      <Modal isOpen={modal.isOpen} onClose={closeModal} title={modal.title} type={modal.type}>
          {modal.message}
      </Modal>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* PROFILE HEADER CARD */}
        <div className="bg-white border-b-4 border-gray-200 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-sm">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-50 to-purple-50"></div>
            <div className="absolute top-4 right-4 text-9xl text-black/5 opacity-50 rotate-12 pointer-events-none">
                <i className="fa-solid fa-bolt"></i>
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 pt-6">
                {/* Avatar */}
                <div className="relative shrink-0 group">
                    <div className="w-36 h-36 rounded-[2rem] border-4 border-white shadow-xl bg-white overflow-hidden transform group-hover:scale-105 transition duration-300">
                        <img 
                            src={profile.avatar_url} 
                            className="w-full h-full object-cover" 
                            alt={profile.name} 
                        />
                    </div>
                    {/* Level Badge */}
                    <div className="absolute -top-3 -right-3 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-black border-4 border-white shadow-sm z-10">
                        LVL {profile.level}
                    </div>
                </div>

                {/* Info */}
                <div className="text-center md:text-left flex-1 w-full">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight mb-2 leading-none">{profile.name}</h1>
                    
                    {/* Bio */}
                    <p className="text-gray-500 font-bold text-sm mb-6 max-w-lg mx-auto md:mx-0">
                        &quot;{profile.description}&quot;
                    </p>
                    
                    {/* Stats - Okunabilirlik İyileştirildi */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border-2 border-blue-100 flex items-center gap-2">
                            <i className="fa-solid fa-users text-lg"></i>
                            <div className="text-left">
                                <span className="block text-xs font-black uppercase opacity-70">Takipçi</span>
                                <span className="block text-sm font-black leading-none">{profile.followers_count}</span>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl border-2 border-yellow-100 flex items-center gap-2">
                            <i className="fa-solid fa-hand-spock text-lg"></i>
                            <div className="text-left">
                                <span className="block text-xs font-black uppercase opacity-70">Beşlik</span>
                                <span className="block text-sm font-black leading-none">{profile.high_fives}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl border-2 border-gray-100 flex items-center gap-2">
                            <i className="fa-solid fa-location-dot text-lg text-gray-400"></i>
                            <div className="text-left">
                                <span className="block text-xs font-black uppercase opacity-70">Konum</span>
                                <span className="block text-sm font-black leading-none">{profile.location?.split(',')[0] || 'Belirtilmemiş'}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Buttons (Sadece Başkasıysa Göster) */}
                    {!isOwnProfile && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <button 
                                onClick={handleFollow}
                                disabled={actionLoading}
                                className={`px-8 py-3 rounded-2xl font-extrabold text-sm uppercase shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all flex items-center gap-2 active:shadow-none active:translate-y-1 ${
                                    profile.is_following 
                                    ? 'bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500' 
                                    : 'bg-blue-600 text-white shadow-[0_4px_0_rgb(37,99,235)] hover:bg-blue-700'
                                }`}
                            >
                                {profile.is_following ? (
                                    <><i className="fa-solid fa-user-check"></i> Takip Ediliyor</>
                                ) : (
                                    <><i className="fa-solid fa-user-plus"></i> Takip Et</>
                                )}
                            </button>

                            <button 
                                onClick={handleHighFive}
                                className="bg-white border-2 border-gray-200 text-gray-500 px-4 py-3 rounded-2xl font-extrabold text-xl shadow-[0_4px_0_rgb(229,231,235)] hover:text-yellow-500 hover:border-yellow-200 hover:bg-yellow-50 transition-all active:shadow-none active:translate-y-1" 
                                title="Beşlik Çak! ✋"
                            >
                                ✋
                            </button>
                        </div>
                    )}
                </div>

                {/* Clan Info (Right Side - Desktop Only) */}
                {profile.clan && (
                    <div className="hidden lg:block text-right min-w-[180px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">MÜTTEFİK KLAN</p>
                        <Link href={`/clans/${profile.clan.slug}`} className="flex items-center gap-3 bg-purple-50 p-3 rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition cursor-pointer group hover:-translate-y-1 duration-200">
                            <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center text-purple-600 font-black text-xl group-hover:scale-110 transition overflow-hidden border-2 border-white shadow-sm">
                                {profile.clan.logo ? <img src={profile.clan.logo} className="w-full h-full object-cover" /> : <i className="fa-solid fa-shield-cat"></i>}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="font-extrabold text-gray-800 text-sm truncate w-24 group-hover:text-purple-700">{profile.clan.name}</p>
                                <p className="text-[10px] font-bold text-purple-500 uppercase">Aktif Üye</p>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-green-400 transition hover:-translate-y-1 duration-300">
                <i className="fa-solid fa-chart-pie text-green-500 text-3xl mb-2"></i>
                <div className="text-2xl font-black text-gray-800">{profile.total_score}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Toplam Skor</div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-red-400 transition hover:-translate-y-1 duration-300">
                <i className="fa-solid fa-fire text-red-500 text-3xl mb-2"></i>
                <div className="text-2xl font-black text-gray-800">24</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Gün Seri</div>
            </div>

            <div className={`bg-white border-2 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 duration-300 ${displayLeague.border} hover:bg-gray-50`}>
                <div className={`w-10 h-10 ${displayLeague.bg} rounded-full flex items-center justify-center text-white mb-2 shadow-sm`}>
                    <i className={`fa-solid ${displayLeague.icon}`}></i>
                </div>
                <div className="text-xl font-black text-gray-800 line-clamp-1">{displayLeague.name}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mevcut Lig</div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-blue-400 transition hover:-translate-y-1 duration-300">
                <i className="fa-solid fa-users text-blue-500 text-3xl mb-2"></i>
                <div className="text-2xl font-black text-gray-800">{profile.followers_count}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Takipçi</div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ROZET KOLEKSİYONU */}
            <div className="bg-white border-b-4 border-gray-200 rounded-[2rem] p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-wide flex items-center gap-3 border-b border-gray-100 pb-4">
                    <i className="fa-solid fa-medal text-purple-500 text-xl"></i> Rozet Koleksiyonu
                </h2>
                
                <div className="grid grid-cols-4 gap-4">
                    {badges.length > 0 ? badges.map((badge) => {
                        const isEarned = profile?.earned_badges?.some(id => Number(id) === Number(badge.id));
                        
                        return (
                            <div key={badge.id} className={`flex flex-col items-center text-center group cursor-pointer ${!isEarned ? 'opacity-40 grayscale hover:opacity-100 transition-opacity' : ''}`} title={badge.title}>
                                <div className="w-16 h-16 relative mb-2 transition transform group-hover:scale-110 duration-300">
                                    {badge.image ? (
                                        <img src={badge.image} alt={badge.title} className="w-full h-full object-contain drop-shadow-sm" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 text-2xl border-2 border-gray-200">
                                            <i className="fa-solid fa-award"></i>
                                        </div>
                                    )}
                                    {!isEarned && (
                                         <div className="absolute inset-0 flex items-center justify-center">
                                            <i className="fa-solid fa-lock text-gray-600 drop-shadow-md text-sm bg-white/80 p-1.5 rounded-full"></i>
                                         </div>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-4 text-center text-gray-400 text-sm font-bold py-8">Henüz rozet eklenmemiş.</div>
                    )}
                </div>
            </div>

            {/* SON AKTİVİTELER */}
            <div className="bg-white border-b-4 border-gray-200 rounded-[2rem] p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-wide flex items-center gap-3 border-b border-gray-100 pb-4">
                    <i className="fa-solid fa-bolt text-yellow-500 text-xl"></i> Son Aktiviteler
                </h2>
                <div className="space-y-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl flex gap-4 items-start">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-yellow-500 text-lg shrink-0 shadow-sm">
                            <i className="fa-solid fa-trophy"></i>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-700 leading-snug">
                                <span className="text-black font-black">{profile.name}</span> Bronz Ligi&apos;ne giriş yaptı! 🚀
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">Az önce</p>
                        </div>
                    </div>
                    
                    {profile.high_fives > 0 && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl flex gap-4 items-start">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 text-lg shrink-0 shadow-sm">
                                <i className="fa-solid fa-hand-spock"></i>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700 leading-snug">
                                    <span className="text-black font-black">{profile.name}</span> toplam {profile.high_fives} beşlik aldı! ✋
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">Bugün</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}