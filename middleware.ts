import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Cookie'den token ve rol al
  const token = request.cookies.get('jwt_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  
  // Public sayfalar - kontrol yok
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/blog', '/experts', '/sozluk', '/diets', '/exercises', '/tools', '/about'];
  const isPublic = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  
  if (isPublic) {
    // Giriş yapmışsa auth sayfalarından uzak tut
    if (token && (pathname === '/login' || pathname === '/register')) {
      const redirectUrl = userRole === 'rejimde_pro' ? '/dashboard/pro' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }
  
  // Korumalı sayfalarda giriş kontrolü
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Pro sayfalarına sadece pro/admin/editor erişebilir
  if (pathname.startsWith('/dashboard/pro')) {
    const allowedRoles = ['rejimde_pro', 'administrator', 'editor'];
    if (!allowedRoles.includes(userRole || '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Normal dashboard'a pro kullanıcı erişemez (kendi paneline gitsin)
  if (pathname === '/dashboard' || pathname === '/settings') {
    if (userRole === 'rejimde_pro') {
      const redirect = pathname === '/settings' ? '/dashboard/pro/settings' : '/dashboard/pro';
      return NextResponse.redirect(new URL(redirect, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
