"use client";

import { useState } from "react";
import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Burada normalde API isteği atılır
    if (email) {
      setIsSent(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-rejimde-text bg-[#f7f7f7]">

      {/* Header (Minimal) */}
      <header className="bg-white border-b-2 border-gray-200 h-16 flex items-center justify-center relative shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
            <i className="fa-solid fa-leaf text-rejimde-green text-2xl group-hover:rotate-12 transition"></i>
            <span className="text-2xl font-extrabold text-rejimde-green tracking-tight">rejimde</span>
        </Link>
        <Link href="/login" className="absolute left-4 text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-arrow-left text-2xl"></i>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">

        <div className="w-full text-center animate-fadeIn">
            
            {/* Mascot State based on logic */}
            <div className="flex justify-center mb-6">
                <MascotDisplay 
                    state={isSent ? "success_milestone" : "water_reminder"} // Başarılıysa mutlu, değilse yardımcı mod
                    size={150} 
                    showBubble={false} 
                />
            </div>
            
            {isSent ? (
                /* SUCCESS STATE */
                <div className="bg-green-50 border-2 border-green-100 rounded-3xl p-8 shadow-sm">
                    <h1 className="text-2xl font-black text-rejimde-green mb-2">E-posta Gönderildi! 📨</h1>
                    <p className="text-gray-500 font-bold mb-6 text-sm">
                        <span className="text-gray-800">{email}</span> adresine sıfırlama bağlantısını gönderdik. Lütfen gelen kutunu (ve spam klasörünü) kontrol et.
                    </p>
                    <Link href="/login" className="block w-full bg-rejimde-green text-white py-3 rounded-xl font-extrabold shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide">
                        Giriş Yap'a Dön
                    </Link>
                    <button onClick={() => setIsSent(false)} className="mt-4 text-xs font-bold text-gray-400 hover:text-rejimde-blue underline">
                        Tekrar dene
                    </button>
                </div>
            ) : (
                /* FORM STATE */
                <>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-700 mb-2">Şifreni mi Unuttun?</h1>
                    <p className="text-gray-400 font-bold mb-8 text-sm">
                        Endişelenme, e-posta adresini gir, sana yeni bir şifre oluşturman için bağlantı gönderelim.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="text-left">
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1">E-posta Adresin</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@email.com" 
                                className="w-full bg-white border-2 border-gray-200 focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold text-gray-600 outline-none transition" 
                            />
                        </div>

                        <button type="submit" className="w-full bg-rejimde-blue text-white py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-blueDark btn-game uppercase tracking-wide">
                            Bağlantı Gönder
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-gray-100">
                        <Link href="/login" className="text-gray-400 font-bold text-sm hover:text-rejimde-blue transition">
                            Giriş Yap'a Dön
                        </Link>
                    </div>
                </>
            )}
        </div>

      </main>
    </div>
  );
}