import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Egzersiz Takibi Rehberi',
  description: 'Egzersiz programına başlama, hareket tamamlama ve timer kullanımı.',
};

export default function ExercisesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Egzersiz Takibi' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle title="Egzersiz Takibi Rehberi" description="Egzersiz programlarını nasıl takip edersin? Hareket tamamlama, timer ve puan kazanma." lastUpdated="8 Ocak 2026">
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Egzersiz Programına Nasıl Başlarım?</h2>
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-red-100 text-red-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Egzersizler Sayfasına Git</h3><p className="text-sm text-gray-600 font-bold">Menüden "Egzersizler" sekmesini seç.</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-red-100 text-red-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Seviyene Uygun Programı Seç</h3><p className="text-sm text-gray-600 font-bold">Başlangıç, orta veya ileri seviye programlar mevcut.</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-red-100 text-red-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Program Detaylarını İncele</h3><p className="text-sm text-gray-600 font-bold">Hareketleri, süreyi ve zorluk seviyesini gör.</p></div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Timer Nasıl Kullanılır?</h2>
                <p className="mb-4">Egzersiz yaparken yerleşik timer'ı kullanabilirsin:</p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-blue-500 mt-1"></i><span className="font-bold text-gray-700">Her hareket için önerilen süre görünür</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-blue-500 mt-1"></i><span className="font-bold text-gray-700">"Başla" butonuyla geri sayım başlar</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-blue-500 mt-1"></i><span className="font-bold text-gray-700">Süre bittiğinde sesli uyarı alırsın</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-blue-500 mt-1"></i><span className="font-bold text-gray-700">Hareketi tamamla ve sonrakine geç</span></li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Puan Kazanma</h2>
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                  <h3 className="font-black text-red-700 mb-3">Egzersiz Puanları:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-between"><span className="font-bold text-gray-700">Her hareket tamamlama</span><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-black">+5 Puan</span></li>
                    <li className="flex items-center justify-between"><span className="font-bold text-gray-700">Günlük program tamamlama</span><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-black">+40 Puan</span></li>
                    <li className="flex items-center justify-between"><span className="font-bold text-gray-700">7 gün üst üste tamamlama</span><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-black">+150 Puan</span></li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2">💪 Hareket Et, Güçlen!</h3>
                  <p className="font-bold opacity-90">Her egzersiz, daha güçlü bir seni inşa ediyor.</p>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Diyet Takibi', href: '/help/diets', icon: 'fa-solid fa-carrot' },
              { title: 'Puan Sistemi', href: '/help/score-system', icon: 'fa-solid fa-star' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
