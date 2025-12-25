"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Yükleme senaryoları (Görsel + Metin)
const LOADING_SCENARIOS = [
  {
    image: "/assets/mascots/mascot_running_sweatband.png",
    text: "Kaloriler yakılıyor, sayfa yükleniyor...",
    animation: "animate-bounce-slow"
  },
  {
    image: "/assets/mascots/mascot_lifting_dumbbell.png",
    text: "Veriler ağırlık çalışıyor, birazdan hazır! 💪",
    animation: "animate-pulse"
  },
  {
    image: "/assets/mascots/mascot_sipping_tea.png",
    text: "Sen bir çay koy, biz sayfayı hazırlıyoruz... ☕",
    animation: "animate-wiggle"
  },
  {
    image: "/assets/mascots/mascot_meditating.png",
    text: "Derin bir nefes al... Veriler huzurla yükleniyor.",
    animation: "animate-float"
  },
  {
    image: "/assets/mascots/mascot_holding_trophy.png",
    text: "Neredeyse bitti şampiyon! 🏆",
    animation: "animate-bounce"
  }
];

export default function PageLoader() {
  const [scenario, setScenario] = useState(LOADING_SCENARIOS[0]);

  // Bileşen yüklendiğinde rastgele bir senaryo seç
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_SCENARIOS.length);
    setScenario(LOADING_SCENARIOS[randomIndex]);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-300">
      
      {/* Maskot */}
      <div className={`relative w-40 h-40 mb-6 ${scenario.animation}`}>
        <Image
          src={scenario.image}
          alt="Loading..."
          fill
          sizes="160px"
          className="object-contain drop-shadow-xl"
          priority
          onError={(e) => {
             // Görsel yoksa placeholder
             e.currentTarget.src = "https://placehold.co/200x200/58cc02/ffffff?text=Loading";
             e.currentTarget.srcset = ""; 
          }}
        />
      </div>

      {/* Metin */}
      <h2 className="text-xl font-extrabold text-rejimde-text text-center max-w-xs animate-pulse">
        {scenario.text}
      </h2>

      {/* Progress Bar (Görsel Süs) */}
      <div className="w-48 h-3 bg-gray-200 rounded-full mt-6 overflow-hidden border-2 border-gray-100">
        <div className="h-full bg-rejimde-green rounded-full animate-loading-bar w-full origin-left"></div>
      </div>

      {/* Özel Stil Animasyonları */}
      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite ease-in-out;
        }
        .animate-float {
            animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}