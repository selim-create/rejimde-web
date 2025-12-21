"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
// Varsayılan (Yedek) konfigürasyonu alıyoruz
import { MASCOT_CONFIG, MascotState } from "@/lib/mascot-config";

interface MascotDisplayProps {
  state: MascotState; // Hangi durumda olduğunu belirtir
  size?: number;      // Boyut (piksel)
  showBubble?: boolean; // Konuşma balonu gösterilsin mi?
  className?: string; // Ekstra CSS sınıfları
}

export default function MascotDisplay({ 
  state, 
  size = 200, 
  showBubble = true,
  className = "" 
}: MascotDisplayProps) {
  
  // 1. Config State'i: Başlangıçta statik dosyayı kullanır, API'den gelince güncellenir.
  const [config, setConfig] = useState(MASCOT_CONFIG);
  
  // Görsel ve Metin State'leri
  const [asset, setAsset] = useState(MASCOT_CONFIG.states[state].assets[0]);
  const [text, setText] = useState(MASCOT_CONFIG.states[state].texts[0]);
  const [imageError, setImageError] = useState(false);

  // 2. Backend'den Güncel Config'i Çek (Sadece component ilk yüklendiğinde)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Buradaki URL, WordPress API adresiniz olmalı (Production'da .env'den gelir)
        // Örn: http://localhost/wp-json/rejimde/v1/mascot/config
        // Şimdilik yerel geliştirme için varsayılan bir yol bırakıyoruz, bunu .env dosyanızda tanımlamalısınız:
        const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL 
          ? `${process.env.NEXT_PUBLIC_WP_API_URL}/rejimde/v1/mascot/config`
          : 'http://localhost:8000/wp-json/rejimde/v1/mascot/config'; // Varsayılan WP Localhost

        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          // Gelen veri bizim beklediğimiz formatta mı diye basit bir kontrol
          if (data && data.states) {
            setConfig(data); // Backend verisiyle state'i güncelle
          }
        }
      } catch (error) {
        // Hata olursa sessizce statik config'i kullanmaya devam et
        console.warn("Maskot API'ye ulaşılamadı, varsayılan ayarlar kullanılıyor.");
      }
    };

    fetchConfig();
  }, []);

  // 3. Config veya State değiştiğinde rastgele içerik seç
  useEffect(() => {
    // Config içinden o anki durumu (state) bul
    // Eğer backend'den gelen config'de bu state silinmişse, varsayılanı kullan (Güvenlik)
    const currentState = config.states[state] || MASCOT_CONFIG.states[state];
    
    if (currentState) {
      const randomAssetIndex = Math.floor(Math.random() * currentState.assets.length);
      const randomTextIndex = Math.floor(Math.random() * currentState.texts.length);
      
      setAsset(currentState.assets[randomAssetIndex]);
      setText(currentState.texts[randomTextIndex]);
    }
  }, [state, config]); // Config değişince (API'den gelince) de tetiklenir

  // Görsel yolu (Public klasörü altındaki yol)
  const imageSrc = `/assets/mascots/${asset.file}`;
  
  // Yedek görsel (Eğer asıl dosya bulunamazsa)
  const fallbackSrc = `https://placehold.co/${size}x${size}/58cc02/ffffff?text=${state}`;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      
      {/* Konuşma Balonu */}
      {showBubble && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 md:translate-x-10 z-10 w-48 animate-bounce-slow">
          <div className="bg-white border-2 border-gray-200 p-4 rounded-3xl rounded-bl-none shadow-sm relative">
            <p className="font-bold text-rejimde-text text-sm leading-snug">
              {text}
            </p>
            {/* Balonun oku */}
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-200 transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Maskot Görseli */}
      <div className={`relative animate-wiggle`} style={{ width: size, height: size }}>
        <Image
          src={imageError ? fallbackSrc : imageSrc}
          alt={asset.alt || "Maskot"}
          width={size}
          height={size}
          className="object-contain drop-shadow-xl"
          onError={() => setImageError(true)}
          priority
        />
      </div>
    </div>
  );
}