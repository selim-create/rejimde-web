'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { acceptClientInvite } from '@/lib/api';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'login_required' | 'accepting' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [expert, setExpert] = useState<{ name: string; avatar: string } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const jwtToken = localStorage.getItem('jwt_token');
    if (!jwtToken) {
      setStatus('login_required');
    } else {
      setStatus('accepting');
      handleAcceptInvite();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcceptInvite = async () => {
    setStatus('accepting');
    
    const result = await acceptClientInvite(token);
    
    if (result.success) {
      setExpert(result.expert || null);
      setStatus('success');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } else {
      setError(result.message || 'Davet kabul edilemedi');
      setStatus('error');
    }
  };

  const handleLoginRedirect = () => {
    // Store invite token to process after login
    localStorage.setItem('pending_invite_token', token);
    router.push('/login?redirect=/invite/' + token);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full border border-slate-700 shadow-2xl text-center">
        
        {/* Loading */}
        {status === 'loading' && (
          <div className="py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
            <p className="text-slate-400 font-bold">Yükleniyor...</p>
          </div>
        )}

        {/* Login Required */}
        {status === 'login_required' && (
          <>
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-user-plus text-3xl text-blue-400"></i>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Danışmanlık Daveti</h1>
            <p className="text-slate-400 text-sm mb-8">
              Bu daveti kabul etmek için giriş yapmanız gerekiyor.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-extrabold shadow-lg shadow-blue-900/30 hover:bg-blue-500 transition"
              >
                <i className="fa-solid fa-right-to-bracket mr-2"></i>
                Giriş Yap
              </button>
              <Link 
                href={`/register?redirect=/invite/${token}`}
                className="block w-full bg-slate-700 text-white py-4 rounded-xl font-bold hover:bg-slate-600 transition"
              >
                <i className="fa-solid fa-user-plus mr-2"></i>
                Hesap Oluştur
              </Link>
            </div>
          </>
        )}

        {/* Accepting */}
        {status === 'accepting' && (
          <div className="py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-6"></div>
            <p className="text-white font-bold text-lg mb-2">Davet Kabul Ediliyor</p>
            <p className="text-slate-400 text-sm">Lütfen bekleyin...</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && expert && (
          <>
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-check text-3xl text-green-400"></i>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Davet Kabul Edildi!</h1>
            <p className="text-slate-400 text-sm mb-6">
              Artık <span className="text-white font-bold">{expert.name}</span> ile çalışmaya başlayabilirsiniz.
            </p>
            <div className="flex items-center justify-center gap-4 p-4 bg-slate-900/50 rounded-2xl mb-6">
              <img 
                src={expert.avatar} 
                alt={expert.name}
                className="w-14 h-14 rounded-xl"
              />
              <div className="text-left">
                <p className="text-white font-bold">{expert.name}</p>
                <p className="text-xs text-slate-500">Uzmanınız</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              <i className="fa-solid fa-clock mr-1"></i>
              3 saniye içinde yönlendirileceksiniz...
            </p>
            <Link 
              href="/dashboard"
              className="text-blue-400 font-bold text-sm hover:underline"
            >
              Hemen Git →
            </Link>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-times text-3xl text-red-400"></i>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Hata</h1>
            <p className="text-red-400 text-sm mb-6">{error}</p>
            <Link 
              href="/"
              className="inline-block bg-slate-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-600 transition"
            >
              <i className="fa-solid fa-home mr-2"></i>
              Ana Sayfaya Dön
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
