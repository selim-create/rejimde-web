"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');

  useEffect(() => {
    async function checkAccess() {
      try {
        const token = localStorage.getItem('jwt_token');
        const role = localStorage.getItem('user_role');
        
        if (!token) {
          router.replace('/login');
          return;
        }

        // Pro kullanıcıyı kendi paneline yönlendir
        if (role === 'rejimde_pro') {
          router.replace('/dashboard/pro');
          return;
        }

        // Normal kullanıcı için hızlı onay
        setAuthState('authorized');

        // API'den doğrulama
        const user = await getMe();
        
        if (!user) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user_role');
          router.replace('/login');
          return;
        }
        
        if (user.roles?.includes('rejimde_pro')) {
          router.replace('/dashboard/pro');
          return;
        }
        
      } catch (error) {
        console.error('Dashboard layout auth error:', error);
        const role = localStorage.getItem('user_role');
        if (role && role !== 'rejimde_pro') {
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
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-circle-notch animate-spin text-rejimde-green text-3xl"></i>
          <p className="text-gray-400 font-bold text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthorized') {
    return null;
  }

  return <>{children}</>;
}
