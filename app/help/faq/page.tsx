import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpFAQ from '@/components/help/HelpFAQ';
import HelpSidebar from '@/components/help/HelpSidebar';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
  description: 'Rejimde hakkında en sık merak edilen sorular ve cevapları.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'Rejimde ücretsiz mi?',
      answer: 'Evet! Rejimde temel özellikleri tamamen ücretsiz. Diyet ve egzersiz takibi, circle\'lara katılma, blog okuma ve puan kazanma gibi tüm temel özellikler ücretsiz. Uzmanlardan özel hizmet almak istersen ücretli paketler de mevcut.'
    },
    {
      question: 'Puan sistemi nasıl çalışır?',
      answer: 'Reji Score, 0-100 arası bir puandır. Blog okuma, diyet tamamlama, egzersiz yapma ve günlük giriş yaparak puan kazanırsın. Puanların son 30 günlük aktivitelerine göre hesaplanır. Daha fazla bilgi için <a href="/help/score-system" class="text-rejimde-blue font-black hover:underline">Puan Sistemi rehberine</a> göz at.'
    },
    {
      question: 'Circle nedir ve nasıl katılırım?',
      answer: 'Circle\'lar, benzer hedeflere sahip kullanıcıların bir araya geldiği topluluklar. Circle sayfasından mevcut circle\'ları görebilir ve katılabilirsin. Kendi circle\'ını da oluşturabilirsin! Detaylı bilgi için <a href="/help/circles" class="text-rejimde-blue font-black hover:underline">Circle Rehberi\'ni</a> oku.'
    },
    {
      question: 'Streak (günlük seri) nedir?',
      answer: 'Streak, arka arkaya kaç gün platforma giriş yaptığını ve aktivite gerçekleştirdiğini gösteren bir sayaçtır. Her gün en az bir aktivite yaparak streak\'ini sürdürebilirsin. Uzun streak\'ler bonus puanlar kazandırır!'
    },
    {
      question: 'Seviye nasıl atlarım?',
      answer: 'Seviye atlamak için puan kazanman gerekiyor. Begin (0-200), Adapt (200-300), Grow (300-400) gibi seviyeler var. Her seviye atlayışında bonus puan ve özel rozetler kazanırsın. <a href="/help/levels" class="text-rejimde-blue font-black hover:underline">Seviye Sistemi</a> sayfasında tüm seviyeleri görebilirsin.'
    },
    {
      question: 'Uzman olarak nasıl katılabilirim?',
      answer: 'Diyetisyen, spor eğitmeni veya sağlık uzmanıysan <a href="/register/pro" class="text-rejimde-blue font-black hover:underline">Uzman Kayıt</a> sayfasından başvurabilirsin. Danışanlarını ücretsiz yönetebilir, plan oluşturabilir ve gelir elde edebilirsin.'
    },
    {
      question: 'Onaylı uzman olmanın avantajları nedir?',
      answer: 'Onaylı uzmanlar profillerinde özel rozet alır, arama sonuçlarında üstte görünür ve +20 bonus puan kazanır. Onaylı uzman olmak için sertifikalarını yüklemen ve doğrulama sürecinden geçmen gerekiyor.'
    },
    {
      question: 'Diyet ve egzersiz programları ücretli mi?',
      answer: 'Platform üzerindeki temel diyet ve egzersiz programları ücretsiz. Uzmanlar tarafından özel hazırlanan kişiselleştirilmiş planlar ise ücretli olabilir. Her uzman kendi fiyatlandırmasını belirler.'
    },
    {
      question: 'Danışanlarımı nasıl yönetirim?',
      answer: 'Uzman hesabınla giriş yaptıktan sonra Uzman Paneli\'ne git. Buradan danışanlarını ekleyebilir, segmentlere ayırabilir, plan oluşturabilir ve ilerlemeyi takip edebilirsin. <a href="/help/pro/clients" class="text-rejimde-blue font-black hover:underline">Danışan Yönetimi rehberine</a> göz at.'
    },
    {
      question: 'Grace period (telafi hakkı) nedir?',
      answer: 'Grace period, streak\'ini kaybetmeden önce tanınan 1 günlük telafi hakkıdır. Örneğin bir gün aktivite yapamadıysan, ertesi gün telafi ederek streak\'ini koruyabilirsin.'
    },
    {
      question: 'Kazandığım puanları nasıl kullanabilirim?',
      answer: 'Puanlar seviye atlaman için kullanılır. Yüksek puanlar sayesinde circle\'ında öne çıkar, özel rozetler kazanır ve platforma erken erişim gibi avantajlardan faydalanırsın.'
    },
    {
      question: 'Hesabımı nasıl silerim?',
      answer: 'Hesap silme işlemi için Ayarlar > Hesap > Hesabı Sil bölümünden işlemi gerçekleştirebilirsin. Hesabını sildiğinde tüm veriler kalıcı olarak silinir. Bu işlem geri alınamaz.'
    },
    {
      question: 'Teknik destek nasıl alabilirim?',
      answer: 'Herhangi bir sorun yaşarsan <a href="/contact" class="text-rejimde-blue font-black hover:underline">İletişim sayfasından</a> bize ulaşabilirsin. Destek ekibimiz en kısa sürede geri dönüş yapacaktır.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Sıkça Sorulan Sorular' }]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <HelpSidebar />
          </div>

          <div className="lg:col-span-9">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-card mb-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <i className="fa-solid fa-circle-question text-3xl text-rejimde-blue"></i>
                </div>
                <h1 className="text-3xl font-black text-gray-800 mb-2">Sıkça Sorulan Sorular</h1>
                <p className="text-gray-600 font-bold">
                  Merak ettiğin her şey burada! Sorunun yoksa <a href="/contact" className="text-rejimde-blue hover:underline">bize ulaş</a>.
                </p>
              </div>

              <HelpFAQ faqs={faqs} />
            </div>

            {/* Still have questions CTA */}
            <div className="bg-gradient-to-r from-rejimde-green to-rejimde-blue rounded-3xl p-8 text-center text-white">
              <i className="fa-solid fa-headset text-4xl mb-4"></i>
              <h3 className="text-2xl font-black mb-2">Hala sorun var mı?</h3>
              <p className="font-bold mb-5 opacity-90">
                Destek ekibimiz sana yardımcı olmak için burada!
              </p>
              <a
                href="/contact"
                className="inline-block bg-white text-rejimde-green px-8 py-3 rounded-2xl font-extrabold shadow-btn shadow-gray-800 btn-game hover:bg-gray-100"
              >
                <i className="fa-solid fa-envelope mr-2"></i>
                Bize Ulaş
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
