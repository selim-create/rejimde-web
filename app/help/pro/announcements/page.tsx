import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Duyuru Sistemi',
  description: 'Danışanlarınıza toplu duyuru gönderin, bilgilendirme yapın ve önemli mesajları iletin.',
};

export default function ProAnnouncementsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Duyurular' }]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>

          <div className="lg:col-span-6">
            <HelpArticle 
              title="Duyuru Sistemi" 
              description="Tüm danışanlarınıza aynı anda duyuru gönderin, bilgilendirin ve engage olun."
              lastUpdated="8 Ocak 2026"
              articleSlug="pro-announcements"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-bullhorn text-orange-500"></i>
                  Duyuru Nedir?
                </h2>
                <p className="mb-4">
                  Duyurular, tüm danışanlarınıza veya belirli bir gruba aynı anda mesaj göndermenizi sağlar. 
                  Tek tek mesajlaşmak yerine toplu bilgilendirme yapabilirsiniz.
                </p>
                
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
                  <h3 className="font-black text-orange-700 mb-3">Ne Zaman Kullanılır?</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Tatil veya izin bildirimi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Yeni hizmet veya paket duyurusu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Önemli bilgilendirmeler</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Motivasyon mesajları</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-orange-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Randevu sistemi değişiklikleri</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-plus-circle text-green-500"></i>
                  Duyuru Oluşturma
                </h2>
                <p className="mb-4">Yeni bir duyuru oluşturmak için izlemeniz gereken adımlar:</p>
                
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Uzman Panele Gidin</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Dashboard → Duyurular sekmesine gidin veya "+" butonuna tıklayın
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Başlık ve İçerik Yazın</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Dikkat çekici bir başlık ve net, öz bir açıklama girin
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Hedef Kitle Seçin</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Tüm danışanlar veya belirli segmentler (örn: sadece aktif danışanlar)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">4</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Yayınla</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Tüm seçili danışanlara anında bildirim gönderilir
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-users text-blue-500"></i>
                  Hedef Kitle Seçenekleri
                </h2>
                <p className="mb-4">Duyurunuzu kime göndereceğinizi seçin:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-users-line text-blue-500"></i>
                      Tüm Danışanlar
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Aktif ve pasif tüm danışanlarınıza gönderilir
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-green-500"></i>
                      Sadece Aktif Danışanlar
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Aktif paketi olan danışanlara gönderilir
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-tags text-purple-500"></i>
                      Segmentlere Göre
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Belirli etiketlere sahip danışanlara gönderilir
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-orange-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-user-check text-orange-500"></i>
                      Özel Seçim
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Manuel olarak danışan seçerek gönderilir
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-bell text-yellow-500"></i>
                  Bildirim Gönderimi
                </h2>
                <p className="mb-4">
                  Duyurunuz yayınlandığında tüm seçili danışanlara bildirim gönderilir.
                </p>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
                  <h3 className="font-black text-yellow-700 mb-3">Bildirim Kanalları:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-yellow-500 mt-1"></i>
                      <span className="font-bold text-gray-700"><strong>Uygulama İçi Bildirim:</strong> Anında push notification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-yellow-500 mt-1"></i>
                      <span className="font-bold text-gray-700"><strong>E-posta:</strong> Önemli duyurular için e-posta gönderimi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-yellow-500 mt-1"></i>
                      <span className="font-bold text-gray-700"><strong>Dashboard Bildirimi:</strong> Danışan panelinde duyuru rozeti</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple text-purple-500"></i>
                  Duyuru İstatistikleri
                </h2>
                <p className="mb-4">Her duyuru için aşağıdaki metrikleri görebilirsiniz:</p>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-black text-blue-600 mb-1">42</div>
                      <p className="text-xs font-bold text-gray-600">Gönderildi</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <div className="text-2xl font-black text-green-600 mb-1">38</div>
                      <p className="text-xs font-bold text-gray-600">Görüldü</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <div className="text-2xl font-black text-purple-600 mb-1">12</div>
                      <p className="text-xs font-bold text-gray-600">Tıklandı</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-xl">
                      <div className="text-2xl font-black text-orange-600 mb-1">90%</div>
                      <p className="text-xs font-bold text-gray-600">Oran</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-lightbulb text-blue-500"></i>
                  İyi Duyuru Örnekleri
                </h2>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <i className="fa-solid fa-plane-departure text-blue-500 text-xl"></i>
                      <div>
                        <h3 className="font-black text-gray-800">Tatil Bildirimi</h3>
                        <p className="text-sm text-gray-600 font-bold">
                          "📢 Sevgili danışanlarım, 15-30 Ocak tarihleri arasında izinliyim. 
                          Acil durumlar için e-posta adresimden ulaşabilirsiniz. İyi tatiller! 🌴"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <i className="fa-solid fa-gift text-purple-500 text-xl"></i>
                      <div>
                        <h3 className="font-black text-gray-800">Yeni Paket Duyurusu</h3>
                        <p className="text-sm text-gray-600 font-bold">
                          "🎉 Yeni Yıl Özel! 12 seans paketine %20 indirim! 
                          Detaylar için mesaj atabilirsiniz. Fırsat 31 Ocak'a kadar geçerli."
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <i className="fa-solid fa-trophy text-yellow-500 text-xl"></i>
                      <div>
                        <h3 className="font-black text-gray-800">Motivasyon Mesajı</h3>
                        <p className="text-sm text-gray-600 font-bold">
                          "💪 Bu hafta harika gidiyorsunuz! %80'iniz hedeflerinde ilerleme kaydetti. 
                          Devam edin, başarı yakın! 🔥"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-megaphone"></i>
                    Duyurularla Bağlantıyı Güçlendirin!
                  </h3>
                  <p className="font-bold mb-4 opacity-90">
                    Düzenli duyurularla danışanlarınızı bilgilendirin ve engage tutun.
                  </p>
                  <a href="/dashboard/pro" className="inline-block bg-white text-orange-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-orange-900 btn-game hover:bg-gray-100">
                    Duyuru Oluştur
                  </a>
                </div>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Gelen Kutusu', href: '/help/pro/inbox', icon: 'fa-solid fa-envelope' },
              { title: 'Danışan Yönetimi', href: '/help/pro/clients', icon: 'fa-solid fa-users' },
              { title: 'Uzman Paneli', href: '/help/pro', icon: 'fa-solid fa-briefcase' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
