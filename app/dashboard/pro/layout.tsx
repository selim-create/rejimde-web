"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';

export default function ProDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');

  useEffect(() => {
    const allowedRoles = ['rejimde_pro', 'administrator', 'editor'];
    
    async function checkAccess() {
      try {
        // Önce localStorage'dan hızlı kontrol
        const token = localStorage.getItem('jwt_token');
        const role = localStorage.getItem('user_role');
        
        if (!token) {
          router.replace('/login');
          return;
        }

        // Hızlı rol kontrolü (localStorage'dan)
        if (role && allowedRoles.includes(role)) {
          setAuthState('authorized');
        }

        // API'den doğrulama (arka planda)
        const user = await getMe();
        
        if (!user) {
          // Token geçersiz olabilir, login'e yönlendir
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user_role');
          router.replace('/login');
          return;
        }
        
        const hasAccess = user.roles?.some((r: string) => allowedRoles.includes(r));
        
        if (!hasAccess) {
          router.replace('/dashboard');
          return;
        }
        
        setAuthState('authorized');
      } catch (error) {
        console.error('Pro layout auth error:', error);
        // Hata durumunda localStorage'daki role güven
        const role = localStorage.getItem('user_role');
        if (role && allowedRoles.includes(role)) {
          setAuthState('authorized');
        } else {
          router.replace('/login');
        }
      }
    }
    
    checkAccess();
  }, [router]);

  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-circle-notch animate-spin text-white text-3xl"></i>
          <p className="text-slate-400 font-bold text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthorized') {
    return null;
  }

  return <>{children}</>;
}
