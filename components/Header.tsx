"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import { getMe } from "@/lib/api";
import { getSafeAvatarUrl } from "@/lib/helpers"; 

export default function Header() {
  const [userRole, setUserRole] = useState('rejimde_user'); // Varsayılan user
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{name: string, avatar: string} | null>(null);
  
  const pathname = usePathname(); 
  const router = useRouter();

  // Aktif link kontrolü
  const isActive = (path: string) => pathname.startsWith(path);

  // Kullanıcı verisini LocalStorage'dan yükle
  const loadUserFromStorage = () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsLoggedIn(true);
      const name = localStorage.getItem('user_name') || 'Kullanıcı';
      const storedAvatar = localStorage.getItem('user_avatar') || '';
      const slug = localStorage.getItem('user_name') || 'user';
      // Helper fonksiyon kullanarak güvenli avatar al
      const avatar = getSafeAvatarUrl(storedAvatar, slug);
      const role = localStorage.getItem('user_role') || 'rejimde_user';
      setUser({ name, avatar });
      setUserRole(role);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };
  

  // Sayfa yüklendiğinde ve storage değiştiğinde çalışır
  useEffect(() => {
    // 1. İlk yükleme (Cache'den)
    loadUserFromStorage();

    // 2. Taze veriyi API'den çek (Arka planda güncelle)
    const syncWithServer = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        const userData = await getMe();
        if (userData) {
          // LocalStorage'ı güncelle
          localStorage.setItem('user_name', userData.name);
          // Avatar mantığı: Helper fonksiyonla güvenli avatar al
          const remoteAvatar = getSafeAvatarUrl(userData.avatar_url, userData.username || userData.name);
          localStorage.setItem('user_avatar', remoteAvatar);
          
          // State'i güncelle
          loadUserFromStorage();
        } else {
          // Token geçersizse (userData null döndü)
          console.warn("Oturum süresi dolmuş olabilir.");
        }
      }
    };
    syncWithServer();

    // 3. Storage olayını dinle (Ayarlar sayfasından gelen güncellemeler için)
    window.addEventListener('storage', loadUserFromStorage);
    
    return () => {
      window.removeEventListener('storage', loadUserFromStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_avatar');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/login');
  };
  const dashboardLink = userRole === 'rejimde_pro' ? '/dashboard/pro' : '/dashboard';
  const settingsLink = userRole === 'rejimde_pro' ? '/dashboard/pro/settings' : '/settings';

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
                    ${isActive('/calculators') || isActive('/diets') || isActive('/exercises') ? 'bg-blue-50 text-rejimde-blue' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
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
          <div className="flex items-center gap-4">
            
            {isLoggedIn ? (
              /* LOGGED IN STATE */
              <div className="hidden md:flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-xl cursor-pointer transition" title="12 Günlük Seri">
                  <i className="fa-solid fa-fire text-rejimde-red text-xl animate-pulse"></i>
                  <span className="font-black text-rejimde-red text-lg">12</span>
                </div>
                
                <div className="hidden md:flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-xl cursor-pointer transition" title="450 Elmas">
                  <i className="fa-solid fa-gem text-rejimde-blue text-xl"></i>
                  <span className="font-black text-rejimde-blue text-lg">450</span>
                </div>

                {/* Profile Dropdown */}
                <div className="relative group h-12 flex items-center">
                  <button className="w-10 h-10 rounded-xl border-2 border-gray-200 p-0.5 hover:border-rejimde-green transition focus:outline-none focus:ring-2 focus:ring-rejimde-green focus:ring-offset-2 overflow-hidden">
                    <img 
                        src={user?.avatar || "https://i.pravatar.cc/150?img=5"} 
                        className="w-full h-full rounded-lg bg-gray-100 object-cover" 
                        alt="Avatar" 
                    />
                  </button>
                  
                {/* Dropdown Menu Kısmı */}
                <div className="absolute right-0 top-10 w-56 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase truncate">{user?.name || 'Kullanıcı'}</p>
                          <p className="text-[10px] font-black text-rejimde-blue uppercase">
                              {userRole === 'rejimde_pro' ? 'PROFESYONEL HESAP' : 'STANDART ÜYE'}
                          </p>
                      </div>
                      
                      <Link href={dashboardLink} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-green-50 hover:text-rejimde-green transition">
                          <i className="fa-solid fa-gauge-high"></i> Panelim
                      </Link>
                      
                      {/* Profil linki: Uzmanlar için kendi public sayfalarına, kullanıcılar için kendi profillerine */}
                      {/* Not: Henüz dinamik slug yapmadık, şimdilik statik bırakabiliriz veya username ekleyebiliriz */}
                      
                      <Link href={settingsLink} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-purple-50 hover:text-rejimde-purple transition">
                          <i className="fa-solid fa-gear"></i> Ayarlar
                      </Link>
                      
                      <div className="h-px bg-gray-100"></div>
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition text-left">
                          <i className="fa-solid fa-right-from-bracket"></i> Çıkış Yap
                      </button>
                    </div>
                </div>
                </div>
              </div>
            ) : (
              /* GUEST STATE */
              <div className="flex items-center gap-3">
                <Link href="/login" className="hidden md:block font-extrabold text-gray-400 hover:text-rejimde-blue hover:bg-blue-50 px-4 py-2 rounded-xl transition uppercase tracking-wide text-sm">
                  Giriş Yap
                </Link>
                <Link href="/register/user" className="bg-rejimde-green text-white px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide hover:bg-green-500 transition">
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
      <div className={`lg:hidden bg-white border-t-2 border-gray-100 shadow-lg absolute w-full left-0 top-20 z-40 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-6 space-y-2">
          
          <div className="text-xs font-black text-gray-400 uppercase ml-2 mb-1">Yaşam</div>
          <div className="grid grid-cols-2 gap-2 mb-4">
              <Link href="/calculators" className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-rejimde-blue font-bold text-xs gap-2">
                <i className="fa-solid fa-calculator text-xl"></i> Hesaplama
              </Link>
              <Link href="/diets" className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 text-rejimde-green font-bold text-xs gap-2">
                <i className="fa-solid fa-carrot text-xl"></i> Diyetler
              </Link>
              <Link href="/exercises" className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 text-rejimde-red font-bold text-xs gap-2">
                <i className="fa-solid fa-dumbbell text-xl"></i> Egzersiz
              </Link>
              <Link href="/blog" className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 text-rejimde-purple font-bold text-xs gap-2">
                <i className="fa-solid fa-newspaper text-xl"></i> Blog
              </Link>
          </div>

          <Link href="/experts" className="block px-4 py-3 rounded-xl font-extrabold text-gray-500 hover:bg-green-50 hover:text-rejimde-green transition flex items-center">
            <i className="fa-solid fa-user-doctor w-6 text-center mr-2"></i> Uzmanlar
          </Link>
          
          <Link href="/clans" className="block px-4 py-3 rounded-xl font-extrabold text-rejimde-purple bg-purple-50 border border-purple-100 flex items-center">
            <i className="fa-solid fa-users w-6 text-center mr-2"></i> Klanlar
          </Link>

          <Link href="/leagues" className="block px-4 py-3 rounded-xl font-extrabold text-rejimde-yellowDark bg-yellow-50 border border-yellow-100 flex items-center">
            <i className="fa-solid fa-trophy w-6 text-center mr-2"></i> Rejimde Ligi
          </Link>
          
          {isLoggedIn ? (
             <Link href="/dashboard" className="block w-full text-center font-extrabold text-white bg-rejimde-green py-3 rounded-xl shadow-btn btn-game transition mt-4">Panelim</Link>
          ) : (
             <div className="flex gap-2 mt-4">
                 <button className="flex-1 font-extrabold text-gray-500 border-2 border-gray-200 py-3 rounded-xl hover:border-gray-300 transition">Giriş Yap</button>
                 <button className="flex-1 font-extrabold text-white bg-rejimde-green py-3 rounded-xl shadow-btn btn-game">Kayıt Ol</button>
             </div>
          )}
          
          {isLoggedIn && (
             <button onClick={handleLogout} className="w-full mt-2 font-extrabold text-red-500 border-2 border-red-200 py-3 rounded-xl hover:bg-red-50 transition">Çıkış Yap</button>
          )}
        </div>
      </div>
    </header>
  );
}