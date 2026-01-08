import { Metadata } from 'next';
import HelpHero from '@/components/help/HelpHero';
import HelpCategoryCard from '@/components/help/HelpCategoryCard';

export const metadata: Metadata = {
  title: 'Yardım & Destek Merkezi',
  description: 'Rejimde platformunu daha iyi anlamak için aradığın her şey burada. Puan sistemi, seviyeler, circle\'lar ve daha fazlası hakkında detaylı rehberler.',
  openGraph: {
    title: 'Yardım & Destek Merkezi | Rejimde',
    description: 'Platform özellikleri, puan sistemi, seviyeler ve daha fazlası hakkında detaylı rehberler.',
  },
};

export default function HelpPage() {
  const categories = [
    {
      title: 'Başlangıç Rehberi',
      description: 'Rejimde\'ye nasıl başlanır? İlk adımlar, hesap oluşturma ve platform tanıtımı.',
      icon: 'fa-solid fa-rocket',
      href: '/help/getting-started',
      color: 'green' as const,
      articleCount: 1
    },
    {
      title: 'Diyet Takibi',
      description: 'Diyet programına başlama, öğün işaretleme, ilerleme takibi ve puan kazanma.',
      icon: 'fa-solid fa-carrot',
      href: '/help/diets',
      color: 'green' as const,
      articleCount: 1
    },
    {
      title: 'Egzersiz Takibi',
      description: 'Egzersiz programına başlama, hareket tamamlama ve timer kullanımı.',
      icon: 'fa-solid fa-dumbbell',
      href: '/help/exercises',
      color: 'red' as const,
      articleCount: 1
    },
    {
      title: 'Puan Sistemi (Reji Score)',
      description: 'Reji Score nedir, nasıl hesaplanır ve nasıl puan kazanılır? Tüm detaylar burada.',
      icon: 'fa-solid fa-star',
      href: '/help/score-system',
      color: 'yellow' as const,
      articleCount: 1
    },
    {
      title: 'Seviye Sistemi',
      description: 'Begin\'den Transform\'a kadar tüm seviyeler, yükselme kuralları ve ödüller.',
      icon: 'fa-solid fa-trophy',
      href: '/help/levels',
      color: 'purple' as const,
      articleCount: 1
    },
    {
      title: 'Günlük Seri (Streak)',
      description: 'Günlük seri sistemi, grace period, telafi hakkı ve milestone bonusları.',
      icon: 'fa-solid fa-fire',
      href: '/help/streak',
      color: 'red' as const,
      articleCount: 1
    },
    {
      title: 'Circle Rehberi',
      description: 'Circle nedir, nasıl katılınır/oluşturulur, görev sistemi ve sohbet özellikleri.',
      icon: 'fa-solid fa-users',
      href: '/help/circles',
      color: 'blue' as const,
      articleCount: 1
    },
    {
      title: 'Uzmanlarla Çalışma',
      description: 'Uzman bulma, hizmet satın alma, özel plan alma ve onaylı danışan olma.',
      icon: 'fa-solid fa-user-doctor',
      href: '/help/experts',
      color: 'purple' as const,
      articleCount: 1
    },
    {
      title: 'Uzman (Pro) Rehberi',
      description: 'Danışan yönetimi, plan oluşturma, gelir yönetimi ve onaylı uzman olma.',
      icon: 'fa-solid fa-briefcase',
      href: '/help/pro',
      color: 'purple' as const,
      articleCount: 5
    },
    {
      title: 'Sıkça Sorulan Sorular',
      description: 'En sık merak edilen sorular ve cevapları burada.',
      icon: 'fa-solid fa-circle-question',
      href: '/help/faq',
      color: 'blue' as const,
      articleCount: 1
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HelpHero />

      {/* Categories Section */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-gray-800 mb-2">Kategoriler</h2>
          <p className="text-gray-600 font-bold">İhtiyacın olan bilgiyi bul</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <HelpCategoryCard key={index} {...category} />
          ))}
        </div>
      </section>

      {/* Quick Help Section */}
      <section className="py-16 bg-white border-y-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-800 mb-2">Hızlı Yardım</h2>
            <p className="text-gray-600 font-bold">En sık aranan konular</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Nasıl puan kazanırım?', href: '/help/score-system', icon: 'fa-solid fa-star' },
              { label: 'Circle nasıl oluştururum?', href: '/help/circles', icon: 'fa-solid fa-users' },
              { label: 'Seviye nasıl atlarım?', href: '/help/levels', icon: 'fa-solid fa-arrow-up' },
              { label: 'Streak nedir?', href: '/help/streak', icon: 'fa-solid fa-fire' }
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-rejimde-blue hover:bg-blue-50 transition group"
              >
                <i className={`${item.icon} text-2xl text-rejimde-blue group-hover:scale-110 transition`}></i>
                <span className="font-bold text-gray-700 group-hover:text-rejimde-blue text-sm">
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-rejimde-green to-rejimde-blue rounded-3xl p-10 text-center text-white shadow-float">
          <i className="fa-solid fa-headset text-5xl mb-4 opacity-90"></i>
          <h2 className="text-3xl font-black mb-3">Hala yardıma mı ihtiyacın var?</h2>
          <p className="text-lg font-bold mb-6 opacity-90">
            Destek ekibimiz senin için burada! Bize ulaş, yardımcı olalım.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-rejimde-green px-8 py-4 rounded-2xl font-extrabold shadow-btn shadow-gray-800 btn-game hover:bg-gray-100 transition"
          >
            <i className="fa-solid fa-envelope mr-2"></i>
            İletişime Geç
          </a>
        </div>
      </section>
    </div>
  );
}
