import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'SSS Yönetimi',
  description: 'Sık sorulan soruları yönetin, otomatik yanıtlar oluşturun ve danışan deneyimini iyileştirin.',
};

export default function ProFaqManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'SSS Yönetimi' }]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>

          <div className="lg:col-span-6">
            <HelpArticle 
              title="SSS (Sık Sorulan Sorular) Yönetimi" 
              description="Danışanlarınızın sık sorduğu soruları yanıtlayın ve zaman kazanın."
              lastUpdated="8 Ocak 2026"
              articleSlug="pro-faq-management"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-circle-question text-cyan-500"></i>
                  SSS Yönetimi Nedir?
                </h2>
                <p className="mb-4">
                  SSS (Sık Sorulan Sorular) sistemi, danışanlarınızın sık sorduğu soruları önceden yanıtlamanızı sağlar. 
                  Bu sayede hem zaman kazanır hem de danışan deneyimini iyileştirirsiniz.
                </p>
                
                <div className="bg-cyan-50 border-2 border-cyan-200 rounded-2xl p-6">
                  <h3 className="font-black text-cyan-700 mb-3">SSS'nin Faydaları:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-cyan-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Tekrar eden sorulara hızlı yanıt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-cyan-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Mesajlaşma yükünü azaltma</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-cyan-500 mt-1"></i>
                      <span className="font-bold text-gray-700">7/24 bilgi erişimi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-cyan-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Profesyonel görünüm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-cyan-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Danışan memnuniyeti artışı</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-plus-circle text-green-500"></i>
                  SSS Ekleme
                </h2>
                <p className="mb-4">Yeni bir soru-cevap eklemek için:</p>
                
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">SSS Yönetimi Sayfasına Gidin</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Dashboard → SSS Yönetimi sekmesine tıklayın
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">"Yeni Soru Ekle" Butonuna Tıklayın</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Soru ekleme formunu açın
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Soru ve Cevabı Yazın</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Net ve anlaşılır bir dil kullanın, gerekirse bağlantılar ekleyin
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">4</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Kategori ve Sıralama</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Kategori seçin ve önem sırasını belirleyin
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">5</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Yayınla</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Sorunuz profilinizde görünür olur
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-layer-group text-purple-500"></i>
                  Kategori Oluşturma
                </h2>
                <p className="mb-4">
                  Sorularınızı kategorilere ayırarak danışanların aradığını kolayca bulmasını sağlayın.
                </p>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 mb-4">
                  <h3 className="font-black text-gray-800 mb-3">Popüler Kategoriler:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <h4 className="font-black text-blue-700 text-sm mb-1">
                        <i className="fa-solid fa-calendar-check mr-2"></i>
                        Randevu ve Seanslar
                      </h4>
                      <p className="text-xs text-gray-600 font-bold">
                        İptal, erteleme, online/offline seçenekleri
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <h4 className="font-black text-green-700 text-sm mb-1">
                        <i className="fa-solid fa-money-bill-wave mr-2"></i>
                        Ödeme ve Paketler
                      </h4>
                      <p className="text-xs text-gray-600 font-bold">
                        Fiyatlar, ödeme yöntemleri, taksit seçenekleri
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                      <h4 className="font-black text-purple-700 text-sm mb-1">
                        <i className="fa-solid fa-utensils mr-2"></i>
                        Diyet ve Beslenme
                      </h4>
                      <p className="text-xs text-gray-600 font-bold">
                        Plan detayları, alternatifler, kısıtlamalar
                      </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                      <h4 className="font-black text-orange-700 text-sm mb-1">
                        <i className="fa-solid fa-dumbbell mr-2"></i>
                        Egzersiz Programı
                      </h4>
                      <p className="text-xs text-gray-600 font-bold">
                        Zorluk seviyesi, ekipman, süre, sıklık
                      </p>
                    </div>

                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                      <h4 className="font-black text-pink-700 text-sm mb-1">
                        <i className="fa-solid fa-comments mr-2"></i>
                        İletişim
                      </h4>
                      <p className="text-xs text-gray-600 font-bold">
                        Mesajlaşma, yanıt süreleri, acil durumlar
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <h4 className="font-black text-gray-700 text-sm mb-1">
                        <i className="fa-solid fa-circle-info mr-2"></i>
                        Genel Bilgiler
                      </h4>
                      <p className="text-xs text-gray-600 font-bold">
                        Hakkımda, deneyim, uzmanlık alanları
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-lightbulb text-yellow-500"></i>
                  Örnek SSS'ler
                </h2>
                <p className="mb-4">İlham almak için bazı örnek soru-cevaplar:</p>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <h3 className="font-black text-gray-800 mb-2">
                      <i className="fa-solid fa-q text-blue-500 mr-2"></i>
                      Randevu iptal etmek istiyorum, nasıl yapabilirim?
                    </h3>
                    <div className="bg-gray-50 border-l-4 border-blue-500 p-3 rounded-r-xl">
                      <p className="text-sm font-bold text-gray-700">
                        <i className="fa-solid fa-a text-blue-500 mr-2"></i>
                        Randevunuzu en geç 24 saat öncesinden Takvim sayfasından iptal edebilirsiniz. 
                        Son dakika iptalleri için lütfen bana mesaj atın.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <h3 className="font-black text-gray-800 mb-2">
                      <i className="fa-solid fa-q text-green-500 mr-2"></i>
                      Hangi ödeme yöntemlerini kabul ediyorsunuz?
                    </h3>
                    <div className="bg-gray-50 border-l-4 border-green-500 p-3 rounded-r-xl">
                      <p className="text-sm font-bold text-gray-700">
                        <i className="fa-solid fa-a text-green-500 mr-2"></i>
                        Kredi kartı, banka havalesi ve EFT kabul ediyorum. 
                        Paket ödemelerde 3 taksit imkanı bulunmaktadır.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <h3 className="font-black text-gray-800 mb-2">
                      <i className="fa-solid fa-q text-purple-500 mr-2"></i>
                      Diyet listemde değişiklik yapabilir miyim?
                    </h3>
                    <div className="bg-gray-50 border-l-4 border-purple-500 p-3 rounded-r-xl">
                      <p className="text-sm font-bold text-gray-700">
                        <i className="fa-solid fa-a text-purple-500 mr-2"></i>
                        Evet! Beğenmediğiniz öğünleri bana bildirin, alternatif öneriler sunayım. 
                        Ayda 1 kez ücretsiz plan güncellemesi hakkınız var.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <h3 className="font-black text-gray-800 mb-2">
                      <i className="fa-solid fa-q text-orange-500 mr-2"></i>
                      Egzersiz yaparken ekipman gerekli mi?
                    </h3>
                    <div className="bg-gray-50 border-l-4 border-orange-500 p-3 rounded-r-xl">
                      <p className="text-sm font-bold text-gray-700">
                        <i className="fa-solid fa-a text-orange-500 mr-2"></i>
                        Programınızı özelleştirebiliriz. Ekipmansız (vücut ağırlığı) veya 
                        minimal ekipmanla (dambıl, direnç bandı) egzersiz seçenekleri mevcuttur.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-blue-500"></i>
                  SSS Yönetim Özellikleri
                </h2>

                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-eye text-blue-500"></i>
                      Görünürlük Ayarı
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Her soruyu aktif/pasif yapabilir, taslak olarak saklayabilirsiniz.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-arrow-up-1-9 text-green-500"></i>
                      Sıralama
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Önemli soruları üstte göstermek için sürükle-bırak ile sıralayın.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-edit text-purple-500"></i>
                      Hızlı Düzenleme
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Mevcut soruları tek tıkla düzenleyip güncelleyebilirsiniz.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-orange-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-chart-bar text-orange-500"></i>
                      İstatistikler
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Hangi soruların daha fazla görüntülendiğini takip edin.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-award text-green-500"></i>
                  İyi SSS Yazma İpuçları
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
                    <i className="fa-solid fa-1 text-green-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Soruyu Danışan Gözüyle Yazın</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        "Randevu iptal prosedürü" yerine "Randevu iptal etmek istiyorum, nasıl yapabilirim?"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
                    <i className="fa-solid fa-2 text-green-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Cevapları Net ve Kısa Tutun</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Uzun paragraflar yerine madde madde, anlaşılır yanıtlar verin.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
                    <i className="fa-solid fa-3 text-green-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Bağlantı ve Kaynak Ekleyin</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        İlgili blog yazısı veya döküman varsa linkini ekleyin.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
                    <i className="fa-solid fa-4 text-green-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Düzenli Güncelleyin</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Hizmetlerinizde değişiklik olduğunda SSS'leri güncelleyin.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-circle-question"></i>
                    Zamanınızı Optimize Edin!
                  </h3>
                  <p className="font-bold mb-4 opacity-90">
                    Kapsamlı bir SSS bölümü, danışan memnuniyetini artırır ve iş yükünüzü azaltır.
                  </p>
                  <a href="/dashboard/pro/faq" className="inline-block bg-white text-cyan-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-cyan-900 btn-game hover:bg-gray-100">
                    SSS'leri Yönet
                  </a>
                </div>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Gelen Kutusu', href: '/help/pro/inbox', icon: 'fa-solid fa-envelope' },
              { title: 'Duyurular', href: '/help/pro/announcements', icon: 'fa-solid fa-bullhorn' },
              { title: 'Uzman Paneli', href: '/help/pro', icon: 'fa-solid fa-briefcase' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
