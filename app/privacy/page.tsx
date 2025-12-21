"use client";

import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text bg-white">
      
      {/* Hero */}
      <div className="bg-rejimde-blue text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
            <div className="flex justify-center mb-6">
                <MascotDisplay state="idle_dashboard" size={150} showBubble={false} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4">Gizlilik ve KVKK</h1>
            <p className="text-blue-100 font-bold text-lg">
                Verileriniz bizimle güvende. Sadece sağlığınızı iyileştirmek için kullanıyoruz, asla başkalarıyla paylaşmıyoruz.
            </p>
            <p className="text-xs font-black text-blue-200 mt-4 uppercase tracking-widest">Son Güncelleme: 18 Aralık 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Content Box */}
        <div className="border-2 border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm space-y-12">
            
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-rejimde-blue text-xl">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-800">1. Veri Sorumlusu</h2>
                </div>
                <p className="text-gray-500 font-medium leading-relaxed">
                    6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu olarak <strong>Rejimde Teknoloji A.Ş.</strong> ("Şirket") tarafından aşağıda açıklanan kapsamda işlenebilecektir.
                </p>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-rejimde-green text-xl">
                        <i className="fa-solid fa-database"></i>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-800">2. Hangi Verileri Topluyoruz?</h2>
                </div>
                <p className="text-gray-500 font-medium leading-relaxed mb-4">
                    Size daha iyi bir deneyim sunmak ve "Rejimde Skoru"nuzu hesaplayabilmek için şu verileri topluyoruz:
                </p>
                <ul className="space-y-3">
                    <li className="flex gap-3 text-gray-600 font-bold text-sm">
                        <i className="fa-solid fa-check text-rejimde-green mt-1"></i>
                        <span><strong className="text-gray-800">Kimlik Bilgileri:</strong> Ad, soyad, kullanıcı adı.</span>
                    </li>
                    <li className="flex gap-3 text-gray-600 font-bold text-sm">
                        <i className="fa-solid fa-check text-rejimde-green mt-1"></i>
                        <span><strong className="text-gray-800">Sağlık Verileri:</strong> Kilo, boy, yaş, adım sayısı, su tüketimi (Bu veriler "Özel Nitelikli Veri" statüsündedir ve ekstra şifreleme ile saklanır).</span>
                    </li>
                    <li className="flex gap-3 text-gray-600 font-bold text-sm">
                        <i className="fa-solid fa-check text-rejimde-green mt-1"></i>
                        <span><strong className="text-gray-800">İletişim Bilgileri:</strong> E-posta adresi, telefon numarası (sadece uzman başvuruları için).</span>
                    </li>
                </ul>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-rejimde-purple text-xl">
                        <i className="fa-solid fa-user-lock"></i>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-800">3. Verilerinizi Nasıl Koruyoruz?</h2>
                </div>
                <p className="text-gray-500 font-medium leading-relaxed">
                    Verileriniz, endüstri standardı olan <strong>256-bit SSL şifreleme</strong> ile korunmaktadır. Sağlık verileriniz, veritabanımızda "anonimleştirilmiş" ID'ler ile saklanır ve açık rızanız olmadan üçüncü taraflarla (reklam verenler dahil) paylaşılmaz.
                </p>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-rejimde-yellowDark text-xl">
                        <i className="fa-solid fa-cookie-bite"></i>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-800">4. Çerez Politikası</h2>
                </div>
                <p className="text-gray-500 font-medium leading-relaxed">
                    Sitemizde gezinirken deneyiminizi iyileştirmek ve oturumunuzu açık tutmak için çerezler (cookies) kullanıyoruz. Rejimde Skoru'nuzun doğru hesaplanması için "yerel depolama" teknolojisinden faydalanıyoruz.
                </p>
            </section>

            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 text-center">
                <p className="font-bold text-gray-600 mb-4">
                    KVKK kapsamındaki haklarınızla ilgili detaylı bilgi almak veya verilerinizi sildirmek için:
                </p>
                <a href="mailto:kvkk@rejimde.com" className="bg-white border-2 border-gray-200 px-6 py-3 rounded-xl font-extrabold text-gray-700 shadow-btn shadow-gray-200 btn-game hover:border-rejimde-blue hover:text-rejimde-blue transition inline-flex items-center gap-2">
                    <i className="fa-solid fa-envelope"></i> kvkk@rejimde.com
                </a>
            </div>

        </div>

      </div>
    </div>
  );
}