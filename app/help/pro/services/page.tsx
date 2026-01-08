import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Hizmetler ve Paketler',
  description: 'Hizmet tanımlama, fiyatlandırma, paket içerikleri ve danışana özel planlar.',
};

export default function ProServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Hizmetler ve Paketler' }]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>

          <div className="lg:col-span-6">
            <HelpArticle 
              title="Hizmetler ve Paketler" 
              description="Hizmetlerinizi tanımlayın, paketler oluşturun ve danışanlarınıza özel planlar sunun."
              lastUpdated="8 Ocak 2026"
              articleSlug="pro-services"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-box-open text-blue-500"></i>
                  Hizmet Türleri
                </h2>
                <p className="mb-4">Platformda sunabileceğiniz farklı hizmet türleri:</p>
                
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 transition">
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-video text-blue-500 text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-black text-gray-800 mb-2">Online Danışmanlık</h3>
                        <p className="text-sm text-gray-600 font-bold">
                          Video görüşme ile birebir oturumlar. Otomatik Meet linki oluşturulur.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-building text-green-500 text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-black text-gray-800 mb-2">Yüz Yüze Seanslar</h3>
                        <p className="text-sm text-gray-600 font-bold">
                          Kliniğinizde veya spor salonunuzda yapılan oturumlar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 transition">
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-clipboard-list text-purple-500 text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-black text-gray-800 mb-2">Paket Programlar</h3>
                        <p className="text-sm text-gray-600 font-bold">
                          Birden fazla seans içeren uygun fiyatlı paketler (örn: 10 seans paketi).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-orange-400 transition">
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-file-lines text-orange-500 text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-black text-gray-800 mb-2">Özel Plan Hazırlama</h3>
                        <p className="text-sm text-gray-600 font-bold">
                          Sadece diyet/egzersiz planı hazırlama (oturum olmadan).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-plus-circle text-green-500"></i>
                  Yeni Hizmet Ekleme
                </h2>
                <p className="mb-4">Hizmet tanımlamak için gerekli adımlar:</p>
                
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Hizmet Başlığı ve Açıklaması</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Net ve anlaşılır bir başlık (örn: "Kilo Verme Danışmanlığı - Online")
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Fiyat ve Süre</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Fiyat (TL), seans süresi (dakika) ve geçerlilik süresi (gün)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Paket İçeriği</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Paketin ne içerdiğini madde madde listeleyin
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">4</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Yayınla</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Hizmeti aktif edin, danışanlar artık satın alabilir
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-tag text-purple-500"></i>
                  Fiyatlandırma Stratejileri
                </h2>
                
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 mb-4">
                  <h3 className="font-black text-purple-700 mb-3">Önerilen Fiyatlandırma İpuçları:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Paket fiyatlarını tekil seanslara göre %15-20 indirimli yapın</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                      <span className="font-bold text-gray-700">İlk danışmanlık seansını indirimli sunarak giriş yapın</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Rakiplerinizin fiyatlarını araştırın ve değer katın</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Deneyim kazandıkça fiyatlarınızı kademeli artırın</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                  <h3 className="font-black text-gray-800 mb-3">Örnek Fiyat Yapısı</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="font-bold text-gray-700">Tek Seans Online</span>
                      <span className="font-black text-gray-800">₺500</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200">
                      <span className="font-bold text-gray-700">4 Seans Paketi <span className="text-xs text-green-600">(15% İndirim)</span></span>
                      <span className="font-black text-green-700">₺1,700</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="font-bold text-gray-700">8 Seans Paketi <span className="text-xs text-blue-600">(20% İndirim)</span></span>
                      <span className="font-black text-blue-700">₺3,200</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-user-gear text-orange-500"></i>
                  Danışana Özel Planlar
                </h2>
                <p className="mb-4">
                  Standart paketlerinizin dışında, bireysel ihtiyaçlara göre özel planlar oluşturabilirsiniz.
                </p>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
                  <h3 className="font-black text-orange-700 mb-3">Özel Plan Özellikleri:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Sadece o danışana özel görünür</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Esnek fiyat ve içerik düzenlemesi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Gerekirse taksitli ödeme seçeneği</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Özel notlar ve anlaşma detayları eklenebilir</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-blue-500"></i>
                  Paket İçerikleri
                </h2>
                <p className="mb-4">Paketlerinize ekleyebileceğiniz popüler içerikler:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-black text-gray-800 mb-2 text-sm">Beslenme Danışmanlığı</h4>
                    <ul className="space-y-1 text-xs font-bold text-gray-600">
                      <li>✓ Kişisel diyet planı</li>
                      <li>✓ Haftalık menü</li>
                      <li>✓ Reçete önerileri</li>
                      <li>✓ WhatsApp desteği</li>
                    </ul>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-black text-gray-800 mb-2 text-sm">Spor Programı</h4>
                    <ul className="space-y-1 text-xs font-bold text-gray-600">
                      <li>✓ Egzersiz programı</li>
                      <li>✓ Video gösterimler</li>
                      <li>✓ İlerleme takibi</li>
                      <li>✓ Form analizi</li>
                    </ul>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-black text-gray-800 mb-2 text-sm">Kombine Paket</h4>
                    <ul className="space-y-1 text-xs font-bold text-gray-600">
                      <li>✓ Diyet + Egzersiz</li>
                      <li>✓ 8 hafta takip</li>
                      <li>✓ Aylık ölçüm</li>
                      <li>✓ Motivasyon desteği</li>
                    </ul>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-black text-gray-800 mb-2 text-sm">VIP Danışmanlık</h4>
                    <ul className="space-y-1 text-xs font-bold text-gray-600">
                      <li>✓ 7/24 mesajlaşma</li>
                      <li>✓ Aylık yenileme</li>
                      <li>✓ Kişisel asistan</li>
                      <li>✓ Öncelik hizmeti</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-box"></i>
                    Paketlerinizi Optimize Edin!
                  </h3>
                  <p className="font-bold mb-4 opacity-90">
                    Çekici paketler oluşturun, danışanlarınızı kazanın ve gelirinizi artırın.
                  </p>
                  <a href="/dashboard/pro/finance/services" className="inline-block bg-white text-teal-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-teal-900 btn-game hover:bg-gray-100">
                    Paketlerimi Yönet
                  </a>
                </div>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Gelir Yönetimi', href: '/help/pro/earnings', icon: 'fa-solid fa-money-bill-wave' },
              { title: 'Takvim Yönetimi', href: '/help/pro/calendar', icon: 'fa-solid fa-calendar' },
              { title: 'Uzman Paneli', href: '/help/pro', icon: 'fa-solid fa-briefcase' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
