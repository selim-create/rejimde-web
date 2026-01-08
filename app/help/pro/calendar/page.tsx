import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Takvim ve Randevu Yönetimi',
  description: 'Uzman takviminizi nasıl kullanırsınız? Randevu oluşturma, talep yönetimi ve müsaitlik ayarları.',
};

export default function ProCalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Takvim Yönetimi' }]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>

          <div className="lg:col-span-6">
            <HelpArticle 
              title="Takvim ve Randevu Yönetimi" 
              description="Randevularınızı düzenleyin, müsaitlik ayarlayın ve danışanlarınızın taleplerini yönetin."
              lastUpdated="8 Ocak 2026"
              articleSlug="pro-calendar"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-calendar-days text-blue-500"></i>
                  Takvim Görünümleri
                </h2>
                <p className="mb-4">Uzman takviminizde üç farklı görünüm seçeneği bulunur:</p>
                
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-calendar-day text-blue-500"></i>
                      Gün Görünümü
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Seçtiğiniz günün saat bazında detaylı görünümü. Randevuları saat dilimlerinde görüntüleyin.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-calendar-week text-green-500"></i>
                      Hafta Görünümü
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      7 günlük genel bakış. Haftanızı planlayın ve boşlukları görün.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-calendar text-purple-500"></i>
                      Ay Görünümü
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Tüm ayın kuş bakışı görünümü. Yoğun günleri ve boş tarihleri hızlıca tespit edin.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-plus-circle text-green-500"></i>
                  Randevu Oluşturma
                </h2>
                <p className="mb-4">Manuel olarak randevu oluşturmak için:</p>
                
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Takvimde Tarih Seç</h3>
                      <p className="text-sm text-gray-600 font-bold">İlgili tarihe tıklayın veya "+" butonunu kullanın</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Randevu Detayları</h3>
                      <p className="text-sm text-gray-600 font-bold">Danışan, saat, hizmet türü ve süre bilgilerini girin</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Online/Offline Seçimi</h3>
                      <p className="text-sm text-gray-600 font-bold">Online ise Meet linki otomatik oluşturulur</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">4</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Kaydet ve Bildir</h3>
                      <p className="text-sm text-gray-600 font-bold">Danışanınıza otomatik bildirim gönderilir</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-inbox text-yellow-500"></i>
                  Randevu Talepleri Yönetimi
                </h2>
                <p className="mb-4">
                  Danışanlarınız sizden randevu talep edebilir. Talepleri onaylayın veya alternatif saat önerebilirsiniz.
                </p>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
                  <h3 className="font-black text-yellow-700 mb-3">Talep İşlemleri:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-yellow-500 mt-1"></i>
                      <span className="font-bold text-gray-700"><strong>Onayla:</strong> Talebi direkt kabul edin, randevu oluşturulur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-yellow-500 mt-1"></i>
                      <span className="font-bold text-gray-700"><strong>Alternatif Öner:</strong> Farklı saat veya tarih önerin</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-yellow-500 mt-1"></i>
                      <span className="font-bold text-gray-700"><strong>Reddet:</strong> Sebep belirterek reddedin (isteğe bağlı)</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-purple-500"></i>
                  Müsaitlik Ayarlama
                </h2>
                <p className="mb-4">
                  Haftalık çalışma saatlerinizi ve uygun olmadığınız tarihleri belirleyin.
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <h3 className="font-black text-gray-800 mb-3">Haftalık Çalışma Saatleri</h3>
                    <p className="text-sm text-gray-600 font-bold mb-3">
                      Her gün için çalışma saatlerinizi ayarlayın. Örnek: Pazartesi 09:00 - 18:00
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-600">
                      💡 <strong>İpucu:</strong> Lunch break için ara verme özelliğini kullanabilirsiniz.
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <h3 className="font-black text-gray-800 mb-3">İzin / Tatil Günleri</h3>
                    <p className="text-sm text-gray-600 font-bold mb-3">
                      Belirli tarihlerde müsait olmadığınızı işaretleyin. Bu günler danışanlara kapalı görünür.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <h3 className="font-black text-gray-800 mb-3">Randevu Aralığı</h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Randevular arası minimum süre (örn: 15 dk) ayarlayın. Bu, hazırlık ve dinlenme için buffer sağlar.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-calendar-check"></i>
                    Takviminizi Optimize Edin!
                  </h3>
                  <p className="font-bold mb-4 opacity-90">
                    Müsaitlik ayarlarınızı güncel tutun, danışanlarınıza hızlı yanıt verin.
                  </p>
                  <a href="/dashboard/pro/calendar" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-blue-900 btn-game hover:bg-gray-100">
                    Takvime Git
                  </a>
                </div>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Uzman Paneli', href: '/help/pro', icon: 'fa-solid fa-briefcase' },
              { title: 'Paketlerim', href: '/help/pro/services', icon: 'fa-solid fa-list' },
              { title: 'Danışan Yönetimi', href: '/help/pro/clients', icon: 'fa-solid fa-users' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
