'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import { getMe, getGamificationStats, logoutUser } from "@/lib/api";
import { getSafeAvatarUrl } from "@/lib/helpers"; 
import StreakDisplay from "@/components/StreakDisplay";
import NotificationDropdown from "@/components/NotificationDropdown"; 
import Logo from "@/components/Logo"; // Logo bileşeni import edildi

export default function Header() {
  const [userRole, setUserRole] = useState('rejimde_user'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{name: string, avatar: string, username: string} | null>(null);
  const [score, setScore] = useState(0);
  
  // Auth Kontrol State'i
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const pathname = usePathname(); 
  const router = useRouter();

  const isActive = (path: string) => pathname.startsWith(path);

  const loadUserFromStorage = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    
    if (token) {
      setIsLoggedIn(true);
      const name = localStorage.getItem('user_name') || 'Kullanıcı';
      const storedAvatar = localStorage.getItem('user_avatar') || '';
      
      const slug = localStorage.getItem('user_slug') || '';
      const avatar = getSafeAvatarUrl(storedAvatar, slug || name);
      const role = localStorage.getItem('user_role') || 'rejimde_user';
      
      setUser({ name, avatar, username: slug }); 
      setUserRole(role);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    setIsCheckingAuth(false);
  };

  useEffect(() => {
    loadUserFromStorage();

    const syncWithServer = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          const userData = await getMe();
          if (userData) {
            localStorage.setItem('user_name', userData.name);
            localStorage.setItem('user_slug', userData.username);
            localStorage.setItem('user_id', String(userData.id));
            
            const remoteAvatar = getSafeAvatarUrl(userData.avatar_url, userData.username || userData.name);
            localStorage.setItem('user_avatar', remoteAvatar);
            
            if (userData.roles && userData.roles.length > 0) {
                 const primaryRole = userData.roles.includes('rejimde_pro') ? 'rejimde_pro' : userData.roles[0];
                 localStorage.setItem('user_role', primaryRole);
            }
            
            if (!userData.roles.includes('rejimde_pro')) {
                const stats = await getGamificationStats();
                if (stats) {
                    setScore(stats.total_score || 0);
                }
            }
            loadUserFromStorage();
          }
        } catch (error) {
          console.error("Header sync error:", error);
        }
      } else {
          setIsCheckingAuth(false);
      }
    };
    
    if (typeof window !== 'undefined') {
        syncWithServer();
        window.addEventListener('storage', loadUserFromStorage);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', loadUserFromStorage);
      }
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/login');
    router.refresh(); 
  };

  const isPro = userRole === 'rejimde_pro';
  const canCreateContent = ['rejimde_pro', 'administrator', 'editor'].includes(userRole);

  const dashboardLink = (isPro || canCreateContent) ? '/dashboard/pro' : '/dashboard';
  const settingsLink = isPro ? '/dashboard/pro/settings' : '/settings';
  const profileLink = isPro 
      ? `/experts/${user?.username || 'me'}` 
      : `/profile/${user?.username || 'me'}`;

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b-2 border-gray-100 fixed top-0 w-full z-50 transition-all duration-300 shadow-sm supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. BRANDING / LOGO - Güncellendi */}
          <Link href="/" className="mr-4 lg:mr-8 focus:outline-none rounded-xl">
             <Logo />
          </Link>

          {/* 2. DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {/* YAŞAM (DROPDOWN MENU) */}
            <div className="relative group h-full flex items-center">
                <button className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all duration-200 
                    ${isActive('/calculators') || isActive('/diets') || isActive('/exercises') || isActive('/sozluk') 
                    ? 'bg-blue-50 text-rejimde-blue' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
                    <i className="fa-solid fa-layer-group text-lg"></i>
                    Yaşam
                    <i className="fa-solid fa-chevron-down text-xs ml-1 opacity-50 group-hover:rotate-180 transition-transform duration-200"></i>
                </button>
                
                <div className="absolute top-[60px] -left-2 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-xl overflow-hidden p-2 space-y-1">
                        <Link href="/calculators" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-50 group/item transition">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-rejimde-blue flex items-center justify-center group-hover/item:scale-110 transition"><i className="fa-solid fa-calculator"></i></div>
                            <span className="font-bold text-gray-600 group-hover/item:text-rejimde-blue">Hesaplamalar</span>
                        </Link>
                        <Link href="/diets" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-green-50 group/item transition">
                            <div className="w-8 h-8 rounded-lg bg-green-100 text-rejimde-green flex items-center justify-center group-hover/item:scale-110 transition"><i className="fa-solid fa-carrot"></i></div>
                            <span className="font-bold text-gray-600 group-hover/item:text-rejimde-green">Diyet Listeleri</span>
                        </Link>
                        <Link href="/exercises" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 group/item transition">
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-rejimde-red flex items-center justify-center group-hover/item:scale-110 transition"><i className="fa-solid fa-dumbbell"></i></div>
                            <span className="font-bold text-gray-600 group-hover/item:text-rejimde-red">Egzersizler</span>
                        </Link>
                        <Link href="/sozluk" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-teal-50 group/item transition">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center group-hover/item:scale-110 transition"><i className="fa-solid fa-book-open"></i></div>
                            <span className="font-bold text-gray-600 group-hover/item:text-teal-600">Sözlük</span>
                        </Link>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <Link href="/blog" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-purple-50 group/item transition">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-rejimde-purple flex items-center justify-center group-hover/item:scale-110 transition"><i className="fa-solid fa-newspaper"></i></div>
                            <span className="font-bold text-gray-600 group-hover/item:text-rejimde-purple">Blog</span>
                        </Link>
                    </div>
                </div>
            </div>
            
            <Link href="/experts" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm uppercase tracking-wide group transition-all duration-200 ${isActive('/experts') ? 'bg-green-50 text-rejimde-green shadow-inner' : 'text-gray-400 hover:bg-green-50 hover:text-rejimde-green'}`}>
              <i className={`fa-solid fa-user-doctor text-lg transition ${isActive('/experts') ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}></i>
              Uzmanlar
            </Link>
            
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            
            <Link href="/circles" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all duration-200 ${isActive('/circles') ? 'bg-rejimde-purple text-white shadow-md shadow-purple-200 transform scale-105' : 'text-rejimde-purple bg-purple-50 border border-purple-100 hover:bg-purple-100'}`}>
              <i className="fa-solid fa-users text-lg"></i> Circles
            </Link>
            <Link href="/leagues" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all duration-200 ${isActive('/leagues') ? 'bg-rejimde-yellow text-white shadow-md shadow-yellow-200 transform scale-105' : 'text-rejimde-yellowDark bg-yellow-50 border border-yellow-100 hover:bg-yellow-100'}`}>
              <i className="fa-solid fa-trophy text-lg"></i> Levels
            </Link>
          </nav>

          {/* 3. ACTIONS */}
          <div className="flex items-center gap-4 min-w-[140px] justify-end">
            
            {isCheckingAuth ? (
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-24 bg-gray-100 rounded-xl animate-pulse hidden md:block"></div>
                    <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse"></div>
                 </div>
            ) : isLoggedIn ? (
              /* LOGGED IN STATE */
              <div className="hidden md:flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                
                {!isPro && (
                    <>
                      <div className="hidden lg:flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-xl cursor-pointer transition select-none" title="Toplam Puan">
                        <i className="fa-solid fa-star text-rejimde-yellow text-xl drop-shadow-sm"></i>
                        <span className="font-black text-gray-700 text-lg">{score}</span>
                      </div>
                      <StreakDisplay compact={true} />
                    </>
                )}

                {/* Notification Dropdown */}
                <NotificationDropdown isPro={isPro} />

                {/* Profile Dropdown */}
                <div className="relative group h-12 flex items-center">
                  <button className="w-10 h-10 rounded-xl border-2 border-gray-200 p-0.5 hover:border-rejimde-green transition focus:outline-none focus:ring-2 focus:ring-rejimde-green focus:ring-offset-2 overflow-hidden">
                    <img 
                        src={user?.avatar || "https://i.pravatar.cc/150?img=5"} 
                        className="w-full h-full rounded-lg bg-gray-100 object-cover" 
                        alt={user?.name || "Avatar"} 
                    />
                  </button>
                  
                <div className="absolute right-0 top-10 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden ring-1 ring-black/5">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-700 truncate">{user?.name || 'Kullanıcı'}</p>
                          <p className="text-[10px] font-black text-rejimde-blue uppercase mt-1">
                              {isPro ? 'PROFESYONEL HESAP' : (canCreateContent ? 'YÖNETİCİ HESABI' : 'STANDART ÜYE')}
                          </p>
                      </div>
                      
                      <Link href={dashboardLink} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-green-50 hover:text-rejimde-green transition">
                          <i className="fa-solid fa-gauge-high w-5 text-center"></i> Panelim
                      </Link>

                      {canCreateContent && (
                        <>
                            <div className="h-px bg-gray-100 my-1 mx-2"></div>
                            <p className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">İçerik Stüdyosu</p>
                            
                            <Link href="/dashboard/pro/diets/create" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition">
                                <i className="fa-solid fa-utensils w-5 text-center"></i> Diyet Yaz
                            </Link>
                            <Link href="/dashboard/pro/exercises/create" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-500 transition">
                                <i className="fa-solid fa-dumbbell w-5 text-center"></i> Egzersiz Yaz
                            </Link>
                            <Link href="/dashboard/pro/blog/create" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-500 transition">
                                <i className="fa-solid fa-pen-nib w-5 text-center"></i> Blog Yaz
                            </Link>
                            <div className="h-px bg-gray-100 my-1 mx-2"></div>
                        </>
                      )}
                      
                      <Link href={profileLink} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-rejimde-blue transition">
                          <i className="fa-solid fa-user w-5 text-center"></i> Profilim
                      </Link>
                      
                      <Link href={settingsLink} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-purple-50 hover:text-rejimde-purple transition">
                          <i className="fa-solid fa-gear w-5 text-center"></i> Ayarlar
                      </Link>
                      
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition text-left">
                          <i className="fa-solid fa-right-from-bracket w-5 text-center"></i> Çıkış Yap
                      </button>
                    </div>
                </div>
                </div>
              </div>
            ) : (
              /* GUEST STATE */
              <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <Link href="/login" className="hidden md:block font-extrabold text-gray-400 hover:text-rejimde-blue hover:bg-blue-50 px-4 py-2 rounded-xl transition uppercase tracking-wide text-sm whitespace-nowrap">
                  Giriş Yap
                </Link>
                <Link href="/register/user" className="bg-rejimde-green text-white px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide hover:bg-green-50 transition whitespace-nowrap">
                  Hesap Oluştur
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-gray-400 hover:text-rejimde-green text-2xl ml-2 focus:outline-none p-2 rounded-lg hover:bg-gray-50 transition"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE MENU */}
      <div className={`lg:hidden bg-white border-t-2 border-gray-100 shadow-lg absolute w-full left-0 top-20 z-40 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-6 space-y-4 overflow-y-auto max-h-[85vh] overscroll-contain pb-20">
          
          {isLoggedIn && (
             <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                <img src={user?.avatar} className="w-12 h-12 rounded-xl bg-white object-cover" alt="Avatar"/>
                <div>
                    <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded text-white ${isPro ? 'bg-rejimde-blue' : 'bg-rejimde-green'}`}>
                            {isPro ? 'UZMAN' : 'ÜYE'}
                        </span>
                        {!isPro && <span className="text-xs font-bold text-rejimde-yellow"><i className="fa-solid fa-star mr-1"></i>{score}</span>}
                    </div>
                </div>
             </div>
          )}

          <div className="text-xs font-black text-gray-400 uppercase ml-2 mb-1 tracking-wider">Yaşam & Araçlar</div>
          <div className="grid grid-cols-2 gap-3">
              <Link href="/calculators" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 text-rejimde-blue font-bold text-xs gap-2 active:scale-95 transition" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-calculator text-2xl mb-1"></i> Hesaplama
              </Link>
              <Link href="/diets" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-green-50 text-rejimde-green font-bold text-xs gap-2 active:scale-95 transition" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-carrot text-2xl mb-1"></i> Diyetler
              </Link>
              <Link href="/exercises" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50 text-rejimde-red font-bold text-xs gap-2 active:scale-95 transition" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-dumbbell text-2xl mb-1"></i> Egzersiz
              </Link>
              <Link href="/blog" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 text-rejimde-purple font-bold text-xs gap-2 active:scale-95 transition" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-newspaper text-2xl mb-1"></i> Blog
              </Link>
              <Link href="/sozluk" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50 text-teal-600 font-bold text-xs gap-2 col-span-2 active:scale-95 transition" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-book-open text-2xl mb-1"></i> Sözlük
              </Link>
          </div>

          <div className="space-y-2 pt-2">
            <Link href="/experts" className="block px-4 py-3 rounded-xl font-extrabold text-gray-600 bg-gray-50 border border-gray-100 hover:bg-green-50 hover:text-rejimde-green hover:border-green-200 transition flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 mr-3 shadow-sm"><i className="fa-solid fa-user-doctor"></i></div>
                Uzmanlar
            </Link>
            
            <Link href="/circles" className="block px-4 py-3 rounded-xl font-extrabold text-rejimde-purple bg-purple-50 border border-purple-100 flex items-center shadow-sm" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-rejimde-purple mr-3 shadow-sm"><i className="fa-solid fa-users"></i></div>
                Circles
            </Link>

            <Link href="/leagues" className="block px-4 py-3 rounded-xl font-extrabold text-rejimde-yellowDark bg-yellow-50 border border-yellow-100 flex items-center shadow-sm" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-rejimde-yellow mr-3 shadow-sm"><i className="fa-solid fa-trophy"></i></div>
                Rejimde Levels
            </Link>
          </div>
          
          {isLoggedIn ? (
             <div className="pt-4 border-t-2 border-gray-100 space-y-3">
                 <Link href={dashboardLink} className="block w-full text-center font-extrabold text-white bg-rejimde-green py-3.5 rounded-xl shadow-btn btn-game transition active:translate-y-1" onClick={() => setIsMobileMenuOpen(false)}>
                    Panelim
                 </Link>

                 {canCreateContent && (
                    <div className="py-2 space-y-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-center text-[10px] font-black text-gray-400 uppercase mb-2">Hızlı Eylemler</p>
                        <div className="grid grid-cols-2 gap-2">
                             <Link href="/dashboard/pro/diets/create" className="block text-center font-bold text-gray-600 bg-white border border-gray-200 py-2 rounded-lg text-xs" onClick={() => setIsMobileMenuOpen(false)}>Diyet Yaz</Link>
                             <Link href="/dashboard/pro/exercises/create" className="block text-center font-bold text-gray-600 bg-white border border-gray-200 py-2 rounded-lg text-xs" onClick={() => setIsMobileMenuOpen(false)}>Egzersiz Yaz</Link>
                        </div>
                    </div>
                 )}

                 <div className="flex gap-2">
                    <Link href={profileLink} className="flex-1 text-center font-extrabold text-gray-600 bg-gray-100 py-3 rounded-xl transition hover:bg-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                        Profil
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex-1 font-extrabold text-red-500 border-2 border-red-100 bg-red-50 py-3 rounded-xl hover:bg-red-100 transition">
                        Çıkış
                    </button>
                 </div>
             </div>
          ) : (
             <div className="flex flex-col gap-3 pt-4 border-t-2 border-gray-100">
                 <Link href="/register/user" className="w-full text-center font-extrabold text-white bg-rejimde-green py-3.5 rounded-xl shadow-btn btn-game active:translate-y-1" onClick={() => setIsMobileMenuOpen(false)}>
                    Hemen Başla
                 </Link>
                 <Link href="/login" className="w-full text-center font-extrabold text-gray-500 border-2 border-gray-200 py-3.5 rounded-xl hover:border-gray-300 transition" onClick={() => setIsMobileMenuOpen(false)}>
                    Giriş Yap
                 </Link>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}