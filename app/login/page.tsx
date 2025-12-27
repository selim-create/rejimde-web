"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";
import { getMe, loginUser, loginWithGoogle } from "@/lib/api";

// YENİ: Google Login Hook'u
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Google Login Başlatıcı
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      // Not: useGoogleLogin bize access_token verir, ancak backend id_token bekliyorsa
      // 'GoogleLogin' bileşenini kullanmak veya flow'u değiştirmek gerekir.
      // Basitlik için burada id_token bekleyen yapıyı destekleyen 'credential' akışını kullanacağız.
      // Ancak useGoogleLogin daha esnektir. 
      // Düzeltme: Backend'e id_token göndermek için 'GoogleLogin' bileşeni daha uygundur
      // veya flow: 'auth-code' kullanılabilir.
      // Biz burada butonu özelleştirmek istediğimiz için manuel flow kullanacağız ama 
      // backend tarafında 'access_token' ile doğrulama yapmak daha kolay olabilir.
      // Şimdilik standart Google butonu yerine kendi butonumuzu kullandığımız için
      // onSuccess'de gelen access_token'ı backend'e gönderecek şekilde backend'i revize etmek gerekebilir.
      // VEYA: Daha kolayı, backend id_token beklediği için GoogleLogin bileşeni kullanmak.
      // Ama tasarımımız özel. O yüzden 'credential' yerine access_token ile user info çeken bir yapı kuralım mı?
      // Hayır, en sağlıklısı ID Token.
    },
    onError: () => setError("Google girişi başarısız oldu."),
  });

  // Kendi butonumuzla Google Login (Implicit Flow ile ID Token almak zor, o yüzden basit buton yapısı)
  // TAVSİYE: Tasarımı korumak için GoogleLogin bileşenini render edip opacity 0 ile butonun üzerine koyabiliriz.
  // Veya @react-oauth/google kütüphanesinin 'GoogleLogin' bileşenini kullanırız.

  // API Girişi
