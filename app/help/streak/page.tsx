import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Günlük Seri (Streak)',
  description: 'Günlük seri sistemi, grace period, telafi hakkı ve milestone bonusları.',
};

export default function StreakPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Günlük Seri (Streak)' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>
          <div className="lg:col-span-6">
            <HelpArticle
              title="Günlük Seri (Streak)"
              description="Streak, arka arkaya kaç gün platforma girip aktivite yaptığını gösteren sayaç. Tutarlılık ödüllendirilir!"
              lastUpdated="8 Ocak 2026"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-fire text-orange-500"></i>
                  Streak Nedir?
                </h2>
                <p className="mb-4">
                  Streak, arka arkaya kaç gün en az bir aktivite yaptığını gösteren sayaçtır. Her gün giriş yapıp aktivite (diyet, egzersiz, blog okuma) gerçekleştirerek streak'ini sürdürebilirsin.
                </p>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-center">
                  <div className="text-6xl mb-3">🔥</div>
                  <div className="text-4xl font-black text-orange-600 mb-2">15 Gün</div>
                  <p className="text-sm font-bold text-gray-600">Mevcut Streak'in</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Streak Nasıl Devam Eder?</h2>
                <p className="mb-4">Streak'ini korumak için her gün en az bir aktivite yapman yeterli:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="font-bold text-gray-700">Diyet öğünü işaretle</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="font-bold text-gray-700">Egzersiz tamamla</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="font-bold text-gray-700">Blog oku</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="font-bold text-gray-700">Circle'da görev tamamla</span>
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Grace Period (Telafi Hakkı)</h2>
                <p className="mb-4">
                  Bir gün aktivite yapamadıysan endişelenme! Grace period sayesinde 1 günlük telafi hakkın var.
                </p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                  <h3 className="font-black text-blue-700 mb-2">Nasıl Çalışır?</h3>
                  <p className="text-sm text-gray-700 font-bold mb-3">
                    Örneğin Pazartesi aktivite yapmadıysan, Salı günü en az bir aktivite yaparak streak'ini korursun. Ancak iki gün üst üste aktivite yapmazsan streak sıfırlanır.
                  </p>
                  <div className="bg-white rounded-xl p-3 text-xs font-bold text-gray-600">
                    💡 <strong>İpucu:</strong> Grace period kullandığında bildirim alırsın, böylece streak'ini kaybetme riskini bilirsin.
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Milestone Bonusları</h2>
                <p className="mb-4">Belirli streak günlerine ulaştığında özel ödüller kazanırsın:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-1">🏅</div>
                    <div className="font-black text-yellow-700">7 Gün</div>
                    <div className="text-xs font-bold text-gray-600">+50 Puan</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-1">🥈</div>
                    <div className="font-black text-orange-700">30 Gün</div>
                    <div className="text-xs font-bold text-gray-600">+150 Puan</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-100 to-red-50 border-2 border-red-300 rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-1">🥇</div>
                    <div className="font-black text-red-700">90 Gün</div>
                    <div className="text-xs font-bold text-gray-600">+500 Puan</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-50 border-2 border-purple-300 rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-1">👑</div>
                    <div className="font-black text-purple-700">365 Gün</div>
                    <div className="text-xs font-bold text-gray-600">+2000 Puan</div>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-fire"></i>
                    Streak'ini Koru!
                  </h3>
                  <p className="font-bold opacity-90">
                    Tutarlılık, başarının anahtarıdır. Her gün küçük adımlarla büyük hedeflere ulaş!
                  </p>
                </div>
              </section>
            </HelpArticle>
          </div>
          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Puan Sistemi', href: '/help/score-system', icon: 'fa-solid fa-star' },
              { title: 'Seviye Sistemi', href: '/help/levels', icon: 'fa-solid fa-trophy' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
