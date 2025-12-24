'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import { getMe, getGamificationStats, logoutUser } from "@/lib/api";
import { getSafeAvatarUrl } from "@/lib/helpers"; 

export default function Header() {
  const [userRole, setUserRole] = useState('rejimde_user'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{name: string, avatar: string, username: string} | null>(null);
  const [score, setScore] = useState(0);
  
  // YENİ: Auth Kontrol State'i (Flickering Çözümü)
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
      
      // DÜZELTME: user_slug kullan, email'den türetme!
      const slug = localStorage.getItem('user_slug') || '';
      const avatar = getSafeAvatarUrl(storedAvatar, slug || name);
      const role = localStorage.getItem('user_role') || 'rejimde_user';
      
      setUser({ name, avatar, username: slug }); // username yerine slug
      setUserRole(role);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    // Kontrol tamamlandı
    setIsCheckingAuth(false);
  };

  useEffect(() => {
    // 1. İlk yükleme (Cache'den)
    loadUserFromStorage();

    // 2. Taze veriyi API'den çek
    const syncWithServer = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          const userData = await getMe();
          if (userData) {
            localStorage.setItem('user_name', userData.name);
            localStorage.setItem('user_slug', userData.username); // SLUG GÜNCELLE
            localStorage.setItem('user_id', String(userData.id)); // ID GÜNCELLE
            
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
          // Token yoksa da kontrol bitti demektir
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
  // İçerik oluşturma yetkisi (Pro, Admin veya Editör)
  const canCreateContent = ['rejimde_pro', 'administrator', 'editor'].includes(userRole);

  const dashboardLink = (isPro || canCreateContent) ? '/dashboard/pro' : '/dashboard';
  const settingsLink = isPro ? '/dashboard/pro/settings' : '/settings';
  const profileLink = isPro 
      ? `/experts/${user?.username || 'me'}` 
      : `/profile/${user?.username || 'me'}`;

  return (
    <header className="bg-white border-b-2 border-gray-200 fixed top-0 w-full z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. LOGO */}
          <Link href="/" className="flex items-center gap-2 group mr-4 lg:mr-8">
            <div className="relative">
              <i className="fa-solid fa-leaf text-rejimde-green text-3xl group-hover:rotate-12 transition transform duration-300"></i>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-rejimde-yellow rounded-full border-2 border-white"></div>
            </div>
            <span className="text-3xl font-extrabold text-rejimde-green tracking-tight hidden sm:block">rejimde</span>
          </Link>

          {/* 2. DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-2 flex-1">
            {/* YAŞAM (DROPDOWN MENU) */}
            <div className="relative group h-full flex items-center">
                <button className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all duration-200 
                    ${isActive('/calculators') || isActive('/diets') || isActive('/exercises') || isActive('/sozluk') ? 'bg-blue-50 text-rejimde-blue' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
                    <i className="fa-solid fa-layer-group text-lg"></i>
                    Yaşam
                    <i className="fa-solid fa-chevron-down text-xs ml-1 opacity-50"></i>
                </button>
                
                <div className="absolute top-14 left-0 w-64 bg-white border-2 border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left overflow-hidden z-50 pt-2">
                    <div className="p-2 space-y-1">
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
                        {/* SÖZLÜK EKLENDİ */}
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
            <Link href="/clans" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all duration-200 ${isActive('/clans') ? 'bg-rejimde-purple text-white shadow-md transform scale-105' : 'text-rejimde-purple bg-purple-50 border border-purple-100 hover:bg-purple-100'}`}>
              <i className="fa-solid fa-users text-lg"></i> Klanlar
            </Link>
            <Link href="/leagues" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all duration-200 ${isActive('/leagues') ? 'bg-rejimde-yellow text-white shadow-md transform scale-105' : 'text-rejimde-yellowDark bg-yellow-50 border border-yellow-100 hover:bg-yellow-100'}`}>
              <i className="fa-solid fa-trophy text-lg"></i> Ligler
            </Link>
          </nav>

          {/* 3. ACTIONS */}
          <div className="flex items-center gap-4 min-w-[140px] justify-end">
            
            {/* YÜKLENİYORSA BOŞ GÖSTER (FLICKERING ÖNLEME) */}
            {isCheckingAuth ? (
                 <div className="h-10 w-32 bg-gray-100 rounded-xl animate-pulse hidden md:block"></div>
            ) : isLoggedIn ? (
              /* LOGGED IN STATE */
              <div className="hidden md:flex items-center gap-2 md:gap-4 animate-in fade-in zoom-in duration-300">
                
                {!isPro && (
                    <div className="hidden md:flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-xl cursor-pointer transition" title="Toplam Puan">
                      <i className="fa-solid fa-star text-rejimde-yellow text-xl"></i>
                      <span className="font-black text-gray-700 text-lg">{score}</span>
                    </div>
                )}

                {/* Profile Dropdown */}
                <div className="relative group h-12 flex items-center">
                  <button className="w-10 h-10 rounded-xl border-2 border-gray-200 p-0.5 hover:border-rejimde-green transition focus:outline-none focus:ring-2 focus:ring-rejimde-green focus:ring-offset-2 overflow-hidden">
                    <img 
                        src={user?.avatar || "https://i.pravatar.cc/150?img=5"} 
                        className="w-full h-full rounded-lg bg-gray-100 object-cover" 
                        alt={user?.name || "Avatar"} 
                    />
                  </button>
                  
                {/* Dropdown Menu Kısmı */}
                <div className="absolute right-0 top-10 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-700 truncate">{user?.name || 'Kullanıcı'}</p>
                          <p className="text-[10px] font-black text-rejimde-blue uppercase mt-1">
                              {isPro ? 'PROFESYONEL HESAP' : (canCreateContent ? 'YÖNETİCİ HESABI' : 'STANDART ÜYE')}
                          </p>
                      </div>
                      
                      <Link href={dashboardLink} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-green-50 hover:text-rejimde-green transition">
                          <i className="fa-solid fa-gauge-high w-5 text-center"></i> Panelim
                      </Link>

                      {/* İÇERİK OLUŞTURMA LİNKLERİ (YETKİLİ KULLANICILAR İÇİN) */}
                      {canCreateContent && (
                        <>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <p className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-wider">İçerik Oluştur</p>
                            
                            <Link href="/dashboard/pro/diets/create" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition">
                                <i className="fa-solid fa-utensils w-5 text-center"></i> Diyet Yaz
                            </Link>
                            <Link href="/dashboard/pro/exercises/create" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-500 transition">
                                <i className="fa-solid fa-dumbbell w-5 text-center"></i> Egzersiz Yaz
                            </Link>
                            <Link href="/dashboard/pro/blog/create" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-500 transition">
                                <i className="fa-solid fa-pen-nib w-5 text-center"></i> Blog Yaz
                            </Link>
                            <Link href="/dashboard/pro/dictionary/create" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-teal-50 hover:text-teal-500 transition">
                                <i className="fa-solid fa-book-open w-5 text-center"></i> Sözlük Ekle
                            </Link>
                            <div className="h-px bg-gray-100 my-1"></div>
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
              className="lg:hidden text-gray-400 hover:text-rejimde-green text-2xl ml-2 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE MENU */}
      <div className={`lg:hidden bg-white border-t-2 border-gray-100 shadow-lg absolute w-full left-0 top-20 z-40 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-6 space-y-4 overflow-y-auto max-h-[80vh]">
          
          {isLoggedIn && (
             <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <img src={user?.avatar} className="w-10 h-10 rounded-lg bg-white" alt="Avatar"/>
                <div>
                    <p className="font-bold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-rejimde-blue font-bold">{isPro ? 'Uzman' : 'Üye'}</p>
                </div>
             </div>
          )}

          <div className="text-xs font-black text-gray-400 uppercase ml-2 mb-1">Yaşam</div>
          <div className="grid grid-cols-2 gap-2">
              <Link href="/calculators" className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-rejimde-blue font-bold text-xs gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-calculator text-xl"></i> Hesaplama
              </Link>
              <Link href="/diets" className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 text-rejimde-green font-bold text-xs gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-carrot text-xl"></i> Diyetler
              </Link>
              <Link href="/exercises" className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 text-rejimde-red font-bold text-xs gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-dumbbell text-xl"></i> Egzersiz
              </Link>
              <Link href="/blog" className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 text-rejimde-purple font-bold text-xs gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-newspaper text-xl"></i> Blog
              </Link>
              <Link href="/sozluk" className="flex flex-col items-center justify-center p-3 rounded-xl bg-teal-50 text-teal-600 font-bold text-xs gap-2 col-span-2" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-book-open text-xl"></i> Sözlük
              </Link>
          </div>

          <div className="space-y-1">
            <Link href="/experts" className="block px-4 py-3 rounded-xl font-extrabold text-gray-500 hover:bg-green-50 hover:text-rejimde-green transition flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-user-doctor w-6 text-center mr-2"></i> Uzmanlar
            </Link>
            
            <Link href="/clans" className="block px-4 py-3 rounded-xl font-extrabold text-rejimde-purple bg-purple-50 border border-purple-100 flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-users w-6 text-center mr-2"></i> Klanlar
            </Link>

            <Link href="/leagues" className="block px-4 py-3 rounded-xl font-extrabold text-rejimde-yellowDark bg-yellow-50 border border-yellow-100 flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-trophy w-6 text-center mr-2"></i> Rejimde Ligi
            </Link>
          </div>
          
          {isLoggedIn ? (
             <div className="pt-2 border-t border-gray-100 space-y-2">
                 <Link href={dashboardLink} className="block w-full text-center font-extrabold text-white bg-rejimde-green py-3 rounded-xl shadow-btn btn-game transition" onClick={() => setIsMobileMenuOpen(false)}>
                    Panelim
                 </Link>

                 {/* MOBİL MENÜ İÇİN İÇERİK OLUŞTURMA LİNKLERİ */}
                 {canCreateContent && (
                    <div className="py-2 space-y-2 border-t border-gray-100">
                        <p className="text-center text-[10px] font-black text-gray-400 uppercase">İçerik Oluştur</p>
                        <div className="grid grid-cols-2 gap-2">
                             <Link href="/dashboard/pro/diets/create" className="block text-center font-bold text-gray-600 bg-orange-50 py-2 rounded-xl text-xs" onClick={() => setIsMobileMenuOpen(false)}>Diyet Yaz</Link>
                             <Link href="/dashboard/pro/exercises/create" className="block text-center font-bold text-gray-600 bg-red-50 py-2 rounded-xl text-xs" onClick={() => setIsMobileMenuOpen(false)}>Egzersiz Yaz</Link>
                             <Link href="/dashboard/pro/blog/create" className="block text-center font-bold text-gray-600 bg-purple-50 py-2 rounded-xl text-xs" onClick={() => setIsMobileMenuOpen(false)}>Blog Yaz</Link>
                             <Link href="/dashboard/pro/dictionary/create" className="block text-center font-bold text-gray-600 bg-teal-50 py-2 rounded-xl text-xs" onClick={() => setIsMobileMenuOpen(false)}>Sözlük Ekle</Link>
                        </div>
                    </div>
                 )}

                 <Link href={profileLink} className="block w-full text-center font-extrabold text-gray-600 bg-gray-100 py-3 rounded-xl transition" onClick={() => setIsMobileMenuOpen(false)}>
                    Profilim
                 </Link>
                 <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full font-extrabold text-red-500 border-2 border-red-200 py-3 rounded-xl hover:bg-red-50 transition">
                    Çıkış Yap
                 </button>
             </div>
          ) : (
             <div className="flex gap-2 pt-2 border-t border-gray-100">
                 <Link href="/login" className="flex-1 text-center font-extrabold text-gray-500 border-2 border-gray-200 py-3 rounded-xl hover:border-gray-300 transition" onClick={() => setIsMobileMenuOpen(false)}>
                    Giriş Yap
                 </Link>
                 <Link href="/register/user" className="flex-1 text-center font-extrabold text-white bg-rejimde-green py-3 rounded-xl shadow-btn btn-game" onClick={() => setIsMobileMenuOpen(false)}>
                    Kayıt Ol
                 </Link>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}