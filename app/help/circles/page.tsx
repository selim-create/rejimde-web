import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Circle Rehberi',
  description: 'Circle nedir, nasıl katılınır/oluşturulur, görev sistemi ve sohbet özellikleri.',
};

export default function CirclesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Circle Rehberi' }]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle
              title="Circle Rehberi"
              description="Circle'lar, benzer hedeflere sahip kişilerle bir araya geldiğin topluluklar. Birlikte daha güçlüsünüz!"
              lastUpdated="8 Ocak 2026"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Circle Nedir?</h2>
                <p className="mb-4">
                  Circle, benzer sağlık hedeflerine sahip kullanıcıların oluşturduğu topluluktur. Kilo verme, kas yapma, vegan yaşam gibi ortak ilgi alanları etrafında toplanırsınız.
                </p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                  <h3 className="font-black text-blue-700 mb-3">Circle'ların Faydaları:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Motivasyon desteği ve topluluk hissi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Özel görevler ve challenge'lar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Circle sohbet özelliği</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Liderlik tablosunda yarışma</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Circle'a Nasıl Katılırım?</h2>
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Circle Sayfasını Ziyaret Et</h3>
                      <p className="text-sm text-gray-600 font-bold">Mevcut circle'ları görmek için Circle sayfasına git.</p>
                    </div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">İlgini Çeken Circle'ı Bul</h3>
                      <p className="text-sm text-gray-600 font-bold">Hedefine ve ilgi alanına uygun circle'ı seç.</p>
                    </div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">"Katıl" Butonuna Tıkla</h3>
                      <p className="text-sm text-gray-600 font-bold">Onay aldıktan sonra circle'ın bir parçası olursun!</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Kendi Circle'ımı Nasıl Oluştururum?</h2>
                <p className="mb-4">Circle oluşturmak ücretsiz ve çok kolay:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-arrow-right text-rejimde-purple"></i>
                    <span className="font-bold text-gray-700">Circle sayfasında "Yeni Circle Oluştur" butonuna tıkla</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-arrow-right text-rejimde-purple"></i>
                    <span className="font-bold text-gray-700">Circle ismini, açıklamasını ve logosunu belirle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-arrow-right text-rejimde-purple"></i>
                    <span className="font-bold text-gray-700">Gizlilik ayarlarını seç (Açık/Özel/Gizli)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-arrow-right text-rejimde-purple"></i>
                    <span className="font-bold text-gray-700">Oluştur ve arkadaşlarını davet et!</span>
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Circle Görevleri</h2>
                <p className="mb-4">
                  Her circle'ın haftalık görevleri vardır. Görevleri tamamlayarak hem kendi seviyeni hem de circle'ın toplam puanını artırırsın.
                </p>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
                  <h3 className="font-black text-purple-700 mb-3">Örnek Görevler:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-purple-500"></i>
                      <span className="font-bold text-gray-700">Haftalık toplam 5 egzersiz tamamla</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-purple-500"></i>
                      <span className="font-bold text-gray-700">3 blog yazısı oku</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-purple-500"></i>
                      <span className="font-bold text-gray-700">Sohbete en az 5 mesaj yaz</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-rejimde-blue to-rejimde-purple rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2">🎯 Birlikte Başarıyoruz!</h3>
                  <p className="font-bold opacity-90">
                    Circle'ın ne kadar aktif olursa, herkes o kadar çok puan kazanır. Topluluk gücü!
                  </p>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Başlangıç Rehberi', href: '/help/getting-started', icon: 'fa-solid fa-rocket' },
              { title: 'Puan Sistemi', href: '/help/score-system', icon: 'fa-solid fa-star' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
