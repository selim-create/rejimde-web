import Link from "next/link";
import Logo from "@/components/Logo";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-gray-200 bg-[#f7f7f7]">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <NewsletterForm
          source="rejimde_footer"
          variant="horizontal"
          title="İyi yaşamı haftalık rutine dönüştür."
          description="Beslenme, hareket ve iyi yaşam için seçilmiş içerikler tek e-postada."
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-10 border-t-2 border-gray-200 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-5 inline-block focus:outline-none">
              <Logo showText={true} />
            </Link>
            <p className="max-w-sm text-sm font-bold leading-relaxed text-gray-500">
              Sağlıklı yaşamı takip etmeyi kolaylaştıran sosyal sağlık ve performans platformu.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[11px] font-black text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Sistem aktif
            </div>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-gray-400">Platform</h5>
            <ul className="space-y-3">
              <li><Link href="/calculators" className="font-bold text-gray-600 transition hover:text-rejimde-blue">Hesaplamalar</Link></li>
              <li><Link href="/levels" className="font-bold text-gray-600 transition hover:text-rejimde-yellowDark">Rejimde Levels</Link></li>
              <li><Link href="/experts" className="font-bold text-gray-600 transition hover:text-rejimde-green">Uzmanlar</Link></li>
              <li><Link href="/blog" className="font-bold text-gray-600 transition hover:text-rejimde-purple">Blog</Link></li>
              <li><Link href="/diets" className="font-bold text-gray-600 transition hover:text-rejimde-green">Diyetler</Link></li>
              <li><Link href="/exercises" className="font-bold text-gray-600 transition hover:text-rejimde-blue">Egzersizler</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-gray-400">Rejimde</h5>
            <ul className="space-y-3">
              <li><Link href="/about" className="font-bold text-gray-600 transition hover:text-rejimde-blue">Hakkımızda</Link></li>
              <li><Link href="/help" className="font-bold text-gray-600 transition hover:text-rejimde-blue">Yardım & Destek</Link></li>
              <li><Link href="/register/pro" className="font-bold text-gray-600 transition hover:text-rejimde-blue">Uzman Başvurusu</Link></li>
              <li><Link href="/contact" className="font-bold text-gray-600 transition hover:text-rejimde-blue">İletişim</Link></li>
              <li><Link href="/privacy" className="font-bold text-gray-600 transition hover:text-rejimde-blue">KVKK ve Gizlilik</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-gray-400">Uygulamayı indir</h5>
            <div className="space-y-3">
              <button className="flex w-full items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-white transition hover:bg-black">
                <i className="fa-brands fa-apple text-2xl"></i>
                <div className="text-left"><div className="text-[9px] font-bold uppercase opacity-60">Download on the</div><div className="text-sm font-black">App Store</div></div>
              </button>
              <button className="flex w-full items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-white transition hover:bg-black">
                <i className="fa-brands fa-google-play text-xl"></i>
                <div className="text-left"><div className="text-[9px] font-bold uppercase opacity-60">Get it on</div><div className="text-sm font-black">Google Play</div></div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 border-t-2 border-gray-200 py-7 md:flex-row">
          <p className="text-center text-xs font-bold leading-relaxed text-gray-400 md:text-left">
            © 2026 Rejimde · Bir <a href="https://hipmedya.com" target="_blank" rel="noreferrer" className="font-black text-rejimde-blue hover:underline">Hip Medya</a> markasıdır. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-2">
            <a href="#" aria-label="X" className="grid h-10 w-10 place-items-center rounded-xl border-2 border-gray-200 bg-white text-gray-400 transition hover:border-rejimde-blue hover:bg-rejimde-blue hover:text-white"><i className="fa-brands fa-twitter"></i></a>
            <a href="#" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-xl border-2 border-gray-200 bg-white text-gray-400 transition hover:border-rejimde-purple hover:bg-rejimde-purple hover:text-white"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="YouTube" className="grid h-10 w-10 place-items-center rounded-xl border-2 border-gray-200 bg-white text-gray-400 transition hover:border-rejimde-red hover:bg-rejimde-red hover:text-white"><i className="fa-brands fa-youtube"></i></a>
            <a href="#" aria-label="LinkedIn" className="grid h-10 w-10 place-items-center rounded-xl border-2 border-gray-200 bg-white text-gray-400 transition hover:border-blue-700 hover:bg-blue-700 hover:text-white"><i className="fa-brands fa-linkedin"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
