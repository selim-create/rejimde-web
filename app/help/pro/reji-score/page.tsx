import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Uzman RejiScore Sistemi',
  description: 'Uzman güvenilirlik puanı nasıl hesaplanır? Trust, Contribution ve Freshness skorları hakkında tüm detaylar.',
};

export default function ProRejiScorePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'RejiScore Sistemi' }]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <HelpSidebar />
          </div>

          <div className="lg:col-span-6">
            <HelpArticle 
              title="Uzman RejiScore Sistemi" 
              description="Uzman güvenilirlik puanı, danışan memnuniyeti, içerik üretimi ve aktif katılımınıza göre hesaplanır."
              lastUpdated="8 Ocak 2026"
              articleSlug="pro-reji-score"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-star text-purple-500"></i>
                  RejiScore Nedir?
                </h2>
                <p className="mb-4">
                  Uzman RejiScore, platformdaki güvenilirliğinizi gösteren 0-100 arası bir puandır. 
                  Bu skor, danışanların sizi seçmesinde önemli bir faktördür ve arama sonuçlarında sıralamanızı etkiler.
                </p>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-gray-700">Örnek Uzman Skoru:</span>
                    <span className="text-4xl font-black text-purple-600">85</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden mb-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black">
                      <i className="fa-solid fa-arrow-up mr-1"></i> +3.2%
                    </span>
                    <span className="text-xs font-bold text-gray-600">Son 7 günlük artış</span>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-pie text-blue-500"></i>
                  3 Ana Bileşen
                </h2>
                <p className="mb-4">
                  RejiScore üç farklı skorun ağırlıklı ortalamasından oluşur:
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-shield-heart text-blue-600 text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-gray-800 mb-2">1. Trust Score (Güven Skoru)</h3>
                        <p className="text-sm text-gray-600 font-bold mb-3">
                          Danışan memnuniyeti ve değerlendirme ortalamanıza göre hesaplanır.
                        </p>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Değerlendirme ortalaması (5 üzerinden)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Toplam değerlendirme sayısı</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Onaylı danışan yüzdesi</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Başarı hikayesi sayısı</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-pen-fancy text-green-600 text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-gray-800 mb-2">2. Contribution Score (Katkı Skoru)</h3>
                        <p className="text-sm text-gray-600 font-bold mb-3">
                          Platform için ürettiğiniz içerik miktarına göre hesaplanır.
                        </p>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-green-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Blog yazısı sayısı</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-green-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Diyet planı sayısı</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-green-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Egzersiz programı sayısı</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-green-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Sözlük katkıları</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-orange-400 transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-fire text-orange-600 text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-gray-800 mb-2">3. Freshness Score (Güncellik Skoru)</h3>
                        <p className="text-sm text-gray-600 font-bold mb-3">
                          Son dönem aktivitelerinize göre hesaplanır.
                        </p>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Son 30 günlük aktivite</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Yeni içerik yayınlama sıklığı</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Mesaj yanıt hızı</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                            <span className="font-bold text-gray-700">Randevu katılım oranı</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-certificate text-purple-500"></i>
                  Onay Bonusu
                </h2>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl">
                      ✅
                    </div>
                    <div>
                      <h3 className="font-black text-purple-700 text-lg">Onaylı Uzman Bonusu</h3>
                      <p className="text-sm font-bold text-gray-700">Kimlik ve sertifika doğrulama</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-3">
                    Onaylı uzman olduğunuzda RejiScore'unuza <strong className="text-purple-700">+20 puan</strong> eklenir. 
                    Bu bonus tek seferlik verilir ve skorunuzu önemli ölçüde artırır.
                  </p>
                  <a 
                    href="/dashboard/pro/verification" 
                    className="inline-block bg-purple-600 text-white px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-purple-800 btn-game hover:bg-purple-500"
                  >
                    Hemen Başvur
                  </a>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-signal text-blue-500"></i>
                  Seviyeler
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-gray-100 border-l-4 border-gray-400 rounded-r-2xl">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center font-black text-gray-600">
                      {'<'}50
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800">Yeni Uzman</h3>
                      <p className="text-xs text-gray-600 font-bold">Henüz gelişim aşamasında</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-2xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-600">
                      50-70
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800">Gelişiyor</h3>
                      <p className="text-xs text-gray-600 font-bold">İyi bir yolda ilerliyor</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-2xl">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center font-black text-green-600">
                      70-80
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800">İyi</h3>
                      <p className="text-xs text-gray-600 font-bold">Güvenilir ve deneyimli</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-purple-50 border-l-4 border-purple-400 rounded-r-2xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center font-black text-purple-600">
                      80-90
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800">Yüksek Güven</h3>
                      <p className="text-xs text-gray-600 font-bold">Platformun en iyileri arasında</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-r-2xl">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center font-black text-yellow-600">
                      90+
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800 flex items-center gap-2">
                        Efsane <i className="fa-solid fa-crown text-yellow-500"></i>
                      </h3>
                      <p className="text-xs text-gray-600 font-bold">Olağanüstü performans ve güvenilirlik</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-green-500"></i>
                  Trend Oranı
                </h2>
                <p className="mb-4">
                  RejiScore'unuzun yanında görünen trend oranı, son 7 günlük değişim yüzdesini gösterir.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-green-600">+5.2%</span>
                      <i className="fa-solid fa-arrow-trend-up text-green-500 text-2xl"></i>
                    </div>
                    <h3 className="font-black text-gray-800 mb-2">Yükseliş Trendi</h3>
                    <p className="text-xs text-gray-600 font-bold">
                      +5% ve üstü artış yeşil ok ile gösterilir. Harika gidiyorsun!
                    </p>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-red-600">-3.8%</span>
                      <i className="fa-solid fa-arrow-trend-down text-red-500 text-2xl"></i>
                    </div>
                    <h3 className="font-black text-gray-800 mb-2">Düşüş Trendi</h3>
                    <p className="text-xs text-gray-600 font-bold">
                      -5% ve altı düşüş kırmızı ok ile gösterilir. Aktiviteni artırmalısın!
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mt-4">
                  <h3 className="font-black text-blue-700 mb-3">Trend Faktörleri:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Profil görüntüleme artışı/azalışı</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Yeni danışan sayısı</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Son değerlendirmeler</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">İçerik yayınlama sıklığı</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-rocket"></i>
                    Skorunu Yükselt!
                  </h3>
                  <p className="font-bold mb-4 opacity-90">
                    Kaliteli hizmet sun, içerik üret, aktif kal. RejiScore'un başarının anahtarı!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href="/dashboard/pro/clients" className="bg-white text-purple-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-purple-900 btn-game hover:bg-gray-100">
                      Danışanlarım
                    </a>
                    <a href="/dashboard/pro/blog/create" className="bg-purple-700 text-white px-6 py-3 rounded-xl font-extrabold border-2 border-white/30 hover:bg-purple-800">
                      İçerik Üret
                    </a>
                  </div>
                </div>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Uzman Paneli', href: '/help/pro', icon: 'fa-solid fa-briefcase' },
              { title: 'Onaylı Uzman Olma', href: '/help/pro/verification', icon: 'fa-solid fa-certificate' },
              { title: 'Değerlendirmeler', href: '/help/pro/reviews', icon: 'fa-solid fa-star' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
