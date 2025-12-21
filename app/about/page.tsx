"use client";

import Image from "next/image";
import MascotDisplay from "@/components/MascotDisplay";

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      
      {/* Hero */}
      <div className="bg-white border-b-2 border-gray-200 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-black text-gray-800 mb-6">
                Sağlıklı Yaşamı <br />
                <span className="text-rejimde-green">Oyunlaştırdık</span>
            </h1>
            <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-2xl mx-auto">
                Rejimde.com, sıkıcı diyet listelerine ve yalnız yapılan sporlara bir başkaldırıdır. Biz, sağlığı bir takım oyunu haline getiriyoruz.
            </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Story Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
            <div className="w-full md:w-1/2">
                <div className="aspect-square bg-gray-100 rounded-3xl relative overflow-hidden shadow-card">
                    {/* Buraya ekip fotoğrafı veya ofis görseli gelebilir */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <i className="fa-solid fa-image text-6xl"></i>
                    </div>
                    {/* Mascot Overlay */}
                    <div className="absolute bottom-0 right-0">
                        <MascotDisplay state="onboarding_welcome" size={200} showBubble={false} />
                    </div>
                </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6">
                <h2 className="text-3xl font-extrabold text-gray-800">Neden Rejimde?</h2>
                <p className="text-gray-500 font-medium leading-relaxed">
                    Türkiye'de her yıl milyonlarca insan diyete başlıyor ama sadece %5'i sürdürebiliyor. Sorun iradesizlik değil, yöntem. 
                    <br/><br/>
                    Biz, <strong>"Yalnız zayıflanmaz, beraber başarılır"</strong> mottosuyla yola çıktık. Rejimde Skoru, Klanlar ve AI Co-Pilot teknolojimizle, sağlıklı yaşamı bir zorunluluktan çıkarıp keyifli bir statü oyununa dönüştürdük.
                </p>
            </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="bg-blue-50 p-6 rounded-3xl text-center border-2 border-blue-100">
                <div className="text-4xl font-black text-rejimde-blue mb-2">50k+</div>
                <div className="text-xs font-bold text-gray-400 uppercase">Mutlu Üye</div>
            </div>
            <div className="bg-green-50 p-6 rounded-3xl text-center border-2 border-green-100">
                <div className="text-4xl font-black text-rejimde-green mb-2">1200</div>
                <div className="text-xs font-bold text-gray-400 uppercase">Onaylı Uzman</div>
            </div>
            <div className="bg-yellow-50 p-6 rounded-3xl text-center border-2 border-yellow-100">
                <div className="text-4xl font-black text-rejimde-yellowDark mb-2">500k</div>
                <div className="text-xs font-bold text-gray-400 uppercase">Verilen Kilo</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-3xl text-center border-2 border-purple-100">
                <div className="text-4xl font-black text-rejimde-purple mb-2">4.9</div>
                <div className="text-xs font-bold text-gray-400 uppercase">App Store Puanı</div>
            </div>
        </div>

        {/* Values */}
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Değerlerimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:border-rejimde-green transition cursor-default">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-rejimde-green text-3xl mx-auto mb-4">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <h3 className="font-extrabold text-gray-800 mb-2">Topluluk Odaklı</h3>
                    <p className="text-sm font-bold text-gray-400">Gücümüzü birbirimizden alıyoruz. Kimseyi geride bırakmıyoruz.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:border-rejimde-blue transition cursor-default">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-rejimde-blue text-3xl mx-auto mb-4">
                        <i className="fa-solid fa-flask"></i>
                    </div>
                    <h3 className="font-extrabold text-gray-800 mb-2">Bilimsel Temel</h3>
                    <p className="text-sm font-bold text-gray-400">Hurafelerle değil, kanıtlanmış bilimsel verilerle hareket ediyoruz.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:border-rejimde-yellow transition cursor-default">
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-rejimde-yellowDark text-3xl mx-auto mb-4">
                        <i className="fa-solid fa-face-smile"></i>
                    </div>
                    <h3 className="font-extrabold text-gray-800 mb-2">Eğlence</h3>
                    <p className="text-sm font-bold text-gray-400">Sıkıcı olan sürdürülemez. Sağlıklı yaşamı eğlenceli kılıyoruz.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}