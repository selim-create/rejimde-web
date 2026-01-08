import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Uzman (Pro) Rehberi',
  description: 'Danışan yönetimi, plan oluşturma, gelir yönetimi ve onaylı uzman olma rehberi.',
};

export default function ProPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle title="Uzman (Pro) Rehberi" description="Rejimde Pro ile danışanlarını yönet, plan oluştur ve gelir elde et!" lastUpdated="8 Ocak 2026">
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Rejimde Pro Nedir?</h2>
                <p className="mb-4">
                  Rejimde Pro, diyetisyenler, spor eğitmenleri ve sağlık uzmanları için tasarlanmış profesyonel bir platformdur. Danışanlarını dijital ortamda takip et, kişiselleştirilmiş planlar oluştur ve gelir elde et.
                </p>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
                  <h3 className="font-black text-purple-700 mb-3">Pro Özellikleri:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Sınırsız danışan yönetimi (ücretsiz)</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Diyet ve egzersiz planı oluşturma</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Hizmet paketleri ve fiyatlandırma</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">Gelir takibi ve otomatik ödeme</span></li>
                    <li className="flex items-start gap-2"><i className="fa-solid fa-check text-purple-500 mt-1"></i><span className="font-bold text-gray-700">AI destekli risk analizi</span></li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Temel Konular</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/help/pro/clients" className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 hover:shadow-lg transition group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-users text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="font-black text-gray-800 group-hover:text-purple-600">Danışan Yönetimi</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">Danışan ekleme, davet etme, segmentler ve AI risk analizi</p>
                  </Link>

                  <Link href="/help/pro/plans" className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 hover:shadow-lg transition group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-clipboard-list text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="font-black text-gray-800 group-hover:text-purple-600">Plan Oluşturma</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">Diyet ve egzersiz planları, özel planlar ve şablonlar</p>
                  </Link>

                  <Link href="/help/pro/earnings" className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 hover:shadow-lg transition group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-money-bill-wave text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="font-black text-gray-800 group-hover:text-purple-600">Gelir Yönetimi</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">Bakiye, manuel ödeme, çekim talebi ve raporlar</p>
                  </Link>

                  <Link href="/help/pro/verification" className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 hover:shadow-lg transition group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-certificate text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="font-black text-gray-800 group-hover:text-purple-600">Onaylı Uzman Olma</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-bold">Gereksinimler, sertifika süreci ve onay bonusu</p>
                  </Link>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Hemen Başla</h2>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-black mb-3">Uzman hesabın var mı?</h3>
                  <p className="font-bold mb-4 opacity-90">
                    Hemen giriş yap ve Uzman Paneline git. Yoksa ücretsiz kaydol!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href="/dashboard/pro" className="bg-white text-purple-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-purple-900 btn-game hover:bg-gray-100">
                      Uzman Paneli
                    </a>
                    <a href="/register/pro" className="bg-purple-700 text-white px-6 py-3 rounded-xl font-extrabold border-2 border-white/30 hover:bg-purple-800">
                      Ücretsiz Kaydol
                    </a>
                  </div>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Danışan Yönetimi', href: '/help/pro/clients', icon: 'fa-solid fa-users' },
              { title: 'Plan Oluşturma', href: '/help/pro/plans', icon: 'fa-solid fa-clipboard-list' },
              { title: 'Gelir Yönetimi', href: '/help/pro/earnings', icon: 'fa-solid fa-money-bill-wave' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
