import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Puan Sistemi (Reji Score)',
  description: 'Reji Score nedir, nasıl hesaplanır ve nasıl puan kazanılır? Tüm detaylar burada.',
};

export default function ScoreSystemPage() {
  const relatedArticles = [
    { title: 'Seviye Sistemi', href: '/help/levels', icon: 'fa-solid fa-trophy' },
    { title: 'Günlük Seri (Streak)', href: '/help/streak', icon: 'fa-solid fa-fire' },
    { title: 'Circle Rehberi', href: '/help/circles', icon: 'fa-solid fa-users' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Puan Sistemi' }]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <HelpSidebar />
          </div>

          <div className="lg:col-span-6">
            <HelpArticle
              title="Puan Sistemi (Reji Score)"
              description="Reji Score, sağlıklı yaşam yolculuğundaki ilerlemenin sayısal göstergesi. 0-100 arası bir skorla performansını ölç!"
              lastUpdated="8 Ocak 2026"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-star text-rejimde-yellow"></i>
                  Reji Score Nedir?
                </h2>
                <p className="mb-4">
                  Reji Score, platformdaki aktivitelerine göre hesaplanan 0-100 arası bir puandır. Bu skor, sağlıklı alışkanlıkların tutarlılığını ve gelişimini yansıtır.
                </p>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-gray-700">Örnek Skor:</span>
                    <span className="text-3xl font-black text-rejimde-yellow">73</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-rejimde-yellow to-rejimde-green h-full rounded-full" style={{width: '73%'}}></div>
                  </div>
                  <p className="text-xs font-bold text-gray-600 mt-2">Harika gidiyorsun! Hedefine çok yakınsın.</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-coins text-rejimde-green"></i>
                  Nasıl Puan Kazanılır?
                </h2>
                <p className="mb-4">
                  Rejimde'de puan kazanmanın birçok yolu var. İşte en yaygın olanları:
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-book-open text-purple-500"></i>
                        Blog Okuma
                      </h3>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">+10-50 Puan</span>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">
                      Her blog yazısını okuyarak 10-50 arası puan kazanabilirsin. Yazı uzunluğuna göre puan değişir.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-apple-whole text-green-500"></i>
                        Diyet Tamamlama
                      </h3>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">+30-100 Puan</span>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">
                      Günlük diyet programını tamamladığında puan kazanırsın. Program zorluğuna göre puan artar.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-dumbbell text-red-500"></i>
                        Egzersiz Tamamlama
                      </h3>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">+20-80 Puan</span>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">
                      Egzersiz programındaki hareketleri tamamla. Süre ve zorluk seviyesi puanı etkiler.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-calendar-check text-blue-500"></i>
                        Günlük Giriş
                      </h3>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">+5-10 Puan</span>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">
                      Her gün platforma giriş yaparak küçük bonuslar kazan. Streak (günlük seri) geliştir!
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-user-doctor text-purple-500"></i>
                        Uzman Değerlendirmesi
                      </h3>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">+50-200 Puan</span>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">
                      Uzmanlar tarafından verilen özel görevleri tamamla. En yüksek puanları buradan kazanabilirsin!
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-users text-blue-500"></i>
                        Circle Aktiviteleri
                      </h3>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">+10-50 Puan</span>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">
                      Circle görevlerini tamamla, sohbete katıl, motivasyon paylaş. Her aktivite puan kazandırır!
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-calculator text-rejimde-blue"></i>
                  Puan Nasıl Hesaplanır?
                </h2>
                <p className="mb-4">
                  Reji Score, son 30 günlük aktivitelerine göre dinamik olarak hesaplanır. Formül şöyle:
                </p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                  <div className="font-mono text-sm text-gray-800 font-bold mb-3">
                    Reji Score = (Toplam Puan × Tutarlılık Katsayısı) ÷ 100
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700"><strong>Toplam Puan:</strong> Son 30 günde kazandığın tüm puanlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700"><strong>Tutarlılık Katsayısı:</strong> Günlük aktivite sıklığına göre 0.5-1.5 arası değer</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-rejimde-purple"></i>
                  Skorumu Nasıl Artırırım?
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl">
                    <i className="fa-solid fa-1 text-purple-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Tutarlı Ol</h3>
                      <p className="text-sm text-gray-600 font-bold">Her gün en az bir aktivite yap. Streak'ini kırma!</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl">
                    <i className="fa-solid fa-2 text-purple-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Çeşitli Aktiviteler Yap</h3>
                      <p className="text-sm text-gray-600 font-bold">Sadece diyet değil, egzersiz, blog okuma ve circle aktivitelerini de dengele.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl">
                    <i className="fa-solid fa-3 text-purple-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Uzman Görevlerine Odaklan</h3>
                      <p className="text-sm text-gray-600 font-bold">En yüksek puanları uzman görevlerinden kazanabilirsin.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl">
                    <i className="fa-solid fa-4 text-purple-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Circle'ına Katkı Sağla</h3>
                      <p className="text-sm text-gray-600 font-bold">Topluluk aktiviteleri hem seni hem de circle'ını güçlendirir.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-trophy"></i>
                    Hedefin 100 Puan!
                  </h3>
                  <p className="font-bold opacity-90">
                    Her puan, sağlıklı yaşam yolculuğunda attığın bir adım. Devam et, gelişmeye devam et!
                  </p>
                </div>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={relatedArticles} />
          </div>
        </div>
      </div>
    </div>
  );
}
