import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Gelir Yönetimi',
  description: 'Bakiye takibi, manuel ödeme alma, çekim talebi ve gelir raporları.',
};

export default function ProEarningsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Gelir Yönetimi' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle title="Gelir Yönetimi" description="Kazandığın parayı takip et, ödemeleri yönet ve gelir raporlarını incele." lastUpdated="8 Ocak 2026">
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Bakiye ve Kazançlar</h2>
                <p className="mb-4">Uzman Panelindeki "Gelirlerim" bölümünden tüm kazançlarını görebilirsin:</p>
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-black text-gray-800">₺2.450</div>
                      <div className="text-xs font-bold text-gray-500 mt-1">Toplam Kazanç</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-green-600">₺850</div>
                      <div className="text-xs font-bold text-gray-500 mt-1">Mevcut Bakiye</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-blue-600">₺1.600</div>
                      <div className="text-xs font-bold text-gray-500 mt-1">Çekilen Tutar</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Manuel Ödeme Alma</h2>
                <p className="mb-4">Platformumuz üzerinden ödeme almak istemiyorsan manuel ödeme seçeneğini kullanabilirsin:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i><span className="font-bold text-gray-700">Danışanınla özel ödeme anlaşması yap</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i><span className="font-bold text-gray-700">Sistem üzerinden "Manuel Ödeme Aldım" butonuna tıkla</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i><span className="font-bold text-gray-700">Bakiyene eklenir ancak çekim yapamazsın</span></li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Çekim Talebi</h2>
                <p className="mb-4">Bakiyeni banka hesabına çekmek için:</p>
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Minimum Tutar Kontrolü</h3><p className="text-sm text-gray-600 font-bold">Minimum 500 TL bakiye gerekli</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Banka Bilgilerini Gir</h3><p className="text-sm text-gray-600 font-bold">IBAN ve hesap sahibi adı</p></div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div><h3 className="font-black text-gray-800 mb-1">Talep Oluştur</h3><p className="text-sm text-gray-600 font-bold">3-5 iş günü içinde hesabına geçer</p></div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Komisyon Oranları</h2>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
                  <h3 className="font-black text-yellow-700 mb-3">Platform Komisyonu:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-between">
                      <span className="font-bold text-gray-700">Platform üzerinden satış</span>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-black">%15</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-bold text-gray-700">Manuel ödeme (sistem dışı)</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black">%0</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-600 font-bold mt-3">💡 Manuel ödemelerde komisyon alınmaz, ancak çekim yapamazsın.</p>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2">💰 Gelirini Yönet!</h3>
                  <p className="font-bold opacity-90">Şeffaf, güvenli ve kolay ödeme sistemi ile kazancını takip et.</p>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Danışan Yönetimi', href: '/help/pro/clients', icon: 'fa-solid fa-users' },
              { title: 'Plan Oluşturma', href: '/help/pro/plans', icon: 'fa-solid fa-clipboard-list' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
