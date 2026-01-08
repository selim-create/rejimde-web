import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Başlangıç Rehberi',
  description: 'Rejimde\'ye nasıl başlanır? İlk adımlar, hesap oluşturma ve platform tanıtımı.',
};

export default function GettingStartedPage() {
  const relatedArticles = [
    { title: 'Puan Sistemi Nasıl Çalışır?', href: '/help/score-system', icon: 'fa-solid fa-star' },
    { title: 'Circle Nedir?', href: '/help/circles', icon: 'fa-solid fa-users' },
    { title: 'Seviye Sistemi', href: '/help/levels', icon: 'fa-solid fa-trophy' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Başlangıç Rehberi' }]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <HelpSidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <HelpArticle
              title="Başlangıç Rehberi"
              description="Rejimde'ye hoş geldin! Bu rehber, platformu keşfetmene ve ilk adımlarını atmana yardımcı olacak."
              lastUpdated="8 Ocak 2026"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-1 text-rejimde-green"></i>
                  Hesap Oluşturma
                </h2>
                <p className="mb-4">
                  Rejimde'ye katılmak çok kolay! İki farklı hesap türü arasından seçim yapabilirsin:
                </p>
                <div className="space-y-3">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                    <h3 className="font-black text-green-700 mb-2">🏃‍♀️ Normal Kullanıcı Hesabı</h3>
                    <p className="text-sm text-gray-700 font-bold">
                      Diyet ve egzersiz takibi yapmak, circle'lara katılmak, puan kazanmak ve uzmanlarla çalışmak için.
                    </p>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
                    <h3 className="font-black text-purple-700 mb-2">💼 Uzman (Pro) Hesabı</h3>
                    <p className="text-sm text-gray-700 font-bold">
                      Diyetisyen, spor eğitmeni veya sağlık uzmanıysan, danışanlarını yönet, plan oluştur ve gelir elde et.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-2 text-rejimde-blue"></i>
                  Profil Bilgilerini Tamamla
                </h2>
                <p className="mb-4">
                  Hesabını oluşturduktan sonra profil bilgilerini tamamla. Bu bilgiler senin için daha iyi öneriler sunmamızı sağlar:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li className="font-bold text-gray-700">Ad, soyad ve profil fotoğrafı</li>
                  <li className="font-bold text-gray-700">Kilo, boy ve hedef bilgilerin</li>
                  <li className="font-bold text-gray-700">Beslenme tercihlerin (vejetaryen, vegan, vb.)</li>
                  <li className="font-bold text-gray-700">Aktivite seviyeni</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-3 text-rejimde-purple"></i>
                  İlk Circle'ını Seç
                </h2>
                <p className="mb-4">
                  Rejimde'de yalnız değilsin! Circle'lar, benzer hedeflere sahip kişilerle bir araya geldiğin topluluklar.
                </p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                  <h3 className="font-black text-blue-700 mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-lightbulb"></i>
                    Tavsiye
                  </h3>
                  <p className="text-sm text-gray-700 font-bold">
                    Başlangıçta popüler circle'lardan birine katıl. Zamanla kendi circle'ını da oluşturabilirsin!
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-4 text-rejimde-yellow"></i>
                  İlk Görevini Tamamla
                </h2>
                <p className="mb-4">
                  Dashboard'ına git ve günlük görevlerini gör. İşte ilk yapabileceğin şeyler:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-check text-green-500 text-xl"></i>
                    <span className="font-bold text-gray-700">Blog yazısı oku (10-50 puan kazan)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-check text-green-500 text-xl"></i>
                    <span className="font-bold text-gray-700">Bir diyet programına başla</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-check text-green-500 text-xl"></i>
                    <span className="font-bold text-gray-700">İlk egzersizini tamamla</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-check text-green-500 text-xl"></i>
                    <span className="font-bold text-gray-700">Circle sohbetine katıl</span>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-5 text-rejimde-red"></i>
                  Puan Kazan, Seviye Atla
                </h2>
                <p className="mb-4">
                  Rejimde'de her aktivite puan kazandırır. Puanların arttıkça seviyeler yükselir:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-3 rounded-xl text-center">
                    <div className="text-2xl font-black text-gray-400">BEGIN</div>
                    <div className="text-xs font-bold text-gray-500">0-200 puan</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-3 rounded-xl text-center">
                    <div className="text-2xl font-black text-blue-600">ADAPT</div>
                    <div className="text-xs font-bold text-blue-500">200-300 puan</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-green-50 p-3 rounded-xl text-center">
                    <div className="text-2xl font-black text-green-600">GROW</div>
                    <div className="text-xs font-bold text-green-500">300-400 puan</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-3 rounded-xl text-center">
                    <div className="text-2xl font-black text-purple-600">...</div>
                    <div className="text-xs font-bold text-purple-500">Daha fazlası</div>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-6 text-white text-center">
                  <h3 className="text-2xl font-black mb-3">🎉 Haydi Başlayalım!</h3>
                  <p className="font-bold mb-5 opacity-90">
                    Sağlıklı yaşam yolculuğun şimdi başlıyor. Rejimde ailesi olarak seninleyiz!
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-block bg-white text-green-600 px-8 py-3 rounded-2xl font-extrabold shadow-btn shadow-gray-800 btn-game hover:bg-gray-100"
                  >
                    Dashboard'a Git
                  </a>
                </div>
              </section>
            </HelpArticle>
          </div>

          {/* Related Articles Sidebar */}
          <div className="lg:col-span-3">
            <HelpRelated articles={relatedArticles} />
          </div>
        </div>
      </div>
    </div>
  );
}
