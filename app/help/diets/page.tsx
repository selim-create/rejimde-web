import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Diyet Takibi Rehberi',
  description: 'Diyet programına başlama, öğün işaretleme, ilerleme takibi ve puan kazanma.',
};

export default function DietsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Diyet Takibi' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle title="Diyet Takibi Rehberi" description="Diyet programlarını nasıl kullanırsın? Öğün takibi, puan kazanma ve ilerleme raporları." lastUpdated="8 Ocak 2026">
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Diyet Programına Nasıl Başlarım?</h2>
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Diyetler Sayfasına Git</h3><p className="text-sm text-gray-600 font-bold">Menüden "Diyetler" sekmesini seç.</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Uygun Programı Seç</h3><p className="text-sm text-gray-600 font-bold">Hedefine ve beslenme tercihine uygun diyeti bul.</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div><h3 className="font-black text-gray-800 mb-1">"Başla" Butonuna Tıkla</h3><p className="text-sm text-gray-600 font-bold">Programa hemen başlarsın!</p></div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Öğün Nasıl İşaretlenir?</h2>
                <p className="mb-4">Her öğünü tamamladıkça dashboard'dan işaretle:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i><span className="font-bold text-gray-700">Sabah kahvaltısı, öğle yemeği, akşam yemeği ve ara öğünler için ayrı butonlar var</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i><span className="font-bold text-gray-700">Her işaretleme anında puan kazanırsın</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i><span className="font-bold text-gray-700">Günlük tüm öğünleri tamamladığında bonus puan!</span></li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Puan Kazanma</h2>
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                  <h3 className="font-black text-green-700 mb-3">Diyet Puanları:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-between"><span className="font-bold text-gray-700">Her öğün tamamlama</span><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black">+10 Puan</span></li>
                    <li className="flex items-center justify-between"><span className="font-bold text-gray-700">Günlük program tamamlama</span><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black">+50 Puan</span></li>
                    <li className="flex items-center justify-between"><span className="font-bold text-gray-700">7 gün üst üste tamamlama</span><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black">+100 Puan</span></li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2">🥗 Sağlıklı Beslen, Puan Kazan!</h3>
                  <p className="font-bold opacity-90">Her öğün, hedefine bir adım daha yaklaştırır.</p>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Egzersiz Takibi', href: '/help/exercises', icon: 'fa-solid fa-dumbbell' },
              { title: 'Puan Sistemi', href: '/help/score-system', icon: 'fa-solid fa-star' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
