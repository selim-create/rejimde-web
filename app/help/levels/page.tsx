import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Seviye Sistemi',
  description: 'Begin\'den Transform\'a kadar tüm seviyeler, yükselme kuralları ve ödüller.',
};

export default function LevelsPage() {
  const levels = [
    { name: 'BEGIN', range: '0-200', color: 'gray', icon: '🌱', bgClass: 'bg-gradient-to-r from-gray-50 to-white', borderClass: 'border-gray-200', badgeBg: 'bg-gray-100', badgeText: 'text-gray-700' },
    { name: 'ADAPT', range: '200-300', color: 'blue', icon: '🌿', bgClass: 'bg-gradient-to-r from-blue-50 to-white', borderClass: 'border-blue-200', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
    { name: 'GROW', range: '300-400', color: 'green', icon: '🌳', bgClass: 'bg-gradient-to-r from-green-50 to-white', borderClass: 'border-green-200', badgeBg: 'bg-green-100', badgeText: 'text-green-700' },
    { name: 'PUSH', range: '400-600', color: 'yellow', icon: '⚡', bgClass: 'bg-gradient-to-r from-yellow-50 to-white', borderClass: 'border-yellow-200', badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-700' },
    { name: 'PEAK', range: '600-800', color: 'orange', icon: '🔥', bgClass: 'bg-gradient-to-r from-orange-50 to-white', borderClass: 'border-orange-200', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
    { name: 'MASTER', range: '800-1000', color: 'red', icon: '👑', bgClass: 'bg-gradient-to-r from-red-50 to-white', borderClass: 'border-red-200', badgeBg: 'bg-red-100', badgeText: 'text-red-700' },
    { name: 'TRANSFORM', range: '1000+', color: 'purple', icon: '🏆', bgClass: 'bg-gradient-to-r from-purple-50 to-white', borderClass: 'border-purple-200', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Seviye Sistemi' }]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <HelpSidebar />
          </div>

          <div className="lg:col-span-6">
            <HelpArticle
              title="Seviye Sistemi"
              description="Begin'den Transform'a kadar yolculuğun. Her seviye, yeni başarılar ve ödüllerle dolu!"
              lastUpdated="8 Ocak 2026"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">
                  7 Seviye, 1 Hedef: Transform!
                </h2>
                <p className="mb-6">
                  Rejimde'de kazandığın puanlara göre seviye atlarsın. Her seviye, sağlıklı yaşam yolculuğunda yeni bir aşama!
                </p>

                <div className="space-y-4">
                  {levels.map((level, index) => (
                    <div key={index} className={`${level.bgClass} border-2 ${level.borderClass} rounded-2xl p-5 hover:shadow-lg transition`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{level.icon}</span>
                          <div>
                            <h3 className="text-2xl font-black text-gray-800">{level.name}</h3>
                            <p className="text-sm font-bold text-gray-600">{level.range} Puan</p>
                          </div>
                        </div>
                        <div className={`${level.badgeBg} ${level.badgeText} px-4 py-2 rounded-xl font-black text-xs uppercase`}>
                          Level {index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Seviye Atlama Kuralları</h2>
                <div className="space-y-3">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                    <h3 className="font-black text-green-700 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-arrow-up"></i>
                      Yükselme
                    </h3>
                    <p className="text-sm text-gray-700 font-bold">
                      Bir sonraki seviyenin minimum puanına ulaştığında otomatik olarak yükselirsin. Yükselme anında bonus puan kazanırsın!
                    </p>
                  </div>
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                    <h3 className="font-black text-red-700 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-arrow-down"></i>
                      Düşme
                    </h3>
                    <p className="text-sm text-gray-700 font-bold">
                      30 gün boyunca hiç aktivite yapmazsan, puanın düşebilir ve seviye kaybedebilirsin. Aktif kal!
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Seviye Ödülleri</h2>
                <p className="mb-4">Her seviye atlayışında özel ödüller kazanırsın:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-gift text-rejimde-purple text-xl"></i>
                    <span className="font-bold text-gray-700">Özel rozetler ve başarım rozetleri</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-star text-rejimde-yellow text-xl"></i>
                    <span className="font-bold text-gray-700">Bonus puanlar</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-unlock text-rejimde-blue text-xl"></i>
                    <span className="font-bold text-gray-700">Yeni özellikler ve içeriklere erişim</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-users text-rejimde-green text-xl"></i>
                    <span className="font-bold text-gray-700">Circle'ında özel statü</span>
                  </li>
                </ul>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Puan Sistemi', href: '/help/score-system', icon: 'fa-solid fa-star' },
              { title: 'Günlük Seri (Streak)', href: '/help/streak', icon: 'fa-solid fa-fire' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