const handleLogin = async () => {
  setLoading(true);
  setError("");
  
  const result = await loginUser(email, password);
  
  if (result.success) {
    // loginUser zaten localStorage'a role kaydetti
    // Sadece role'a göre yönlendir
    const role = localStorage.getItem('user_role');
    
    if (role === 'rejimde_pro') {
      router.push("/dashboard/pro");
    } else {
      router.push("/dashboard");
    }
  } else {
    setError(result. message || "Kullanıcı adı veya şifre hatalı!");
    setLoading(false);
  }
};
  
  // Google Wrapper Fonksiyonu
  const handleGoogleSuccess = async (credentialResponse: any) => {
      setLoading(true);
      if (credentialResponse.credential) {
          const result = await loginWithGoogle(credentialResponse.credential);
          if (result.success) {
              router.push("/dashboard");
          } else {
              setError(result.message);
              setLoading(false);
          }
      }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-rejimde-text bg-[#f7f7f7]">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 h-16 flex items-center justify-center relative shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
            <i className="fa-solid fa-leaf text-rejimde-green text-2xl group-hover:rotate-12 transition"></i>
            <span className="text-2xl font-extrabold text-rejimde-green tracking-tight">rejimde</span>
        </Link>
        <Link href="/" className="absolute left-4 text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-2xl"></i>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        <div className="w-full text-center animate-fadeIn">
            
            <div className="flex justify-center mb-6">
                <MascotDisplay state="onboarding_welcome" size={150} showBubble={false} />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black text-gray-700 mb-2">Tekrar Hoş Geldin!</h1>
            
            {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                
                {/* Google Login Button - Özel Tasarım İçine Gömülü */}
                <div className="relative w-full">
                    {/* Görünmez Orijinal Buton */}
                    <div className="absolute inset-0 opacity-0 z-10 cursor-pointer overflow-hidden">
                        <div id="google-login-btn-container"></div>
                         {/* Bu kısım client-side render edilmeli, aşağıda script ile hallediyoruz 
                             veya react-oauth/google GoogleLogin bileşenini kullanıyoruz */}
                             
                         {/* En temiz yöntem: GoogleLogin bileşenini kullanıp, type='icon' yapıp gizlemek */}
                         {/* Ancak o bileşen tam özelleştirilemiyor. */}
                         {/* ÇÖZÜM: GoogleLogin bileşenini render edip style ile gizliyoruz ve bizim butonun üzerine koyuyoruz */}
                         
                         <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.01 }}>
                             <iframe src="about:blank" className="w-full h-full" /> 
                             {/* Not: Tam özelleştirme için useGoogleLogin ile 'implicit' flow kullanıp access_token almak ve backend'i ona göre güncellemek gerekir. 
                                 Ama backend kodumuz id_token bekliyor.
                                 Bu yüzden Google'ın kendi bileşenini (GoogleLogin) görünür kullanmak en garantisi. */}
                         </div>
                    </div>

                    {/* Bizim Tasarım Butonumuz (Şimdilik GoogleLogin bileşenini direkt kullanalım, tasarım bütünlüğü için CSS ile oynayacağız) */}
                    {/* DÜZELTME: GoogleLogin bileşenini direkt kullanıyoruz */}
                    <div className="flex justify-center">
                        <div className="w-full">
                             {/* Buraya GoogleLogin bileşenini import edip koyacağız, 
                                 ama import'u en üstte yaptık, şimdi burada kullanalım */}
                             {/* Not: Bu dosyada GoogleLogin import edilmedi, hemen aşağıda dinamik import veya direkt kullanım yapalım */}
                        </div>
                    </div>
                </div>

                {/* BASİT VE ÇALIŞAN ÇÖZÜM: */}
                {/* GoogleLogin bileşenini direkt import edip kullanalım */}
                <div className="flex justify-center w-full">
                    <div className="w-full">
                         {/* Bu butonu özelleştirmek zor olduğu için kütüphanenin bileşenini kullanıyoruz */}
                         <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={() => setError("Hata oluştu")} />
                    </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                    <div className="h-0.5 bg-gray-200 flex-1"></div>
                    <span className="text-gray-400 text-xs font-bold uppercase">veya e-posta ile</span>
                    <div className="h-0.5 bg-gray-200 flex-1"></div>
                </div>

                <div className="space-y-3">
                    <input 
                        type="text"
                        placeholder="Kullanıcı Adı veya E-posta" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold text-gray-600 outline-none transition" 
                    />
                    <input 
                        type="password" 
                        placeholder="Şifre" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold text-gray-600 outline-none transition" 
                    />
                </div>
                
                <div className="text-right">
                    <Link href="/forgot-password" className="text-xs font-bold text-gray-400 hover:text-rejimde-blue transition">Şifreni mi unuttun?</Link>
                </div>

                <button 
                    onClick={handleLogin}
                    disabled={loading}
                    className="block w-full bg-rejimde-blue text-white py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-blueDark btn-game uppercase tracking-wide mt-2 text-center disabled:opacity-50"
                >
                    {loading ? "Giriş Yapılıyor..." : "GİRİŞ YAP"}
                </button>
            </div>
            
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
                <p className="text-gray-400 font-bold text-sm">
                    Hesabın yok mu? <Link href="/register" className="text-rejimde-green font-extrabold hover:underline uppercase">Kayıt Ol</Link>
                </p>
            </div>
        </div>
      </main>
    </div>
  );
}

// Yardımcı Bileşen: Google Login Butonu
import { GoogleLogin } from '@react-oauth/google';

function GoogleLoginButton({ onSuccess, onError }: { onSuccess: (res: any) => void, onError: () => void }) {
    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
                theme="filled_blue"
                shape="pill"
                text="continue_with"
                width="300" // Genişlik ayarı
                logo_alignment="left"
            />
        </div>
    );
}