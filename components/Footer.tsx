import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 pt-16 pb-8 border-t-2 border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Col 1: Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="relative">
                <i className="fa-solid fa-leaf text-rejimde-green text-3xl group-hover:rotate-12 transition transform duration-300"></i>
              </div>
              <span className="text-3xl font-extrabold text-rejimde-text tracking-tight">rejimde</span>
            </Link>
            <p className="text-gray-500 font-bold text-sm leading-relaxed mb-6">
              Türkiye'nin ilk sosyal sağlık ve performans platformu. Rejimde Skoru ile sağlığını oyunlaştır, klanınla birlikte başar.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sistem Durumu: Aktif
            </div>
          </div>
          
          {/* Col 2: Platform */}
          <div>
            <h5 className="font-extrabold text-gray-700 uppercase tracking-wide text-sm mb-4">Platform</h5>
            <ul className="space-y-3">
              <li><Link href="/calculators" className="text-gray-500 font-bold hover:text-rejimde-blue transition block hover:translate-x-1 duration-200">Hesaplamalar</Link></li>
              <li><Link href="/leagues" className="text-gray-500 font-bold hover:text-rejimde-yellowDark transition block hover:translate-x-1 duration-200">Rejimde Ligi <span className="text-[10px] bg-red-100 text-red-500 px-1.5 rounded ml-1">HOT</span></Link></li>
              <li><Link href="/experts" className="text-gray-500 font-bold hover:text-rejimde-green transition block hover:translate-x-1 duration-200">Uzmanlar</Link></li>
              <li><Link href="/blog" className="text-gray-500 font-bold hover:text-rejimde-purple transition block hover:translate-x-1 duration-200">Blog</Link></li>
            </ul>
          </div>

          {/* Col 3: Kurumsal */}
          <div>
            <h5 className="font-extrabold text-gray-700 uppercase tracking-wide text-sm mb-4">Kurumsal</h5>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-500 font-bold hover:text-rejimde-blue transition block hover:translate-x-1 duration-200">Hakkımızda</Link></li>
              {/* DÜZELTİLDİ: /pro-register -> /register/pro */}
              <li><Link href="/register/pro" className="text-gray-500 font-bold hover:text-rejimde-blue transition block hover:translate-x-1 duration-200">Uzman Başvurusu</Link></li>
              <li><Link href="/contact" className="text-gray-500 font-bold hover:text-rejimde-blue transition block hover:translate-x-1 duration-200">İletişim</Link></li>
              <li><Link href="/privacy" className="text-gray-500 font-bold hover:text-rejimde-blue transition block hover:translate-x-1 duration-200">KVKK ve Gizlilik</Link></li>
            </ul>
          </div>

          {/* Col 4: Download */}
          <div>
            <h5 className="font-extrabold text-gray-700 uppercase tracking-wide text-sm mb-4">Uygulamayı İndir</h5>
            <div className="flex flex-col gap-3">
              <button className="bg-gray-800 text-white px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-black transition shadow-btn shadow-gray-900 btn-game w-full sm:w-auto justify-center sm:justify-start group">
                <i className="fa-brands fa-apple text-2xl group-hover:scale-110 transition"></i>
                <div className="text-left">
                  <div className="leading-none text-[10px] font-bold opacity-70">Download on the</div>
                  <div className="font-extrabold text-sm leading-none">App Store</div>
                </div>
              </button>
              <button className="bg-gray-800 text-white px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-black transition shadow-btn shadow-gray-900 btn-game w-full sm:w-auto justify-center sm:justify-start group">
                <i className="fa-brands fa-google-play text-2xl group-hover:scale-110 transition"></i>
                <div className="text-left">
                  <div className="leading-none text-[10px] font-bold opacity-70">GET IT ON</div>
                  <div className="font-extrabold text-sm leading-none">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t-2 border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 font-bold text-xs text-center md:text-left leading-relaxed">
            Copyright © 2025 Rejimde bir <a href="https://hipmedya.com" target="_blank" className="text-rejimde-blue hover:underline font-black">Hip Medya</a> markasıdır. <br />
            Tüm Hakları Saklıdır. İçerikler kaynak gösterilmeden paylaşılamaz.
          </div>
          
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-rejimde-blue hover:border-rejimde-blue transition shadow-btn shadow-gray-200 btn-game">
              <i className="fa-brands fa-twitter text-lg"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-rejimde-purple hover:border-rejimde-purple transition shadow-btn shadow-gray-200 btn-game">
              <i className="fa-brands fa-instagram text-lg"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-rejimde-red hover:border-rejimde-red transition shadow-btn shadow-gray-200 btn-game">
              <i className="fa-brands fa-youtube text-lg"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-700 hover:border-blue-700 transition shadow-btn shadow-gray-200 btn-game">
              <i className="fa-brands fa-linkedin text-lg"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}