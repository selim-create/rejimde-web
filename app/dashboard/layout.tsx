"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProDashboardLayout({ children }:  { children: React. ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Sadece localStorage kontrolü yap - API çağrısı YAPMA
    const token = localStorage. getItem('jwt_token');
    const role = localStorage.getItem('user_role');
    
    if (!token) {
      router.replace('/login');
      return;
    }

    const allowedRoles = ['rejimde_pro', 'rejimde_user', 'administrator', 'editor', 'author', 'contributor'];
    if (role && allowedRoles.includes(role)) {
      setIsReady(true);
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

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