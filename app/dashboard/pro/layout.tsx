"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';

export default function ProDashboardLayout({ children }: { children: React.ReactNode }) {
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
        
        const allowedRoles = ['rejimde_pro', 'administrator', 'editor'];
        if (!user.roles?.some((role: string) => allowedRoles.includes(role))) {
          router.replace('/dashboard');
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <i className="fa-solid fa-circle-notch animate-spin text-white text-2xl"></i>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
