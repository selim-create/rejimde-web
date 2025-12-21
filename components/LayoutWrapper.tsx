"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const hidePaths = ["/register", "/login", "/forgot-password"];
  const shouldHideHeaderFooter = hidePaths.some(path => pathname.startsWith(path));

  // GÜVENLİK KONTROLÜ
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role');

    // Eğer giriş yapmışsa ve Auth sayfalarındaysa -> Dashboard'a at
    if (token && shouldHideHeaderFooter) {
        if (role === 'rejimde_pro') {
            router.push('/dashboard/pro');
        } else {
            router.push('/dashboard');
        }
    }
  }, [pathname, router, shouldHideHeaderFooter]);

  if (shouldHideHeaderFooter) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}