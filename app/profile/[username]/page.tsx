"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import MascotDisplay from "@/components/MascotDisplay"; 
import { getMe, getAllBadges } from "@/lib/api"; 

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
    earned_badges?: number[]; // ID dizisi
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [badges, setBadges] = useState<any[]>([]); // Tüm rozetler
  
  const rawUsername = params?.username 
    ? (Array.isArray(params.username) ? params.username[0] : params.username) 
    : "";
  const usernameParam = decodeURIComponent(rawUsername);

  useEffect(() => {
    async function fetchData() {
        if (!usernameParam) return;
        setLoading(true);
        setNotFound(false);

        try {
            // 1. Rozetleri Çek
            const badgesData = await getAllBadges();
            setBadges(badgesData);

            // 2. Profil Verisini Çek
            let userData: any = null;

            if (usernameParam === 'me') {
                const me = await getMe();
                if (me) {
                    userData = {
                        ...me,
                        registered_date: new Date().toISOString(),
                        slug: me.username
                    };
                }
            } else {
                const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';
                // Token varsa ekle (Daha fazla veri görebilmek için)
                const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                let res = await fetch(`${apiUrl}/wp/v2/users?slug=${usernameParam}`, { headers });
                let users = [];

                if (res.ok) {
                    users = await res.json();
                }

                if (users.length === 0) {
                    res = await fetch(`${apiUrl}/wp/v2/users?search=${usernameParam}`, { headers });
                    if (res.ok) {
                        users = await res.json();
                    }
                }

                if (users.length > 0) {
                    userData = users[0];
                }
            }

            if (userData) {
                // --- UZMAN KONTROLÜ VE YÖNLENDİRME ---
                const isPro = userData.roles && userData.roles.includes('rejimde_pro');
                
                if (isPro) {
                    router.replace(`/experts/${userData.slug}`);
                    return;
                }
                // ------------------------------------

                const avatar = userData.avatar_url || userData.avatar_urls?.['96'] || `https://api.dicebear.com/9.x/personas/svg?seed=${userData.slug}`;
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
                    earned_badges: userData.rejimde_earned_badges || []
                });
            } else {
                setNotFound(true);
            }

        } catch (error) {
            console.error("Profil yüklenemedi:", error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    fetchData();
  }, [usernameParam, router]);

  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20">
              <div className="animate-spin text-rejimde-green text-4xl mb-4"><i className="fa-solid fa-circle-notch"></i></div>
              <p className="text-gray-500 font-bold">Profil aranıyor...</p>
          </div>
      );
  }

  if (notFound || !profile) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20 text-center px-4">
              <MascotDisplay state="cheat_meal_detected" size={200} showBubble={false} />
              <h1 className="text-2xl font-black text-gray-700 mt-6 mb-2">Kullanıcı Bulunamadı</h1>
              <p className="text-gray-500 font-bold mb-6 max-w-md">Aradığınız kullanıcı sistemde bulunamadı.</p>
              <Link href="/dashboard" className="bg-rejimde-blue text-white px-6 py-3 rounded-xl font-extrabold shadow-btn btn-game inline-block">Panele Dön</Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      
      {/* Navbar ve Footer layout.tsx'ten geliyor */}

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* PROFILE HEADER CARD */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-card">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-rejimde-yellow to-orange-400 opacity-10"></div>
            
            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg p-1 bg-white">
                        <img 
                            src={profile.avatar_url} 
                            className="w-full h-full rounded-2xl bg-gray-100 object-cover" 
                            alt={profile.name} 
                        />
                    </div>
                    {/* League Badge */}
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-rejimde-yellow border-4 border-white rounded-full flex items-center justify-center text-white text-xl shadow-sm z-10" title="Altın Lig">
                        <i className="fa-solid fa-trophy"></i>
                    </div>
                </div>

                {/* Info */}
                <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mb-1">
                        <h1 className="text-3xl font-extrabold text-gray-800">{profile.name}</h1>
                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg text-xs font-black uppercase">LVL {profile.level}</span>
                    </div>
                    
                    {/* Bio / Description */}
                    <p className="text-gray-600 font-medium text-sm mb-2 italic">"{profile.description}"</p>
                    
                    <p className="text-gray-400 font-bold text-xs mb-4 uppercase tracking-wide">
                        Üyelik: {profile.registered_date} • {profile.location}
                    </p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <button className="bg-rejimde-blue text-white px-8 py-3 rounded-xl font-extrabold text-sm uppercase shadow-btn shadow-rejimde-blueDark btn-game flex items-center gap-2 hover:bg-blue-500 transition">
                            <i className="fa-solid fa-user-plus"></i> Takip Et
                        </button>
                        <button className="bg-white border-2 border-gray-200 text-gray-500 px-4 py-3 rounded-xl font-extrabold text-xl shadow-btn shadow-gray-200 btn-game hover:text-rejimde-red hover:border-rejimde-red transition" title="Tebrik Et (High Five)">
                            ✋
                        </button>
                    </div>
                </div>

                {/* Clan Info (Right Side) */}
                <div className="hidden md:block text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bağlı Olduğu Klan</p>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border-2 border-transparent hover:border-rejimde-purple transition cursor-pointer group">
                        <div className="w-10 h-10 bg-rejimde-purple rounded-lg flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition">
                            D
                        </div>
                        <div className="text-left">
                            <p className="font-extrabold text-gray-700 text-sm">Düğün Tayfası</p>
                            <p className="text-xs font-bold text-rejimde-purple">3. Sıradalar</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* STATS ROW (Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Stat 1: Score */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm group hover:border-rejimde-green transition">
                <i className="fa-solid fa-chart-pie text-rejimde-green text-3xl mb-2 group-hover:scale-110 transition"></i>
                <div className="text-2xl font-black text-gray-700">{profile.total_score}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Toplam Skor</div>
            </div>
            
            {/* Stat 2: Streak */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm group hover:border-rejimde-red transition">
                <i className="fa-solid fa-fire text-rejimde-red text-3xl mb-2 animate-pulse"></i>
                <div className="text-2xl font-black text-gray-700">24</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Gün Streak</div>
            </div>

            {/* Stat 3: League */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm group hover:border-rejimde-yellow transition">
                <i className="fa-solid fa-shield-halved text-rejimde-yellow text-3xl mb-2 group-hover:scale-110 transition"></i>
                <div className="text-2xl font-black text-gray-700">1.</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Klasman Sırası</div>
            </div>

            {/* Stat 4: Friends */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm group hover:border-rejimde-blue transition">
                <i className="fa-solid fa-users text-rejimde-blue text-3xl mb-2 group-hover:scale-110 transition"></i>
                <div className="text-2xl font-black text-gray-700">14</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Takipçi</div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT: Achievements (Badges - DİNAMİK) */}
            <div>
                <h2 className="text-lg font-extrabold text-gray-700 mb-4 uppercase tracking-wide">Rozet Koleksiyonu</h2>
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 grid grid-cols-3 gap-4">
                    {badges.length > 0 ? badges.map((badge) => {
                        // Güvenli ID Karşılaştırması (String/Number)
                        const isEarned = profile?.earned_badges?.some(id => Number(id) === Number(badge.id));
                        
                        return (
                            <div key={badge.id} className={`flex flex-col items-center text-center group cursor-pointer ${!isEarned ? 'grayscale opacity-50' : ''}`}>
                                <div className="w-16 h-16 relative mb-2 transition transform group-hover:scale-110">
                                    <img 
                                        src={badge.image} 
                                        alt={badge.title} 
                                        className="w-full h-full object-contain drop-shadow-sm" 
                                    />
                                    {!isEarned && (
                                         <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                                            <i className="fa-solid fa-lock text-white drop-shadow-md"></i>
                                         </div>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-gray-600 line-clamp-1">{badge.title}</span>
                            </div>
                        );
                    }) : (
                        <div className="col-span-3 text-center text-gray-400 text-sm font-bold">Henüz rozet yok.</div>
                    )}
                </div>
            </div>

            {/* RIGHT: Recent Activity & Mascot Cheer */}
            <div>
                {/* Mascot Cheer */}
                <div className="mb-6 flex justify-center">
                    <MascotDisplay 
                        state="success_milestone" 
                        size={140} 
                        showBubble={true} 
                    />
                </div>

                <h2 className="text-lg font-extrabold text-gray-700 mb-4 uppercase tracking-wide">Son Aktiviteler</h2>
                <div className="space-y-4">
                    {/* Mock Activity */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex gap-4 items-start hover:border-rejimde-yellow transition">
                        <div className="w-10 h-10 bg-rejimde-yellow rounded-xl flex items-center justify-center text-white text-lg shrink-0">
                            <i className="fa-solid fa-trophy"></i>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-600">
                                <span className="text-gray-800 font-extrabold">{profile.name}</span> Düğün Ligi&apos;nde 1. sıraya yükseldi! 🚀
                            </p>
                            <p className="text-xs font-bold text-gray-400 mt-1">2 saat önce</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}