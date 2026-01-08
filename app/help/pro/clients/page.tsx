import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Danışan Yönetimi',
  description: 'Danışan ekleme, kayıtsız danışan davet etme, segmentler ve AI risk analizi.',
};

export default function ProClientsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Danışan Yönetimi' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle title="Danışan Yönetimi" description="Danışanlarını ekle, yönet, segmentlere ayır ve AI ile risk analizi yap." lastUpdated="8 Ocak 2026">
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Kayıtlı Danışan Ekleme</h2>
                <p className="mb-4">Platformda kayıtlı bir kullanıcıyı danışan olarak eklemek için:</p>
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Uzman Paneline Git</h3><p className="text-sm text-gray-600 font-bold">"Danışanlarım" sekmesini aç</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div><h3 className="font-black text-gray-800 mb-1">"Danışan Ekle" Butonuna Tıkla</h3><p className="text-sm text-gray-600 font-bold">Kullanıcı adını veya e-postayı ara</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Davet Gönder</h3><p className="text-sm text-gray-600 font-bold">Kullanıcı daveti onayladığında danışanın olur</p></div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Kayıtsız Danışan Davet Etme</h2>
                <p className="mb-4">Platformda hesabı olmayan birine davet gönderebilirsin:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">E-posta adresini gir ve davet linki gönder</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Davet linki ile kayıt olduğunda otomatik olarak danışanın olur</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">İlk 30 gün özel plan bonus puanı kazanırsın</span></li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Segmentler ve Etiketler</h2>
                <p className="mb-4">Danışanlarını kategorilere ayırarak daha iyi yönet:</p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                  <h3 className="font-black text-blue-700 mb-3">Örnek Segmentler:</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">Kilo Verme</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">Kas Yapma</span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black">Vegan</span>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black">Sporcu</span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">Yüksek Risk</span>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">AI Risk Analizi</h2>
                <p className="mb-4">
                  Yapay zeka, danışanlarının sağlık verilerini analiz eder ve risk seviyeleri belirler:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-bold text-gray-700">Düşük Risk - Rutin takip</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-bold text-gray-700">Orta Risk - Dikkatli takip gerekli</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-bold text-gray-700">Yüksek Risk - Öncelikli müdahale</span>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2">💼 Profesyonel Yönetim</h3>
                  <p className="font-bold opacity-90">AI ve segmentlerle danışanlarını en verimli şekilde takip et!</p>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Plan Oluşturma', href: '/help/pro/plans', icon: 'fa-solid fa-clipboard-list' },
              { title: 'Gelir Yönetimi', href: '/help/pro/earnings', icon: 'fa-solid fa-money-bill-wave' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
