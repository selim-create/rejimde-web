"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';

export default function ProDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const allowedRoles = ['rejimde_pro', 'administrator', 'editor'];
    
    async function checkAccess() {
      // 1. Önce localStorage'dan kontrol et
      const token = localStorage.getItem('jwt_token');
      const role = localStorage.getItem('user_role');
      
      // Token yoksa login'e yönlendir
      if (!token) {
        router.replace('/login');
        return;
      }

      // 2. localStorage'daki rol uygunsa HEMEN sayfayı göster
      if (role && allowedRoles.includes(role)) {
        setIsReady(true);
        
        // 3. Arka planda API ile doğrula (sayfayı bloklamadan)
        try {
          const user = await getMe();
          
          // API başarısız veya user null ise - sadece log at, sayfayı kapatma
          if (!user) {
            console.warn('Pro layout: API doğrulaması başarısız, localStorage ile devam ediliyor');
            return;
          }
          
          // Rol uyumsuzluğu varsa yönlendir
          const hasAccess = user.roles && Array.isArray(user.roles) && 
                           user.roles.some((r: string) => allowedRoles.includes(r));
          
          if (!hasAccess) {
            console.warn('Pro layout: API rol kontrolü başarısız, dashboard\'a yönlendiriliyor');
            router.replace('/dashboard');
          }
        } catch (error) {
          // API hatası - localStorage'daki role güvenmeye devam et
          console.error('Pro layout API error:', error);
        }
      } else {
        // localStorage'daki rol uygun değil - normal dashboard'a yönlendir
        router.replace('/dashboard');
      }
    }
    
    checkAccess();
  }, [router]);

  // Sayfa hazır değilse loading göster
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-circle-notch animate-spin text-white text-3xl"></i>
          <p className="text-slate-400 font-bold text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
