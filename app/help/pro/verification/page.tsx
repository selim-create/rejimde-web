import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Onaylı Uzman Olma',
  description: 'Onaylı uzman olmanın gereksinimleri, sertifika süreci ve avantajları.',
};

export default function ProVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Onaylı Uzman Olma' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle title="Onaylı Uzman Olma" description="Onaylı uzman rozeti al, öne çık ve bonus puan kazan!" lastUpdated="8 Ocak 2026">
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Onaylı Uzman Nedir?</h2>
                <p className="mb-4">
                  Onaylı Uzman, sertifikalarını ve kimlik bilgilerini doğrulayan, platformda özel ayrıcalıklara sahip profesyonel sağlık uzmanlarıdır.
                </p>
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-purple-300 rounded-2xl p-6 text-center">
                  <div className="text-6xl mb-3">✅</div>
                  <h3 className="text-2xl font-black text-purple-700 mb-2">Onaylı Uzman Rozeti</h3>
                  <p className="text-sm font-bold text-gray-600">Profilinde ve arama sonuçlarında görünür</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Gereksinimler</h2>
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-id-card text-blue-500"></i>
                      Kimlik Doğrulama
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">TC Kimlik veya pasaport fotoğrafı yükle</p>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-graduation-cap text-purple-500"></i>
                      Sertifikalar
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">Diyetisyen, antrenör veya sağlık uzmanlığı sertifikası</p>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-building text-green-500"></i>
                      İş Yeri Belgesi (Opsiyonel)
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">Klinik veya spor salonu çalışanıysan belge ekle</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Doğrulama Süreci</h2>
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Başvuru Yap</h3><p className="text-sm text-gray-600 font-bold">Uzman Panelinden "Onaylı Uzman Ol" butonuna tıkla</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Belgeleri Yükle</h3><p className="text-sm text-gray-600 font-bold">Kimlik ve sertifika fotoğraflarını ekle</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div><h3 className="font-black text-gray-800 mb-1">İnceleme Bekle</h3><p className="text-sm text-gray-600 font-bold">Ekibimiz 2-5 iş günü içinde belgelerini inceler</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">4</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Onay Al</h3><p className="text-sm text-gray-600 font-bold">Onaylandığında rozet ve bonuslar aktif olur</p></div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Avantajlar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                    <i className="fa-solid fa-star text-2xl text-green-600 mb-2"></i>
                    <h3 className="font-black text-gray-800 mb-1">+20 Bonus Puan</h3>
                    <p className="text-xs text-gray-600 font-bold">Tek seferlik onay bonusu</p>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                    <i className="fa-solid fa-arrow-up text-2xl text-blue-600 mb-2"></i>
                    <h3 className="font-black text-gray-800 mb-1">Üst Sıralarda Görün</h3>
                    <p className="text-xs text-gray-600 font-bold">Arama sonuçlarında öncelik</p>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
                    <i className="fa-solid fa-badge-check text-2xl text-purple-600 mb-2"></i>
                    <h3 className="font-black text-gray-800 mb-1">Güven Rozeti</h3>
                    <p className="text-xs text-gray-600 font-bold">Profilinde özel rozet</p>
                  </div>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                    <i className="fa-solid fa-crown text-2xl text-yellow-600 mb-2"></i>
                    <h3 className="font-black text-gray-800 mb-1">Öne Çıkarılma</h3>
                    <p className="text-xs text-gray-600 font-bold">Featured Expert seçilme şansı</p>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-certificate"></i>
                    Profesyonelliğini Kanıtla!
                  </h3>
                  <p className="font-bold mb-4 opacity-90">Onaylı uzman rozeti, güvenilirliğinin simgesi.</p>
                  <a href="/dashboard/pro/verification" className="inline-block bg-white text-purple-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-purple-900 btn-game hover:bg-gray-100">
                    Hemen Başvur
                  </a>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Uzman Paneli', href: '/help/pro', icon: 'fa-solid fa-briefcase' },
              { title: 'Gelir Yönetimi', href: '/help/pro/earnings', icon: 'fa-solid fa-money-bill-wave' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
