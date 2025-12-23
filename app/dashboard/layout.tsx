"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const user = await getMe();
        if (!user) {
          router.replace('/login');
          return;
        }
        
        // Pro kullanıcıyı kendi paneline yönlendir
        if (user.roles?.includes('rejimde_pro')) {
          router.replace('/dashboard/pro');
          return;
        }
        
        setAuthorized(true);
      } catch {
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    }
    checkAccess();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <i className="fa-solid fa-circle-notch animate-spin text-rejimde-green text-2xl"></i>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
