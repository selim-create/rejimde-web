import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Plan Oluşturma',
  description: 'Diyet ve egzersiz planları oluşturma, özel planlar ve şablonlar.',
};

export default function ProPlansPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Plan Oluşturma' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle title="Plan Oluşturma" description="Danışanların için kişiselleştirilmiş diyet ve egzersiz planları oluştur." lastUpdated="8 Ocak 2026">
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Diyet Planı Oluşturma</h2>
                <p className="mb-4">Danışanın için özel diyet planı hazırla:</p>
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-1 text-green-500"></i>
                      Plan Bilgileri
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">İsim, açıklama, hedef kalori, süre (gün sayısı)</p>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-2 text-green-500"></i>
                      Günlük Öğünler
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">Kahvaltı, öğle, akşam ve ara öğün detayları</p>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-3 text-green-500"></i>
                      Besin Değerleri
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">Kalori, protein, karbonhidrat, yağ oranları</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Egzersiz Planı Oluşturma</h2>
                <p className="mb-4">Danışanın seviyesine uygun egzersiz programı hazırla:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-red-500 mt-1"></i><span className="font-bold text-gray-700">Antrenman günleri ve süresi</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-red-500 mt-1"></i><span className="font-bold text-gray-700">Hareket listesi (isim, tekrar, set, süre)</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-red-500 mt-1"></i><span className="font-bold text-gray-700">Video linkleri ve açıklamalar</span></li>
                  <li className="flex items-start gap-2"><i className="fa-solid fa-check text-red-500 mt-1"></i><span className="font-bold text-gray-700">İlerleme takibi ve zorluk ayarları</span></li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Şablonlar ve Kopyalama</h2>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
                  <h3 className="font-black text-purple-700 mb-3">Zaman Kazanma İpuçları:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><i className="fa-solid fa-lightbulb text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Sık kullandığın planları şablon olarak kaydet</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-lightbulb text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Mevcut planı kopyala ve düzenle</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-lightbulb text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Hazır plan kütüphanesinden seç</span></li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Plan Atama</h2>
                <p className="mb-4">Oluşturduğun planı danışana ata:</p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-500"></i><span className="font-bold text-gray-700">Danışanı seç veya birden fazla danışana ata</span></li>
                    <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-500"></i><span className="font-bold text-gray-700">Başlangıç tarihi belirle</span></li>
                    <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-500"></i><span className="font-bold text-gray-700">Danışan bildirim alır ve hemen başlayabilir</span></li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2">📋 Kişiselleştirilmiş Başarı</h3>
                  <p className="font-bold opacity-90">Her danışan özeldir. Özel planlarla farkı göster!</p>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Danışan Yönetimi', href: '/help/pro/clients', icon: 'fa-solid fa-users' },
              { title: 'Gelir Yönetimi', href: '/help/pro/earnings', icon: 'fa-solid fa-money-bill-wave' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
