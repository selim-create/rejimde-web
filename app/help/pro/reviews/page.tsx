import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Değerlendirmeler ve Yorumlar',
  description: 'Danışan değerlendirmelerini görüntüleyin, yanıt verin ve başarı hikayelerini paylaşın.',
};

export default function ProReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Değerlendirmeler' }]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>

          <div className="lg:col-span-6">
            <HelpArticle 
              title="Değerlendirmeler ve Yorumlar" 
              description="Danışanlarınızın değerlendirmelerini yönetin, yanıt verin ve güveninizi artırın."
              lastUpdated="8 Ocak 2026"
              articleSlug="pro-reviews"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-star text-yellow-500"></i>
                  Değerlendirme Sistemi
                </h2>
                <p className="mb-4">
                  Danışanlarınız, sizinle çalışma deneyimlerini 5 yıldız üzerinden değerlendirebilir ve yorum yazabilir.
                </p>
                
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Ortalama Puanınız</h3>
                      <p className="text-xs text-gray-600 font-bold">Son 12 aydaki değerlendirmeler</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-yellow-600 mb-1">4.8</div>
                      <div className="flex gap-1">
                        <i className="fa-solid fa-star text-yellow-400"></i>
                        <i className="fa-solid fa-star text-yellow-400"></i>
                        <i className="fa-solid fa-star text-yellow-400"></i>
                        <i className="fa-solid fa-star text-yellow-400"></i>
                        <i className="fa-solid fa-star text-yellow-400"></i>
                      </div>
                      <p className="text-xs text-gray-600 font-bold mt-1">42 değerlendirme</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-600 w-6">5 ⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-yellow-400 h-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-8">85%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-600 w-6">4 ⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-yellow-400 h-full" style={{width: '12%'}}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-8">12%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-600 w-6">3 ⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-yellow-400 h-full" style={{width: '2%'}}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-8">2%</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-eye text-blue-500"></i>
                  Değerlendirmeleri Görüntüleme
                </h2>
                <p className="mb-4">Değerlendirmeler sayfasında tüm yorumları görebilir ve filtreleyebilirsiniz:</p>
                
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                    <h3 className="font-black text-gray-800 mb-2">Filtreleme Seçenekleri</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                        <span className="font-bold text-gray-700">Yıldız sayısına göre (5, 4, 3, 2, 1)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                        <span className="font-bold text-gray-700">Tarihe göre (en yeni, en eski)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                        <span className="font-bold text-gray-700">Yanıt durumuna göre (yanıtlanan, yanıtlanmayan)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                        <span className="font-bold text-gray-700">Onaylı danışan rozetine göre</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-reply text-purple-500"></i>
                  Yanıt Verme
                </h2>
                <p className="mb-4">
                  Değerlendirmelere yanıt vermek, profesyonelliğinizi gösterir ve Trust Score'unuzu artırır.
                </p>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 mb-4">
                  <h3 className="font-black text-purple-700 mb-3">İyi Yanıt İpuçları:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Teşekkür ederek başlayın</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Kişiselleştirin (danışanın adını kullanın)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Olumsuz yorumlara yapıcı yaklaşın</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Profesyonel ve samimi bir ton kullanın</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                  <h3 className="font-black text-gray-800 mb-3">Örnek Yanıt:</h3>
                  <div className="bg-gray-50 border-l-4 border-purple-500 p-4 rounded-r-xl">
                    <p className="text-sm font-bold text-gray-700 italic">
                      "Sevgili Ayşe Hanım, değerli geri bildiriminiz için çok teşekkür ederim! 
                      Hedeflerinize ulaşmanızda size yardımcı olmak benim için büyük bir mutluluktu. 
                      Gelişiminizi sürdürmenizi dilerim. 💪"
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-badge-check text-green-500"></i>
                  Onaylı Danışan Rozeti
                </h2>
                <p className="mb-4">
                  Sizinle 3 ay veya daha uzun süre çalışan danışanların değerlendirmeleri "Onaylı Danışan" rozeti ile işaretlenir.
                </p>

                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      ✅
                    </div>
                    <div>
                      <h3 className="font-black text-green-700 mb-2">Onaylı Danışan Avantajı</h3>
                      <p className="text-sm text-gray-700 font-bold mb-3">
                        Bu rozet, yorumun uzun süreli bir danışandan geldiğini gösterir ve güvenilirliği artırır.
                      </p>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start gap-2">
                          <i className="fa-solid fa-check text-green-500 mt-1"></i>
                          <span className="font-bold text-gray-700">Potansiyel danışanlar için daha değerli</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="fa-solid fa-check text-green-500 mt-1"></i>
                          <span className="font-bold text-gray-700">Trust Score'a daha fazla katkı sağlar</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-trophy text-yellow-500"></i>
                  Başarı Hikayeleri
                </h2>
                <p className="mb-4">
                  Öne çıkan başarılı danışan hikayelerini profilinizde sergileyebilirsiniz.
                </p>

                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <h3 className="font-black text-gray-800 mb-3">Başarı Hikayesi Oluşturma</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0 text-xs">1</div>
                        <span className="font-bold text-gray-700">Danışanınızdan izin alın</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0 text-xs">2</div>
                        <span className="font-bold text-gray-700">Başarı detaylarını ve fotoğrafları ekleyin</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0 text-xs">3</div>
                        <span className="font-bold text-gray-700">Yayınlayın ve profilinizde sergileyin</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm font-bold text-gray-700">
                    💡 <strong>İpucu:</strong> Fotoğraflı başarı hikayeleri %300 daha fazla ilgi çeker!
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-star"></i>
                    Değerlendirmeler Gücünüz!
                  </h3>
                  <p className="font-bold mb-4 opacity-90">
                    Pozitif değerlendirmeler, yeni danışanlar kazanmanın en etkili yolu.
                  </p>
                  <a href="/dashboard/pro/reviews" className="inline-block bg-white text-orange-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-orange-900 btn-game hover:bg-gray-100">
                    Değerlendirmeleri Gör
                  </a>
                </div>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'RejiScore Sistemi', href: '/help/pro/reji-score', icon: 'fa-solid fa-star' },
              { title: 'Danışan Yönetimi', href: '/help/pro/clients', icon: 'fa-solid fa-users' },
              { title: 'Uzman Paneli', href: '/help/pro', icon: 'fa-solid fa-briefcase' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
