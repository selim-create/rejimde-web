"use client";

import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";

export default function RegisterHubPage() {
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        
        <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4">Aramıza Nasıl Katılacaksın?</h1>
            <p className="text-gray-500 font-bold text-lg">Senin için en uygun yolu seç ve maceraya başla.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            
            {/* USER CARD */}
            <Link href="/register/user" className="bg-white border-2 border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-card hover:border-rejimde-green hover:shadow-lg hover:-translate-y-2 transition group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition"></div>
                
                <div className="w-24 h-24 mb-6 relative">
                     <MascotDisplay state="onboarding_welcome" size={120} showBubble={false} />
                </div>
                
                <h2 className="text-2xl font-black text-gray-800 mb-2 group-hover:text-rejimde-green transition">Kişisel Hesap</h2>
                <p className="text-gray-500 font-bold text-sm mb-6 leading-relaxed">
                    Kilo vermek, spor yapmak veya sağlıklı yaşamak istiyorum. Rejimde Skoru ve Klanlar seni bekliyor!
                </p>
                
                <span className="bg-rejimde-green text-white px-8 py-3 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide">
                    Hemen Başla
                </span>
            </Link>

            {/* PRO CARD */}
            <Link href="/register/pro" className="bg-white border-2 border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-card hover:border-rejimde-blue hover:shadow-lg hover:-translate-y-2 transition group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition"></div>
                
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-rejimde-blue text-5xl mb-6 group-hover:scale-110 transition">
                    <i className="fa-solid fa-briefcase"></i>
                </div>
                
                <h2 className="text-2xl font-black text-gray-800 mb-2 group-hover:text-rejimde-blue transition">Uzman Hesabı</h2>
                <p className="text-gray-500 font-bold text-sm mb-6 leading-relaxed">
                    Diyetisyenim, antrenörüm veya koçum. Danışanlarımı yönetmek ve yeni müşteriler bulmak istiyorum.
                </p>
                
                <span className="bg-rejimde-blue text-white px-8 py-3 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-blueDark btn-game uppercase tracking-wide">
                    Başvuru Yap
                </span>
            </Link>

        </div>

        <div className="mt-12 text-center">
            <p className="text-gray-400 font-bold text-sm">
                Zaten hesabın var mı? <Link href="/login" className="text-rejimde-text hover:underline font-black">Giriş Yap</Link>
            </p>
        </div>

      </main>
    </div>
  );
}
