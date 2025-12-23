"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkAccess() {
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

      // Normal kullanıcı için sayfayı göster
      setIsReady(true);

      // Arka planda API doğrulaması
      try {
        const user = await getMe();
        if (user && user.roles && Array.isArray(user.roles) &&
          user.roles.some((r: string) => r === 'rejimde_pro')) {
          router.replace('/dashboard/pro');
        }
      } catch (error) {
        console.error('Dashboard layout API error:', error);
      }
    }
    
    checkAccess();
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-circle-notch animate-spin text-green-500 text-3xl"></i>
          <p className="text-gray-400 font-bold text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
