import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Uzmanlarla Çalışma Rehberi',
  description: 'Uzman bulma, hizmet satın alma, özel plan alma ve onaylı danışan olma.',
};

export default function ExpertsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzmanlarla Çalışma' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle title="Uzmanlarla Çalışma Rehberi" description="Diyetisyen veya spor eğitmeniyle çalışarak hedefine daha hızlı ulaş!" lastUpdated="8 Ocak 2026">
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Uzman Nasıl Bulunur?</h2>
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Uzmanlar Sayfasına Git</h3><p className="text-sm text-gray-600 font-bold">Menüden "Uzmanlar" sekmesini seç.</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Filtrele ve Ara</h3><p className="text-sm text-gray-600 font-bold">Uzmanlık alanı, konum veya fiyat bazında filtrele.</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Uzman Profilini İncele</h3><p className="text-sm text-gray-600 font-bold">Yorumları, sertifikaları ve hizmetleri gör.</p></div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Hizmet Nasıl Satın Alınır?</h2>
                <p className="mb-4">Uzmanın sunduğu hizmet paketlerinden birini seç:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i><span className="font-bold text-gray-700">Tek seferlik danışmanlık</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i><span className="font-bold text-gray-700">Aylık takip programı</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i><span className="font-bold text-gray-700">Özel diyet/egzersiz planı</span></li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Onaylı Danışan Olma</h2>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
                  <h3 className="font-black text-purple-700 mb-2">Avantajlar:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Uzmanın özel görevlerini alırsın</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Kişiselleştirilmiş plan ve takip</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Ekstra puan bonusları</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Öncelikli destek</span></li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2">👨‍⚕️ Uzmanla Daha Hızlı İlerle!</h3>
                  <p className="font-bold opacity-90">Profesyonel rehberlik, başarı oranını katlar.</p>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Uzman (Pro) Rehberi', href: '/help/pro', icon: 'fa-solid fa-briefcase' },
              { title: 'Başlangıç Rehberi', href: '/help/getting-started', icon: 'fa-solid fa-rocket' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
