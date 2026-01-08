import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Gelen Kutusu ve Mesajlaşma',
  description: 'Danışanlarınızla mesajlaşın, AI asistan kullanın ve şablon cevaplar oluşturun.',
};

export default function ProInboxPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Gelen Kutusu' }]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>

          <div className="lg:col-span-6">
            <HelpArticle 
              title="Gelen Kutusu ve Mesajlaşma" 
              description="Danışanlarınızla etkili iletişim kurun, hızlı yanıt verin ve AI asistan desteğini kullanın."
              lastUpdated="8 Ocak 2026"
              articleSlug="pro-inbox"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-envelope text-pink-500"></i>
                  Mesajlaşma Sistemi
                </h2>
                <p className="mb-4">
                  Uzman gelen kutunuz, tüm danışanlarınızla merkezi bir yerden iletişim kurmanızı sağlar.
                </p>
                
                <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-5">
                  <h3 className="font-black text-pink-700 mb-3">Temel Özellikler:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-pink-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Gerçek zamanlı mesajlaşma</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-pink-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Dosya ve görsel paylaşımı</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-pink-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Okundu/Okunmadı durumu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-pink-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Mesaj arama ve filtreleme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-pink-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Mobil bildirimler</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-robot text-purple-500"></i>
                  AI Asistan (Co-Pilot)
                </h2>
                <p className="mb-4">
                  Yapay zeka destekli asistanınız, mesajlarınıza hızlı ve profesyonel yanıtlar oluşturmanıza yardımcı olur.
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-wand-magic-sparkles text-purple-500"></i>
                      Otomatik Yanıt Önerileri
                    </h3>
                    <p className="text-sm text-gray-600 font-bold mb-3">
                      AI, gelen mesajları analiz eder ve size 3 farklı yanıt seçeneği sunar.
                    </p>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs">
                      <strong>Örnek:</strong> Danışan "Kilo veremiyorum" dediğinde AI profesyonel, empatik yanıtlar oluşturur.
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-language text-blue-500"></i>
                      Ton ve Stil Ayarlama
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Yanıtların tonunu seçin: Profesyonel, Samimi, Motive Edici veya Bilgilendirici.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-clipboard-check text-green-500"></i>
                      Dilbilgisi ve Yazım Kontrolü
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Yazdığınız yanıtları AI düzenler, hataları düzeltir ve profesyonelleştirir.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-file-lines text-blue-500"></i>
                  Şablon Cevaplar
                </h2>
                <p className="mb-4">
                  Sık kullandığınız yanıtları şablon olarak kaydedip tek tıkla gönderebilirsiniz.
                </p>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-4">
                  <h3 className="font-black text-blue-700 mb-3">Popüler Şablonlar:</h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-3 border border-blue-200">
                      <h4 className="font-black text-gray-800 text-sm mb-1">🎯 İlk Mesaj</h4>
                      <p className="text-xs text-gray-600 font-bold">
                        "Merhaba [İsim], Rejimde'ye hoş geldin! Sana özel program hazırlamak için..."
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-blue-200">
                      <h4 className="font-black text-gray-800 text-sm mb-1">📋 Plan Gönderimi</h4>
                      <p className="text-xs text-gray-600 font-bold">
                        "Yeni diyet planın hazır! Ekli dosyadan inceleyebilirsin. Soru varsa yazabilirsin."
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-blue-200">
                      <h4 className="font-black text-gray-800 text-sm mb-1">💪 Motivasyon</h4>
                      <p className="text-xs text-gray-600 font-bold">
                        "Harika gidiyorsun! Hedefine çok yakınsın. Devam et! 🔥"
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-blue-200">
                      <h4 className="font-black text-gray-800 text-sm mb-1">📅 Randevu Hatırlatma</h4>
                      <p className="text-xs text-gray-600 font-bold">
                        "Yarın saat [Saat]'te randevumuz var. Meet linkini randevu zamanı göndereceğim."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                  <h3 className="font-black text-gray-800 mb-3">Şablon Oluşturma</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0 text-xs">1</div>
                      <span className="font-bold text-gray-700">Ayarlar → Mesaj Şablonları'na gidin</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0 text-xs">2</div>
                      <span className="font-bold text-gray-700">"Yeni Şablon" butonuna tıklayın</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0 text-xs">3</div>
                      <span className="font-bold text-gray-700">Şablon adı ve içeriği girin</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0 text-xs">4</div>
                      <span className="font-bold text-gray-700">Değişkenler ekleyin: [İsim], [Saat], [Tarih]</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-user-circle text-green-500"></i>
                  Profil Slide-over
                </h2>
                <p className="mb-4">
                  Mesajlaşırken danışanın profil bilgilerine hızlıca erişin.
                </p>

                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                  <h3 className="font-black text-green-700 mb-3">Slide-over'da Görebilecekleriniz:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-green-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Danışan bilgileri (yaş, boy, kilo, hedef)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-green-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Aktif paket ve kalan seans sayısı</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-green-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Son görülme ve aktivite skoru</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-green-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Sağlık kısıtları ve alerji bilgileri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-green-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Geçmiş randevular ve planlar</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-bolt text-yellow-500"></i>
                  Hızlı Yanıt İpuçları
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <i className="fa-solid fa-1 text-yellow-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">İlk 1 Saat İçinde Yanıtlayın</h3>
                      <p className="text-sm text-gray-600 font-bold">Hızlı yanıt, danışan memnuniyetini %80 artırır!</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <i className="fa-solid fa-2 text-yellow-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Kişiselleştirin</h3>
                      <p className="text-sm text-gray-600 font-bold">Danışanın adını kullanın ve önceki konuşmalara atıfta bulunun.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <i className="fa-solid fa-3 text-yellow-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Net ve Anlaşılır Olun</h3>
                      <p className="text-sm text-gray-600 font-bold">Kısa, öz ve uygulanabilir yanıtlar verin.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <i className="fa-solid fa-4 text-yellow-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Emoji Kullanın (Ölçülü)</h3>
                      <p className="text-sm text-gray-600 font-bold">Samimi ama profesyonel bir ton için emoji ekleyin. 💪😊</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-comments"></i>
                    Etkili İletişim Kurun!
                  </h3>
                  <p className="font-bold mb-4 opacity-90">
                    AI asistan ve şablonlarla danışanlarınıza hızlı, profesyonel yanıtlar verin.
                  </p>
                  <a href="/dashboard/pro/inbox" className="inline-block bg-white text-pink-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-pink-900 btn-game hover:bg-gray-100">
                    Gelen Kutuma Git
                  </a>
                </div>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Duyurular', href: '/help/pro/announcements', icon: 'fa-solid fa-bullhorn' },
              { title: 'Danışan Yönetimi', href: '/help/pro/clients', icon: 'fa-solid fa-users' },
              { title: 'Uzman Paneli', href: '/help/pro', icon: 'fa-solid fa-briefcase' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
