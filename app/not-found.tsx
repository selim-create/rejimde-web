"use client";

import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f7f7] text-rejimde-text p-4 text-center">
      
      {/* Mascot: Shocked/Confused */}
      <div className="mb-8 animate-wiggle">
        <MascotDisplay 
            state="cheat_meal_detected" // Şaşkın ifade için bu durumu kullanıyoruz
            size={250} 
            showBubble={false} 
        />
      </div>

      <h1 className="text-6xl font-black text-rejimde-green mb-2 tracking-tighter">404</h1>
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-700 mb-4">
        Oops! Yanlış yola saptın şampiyon.
      </h2>
      <p className="text-gray-500 font-bold mb-8 max-w-md mx-auto leading-relaxed">
        Aradığın sayfa rejimi bozmuş ve ortadan kaybolmuş olabilir. Biz en iyisi güvenli bölgeye dönelim.
      </p>

      <Link href="/" className="bg-rejimde-green text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide hover:bg-green-500 transition flex items-center gap-2">
        <i className="fa-solid fa-house"></i> Ana Sayfaya Dön
      </Link>

    </div>
  );
}