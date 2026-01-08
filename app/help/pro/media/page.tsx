import { Metadata } from 'next';
import HelpBreadcrumb from '@/components/help/HelpBreadcrumb';
import HelpArticle from '@/components/help/HelpArticle';
import HelpSidebar from '@/components/help/HelpSidebar';
import HelpRelated from '@/components/help/HelpRelated';

export const metadata: Metadata = {
  title: 'Medya Kütüphanesi',
  description: 'Görselleri yükleyin, dosyalarınızı yönetin ve danışanlarınızla paylaşın.',
};

export default function ProMediaPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <HelpBreadcrumb items={[{ label: 'Uzman Rehberi', href: '/help/pro' }, { label: 'Medya Kütüphanesi' }]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><HelpSidebar /></div>

          <div className="lg:col-span-6">
            <HelpArticle 
              title="Medya Kütüphanesi" 
              description="Tüm görsellerinizi ve dosyalarınızı merkezi bir yerde saklayın ve yönetin."
              lastUpdated="8 Ocak 2026"
              articleSlug="pro-media"
            >
              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-photo-film text-indigo-500"></i>
                  Medya Kütüphanesi Nedir?
                </h2>
                <p className="mb-4">
                  Medya kütüphaneniz, görselleri, PDF'leri, videolar ve diğer dosyaları yükleyip saklayabileceğiniz merkezi bir alandır.
                </p>
                
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
                  <h3 className="font-black text-indigo-700 mb-3">Desteklenen Dosya Türleri:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <i className="fa-solid fa-image text-indigo-500"></i>
                      Görsel (JPG, PNG, GIF)
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <i className="fa-solid fa-file-pdf text-red-500"></i>
                      PDF Dökümanlar
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <i className="fa-solid fa-video text-purple-500"></i>
                      Video (MP4, MOV)
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <i className="fa-solid fa-file-word text-blue-500"></i>
                      Döküman (DOCX, TXT)
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-cloud-arrow-up text-blue-500"></i>
                  Görsel/Dosya Yükleme
                </h2>
                <p className="mb-4">Medya kütüphanenize dosya yüklemek kolaydır:</p>
                
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Medya Kütüphanesine Gidin</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Dashboard → Medya Kütüphanesi sekmesine tıklayın
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">"Yükle" Butonuna Tıklayın</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Sürükle-bırak veya dosya seçici ile yükleme yapabilirsiniz
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Dosya Bilgilerini Girin</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Başlık, açıklama ve etiketler ekleyin (isteğe bağlı)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">4</div>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Yükleme Tamamlandı</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Dosyanız kütüphanede kullanıma hazır
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 text-sm font-bold text-gray-700">
                  💡 <strong>İpucu:</strong> Birden fazla dosyayı aynı anda sürükleyip yükleyebilirsiniz!
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-folder-tree text-green-500"></i>
                  Dosya Yönetimi
                </h2>
                <p className="mb-4">Medya kütüphanenizi organize edin:</p>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-folder text-green-500"></i>
                      Klasörler
                    </h3>
                    <p className="text-sm text-gray-600 font-bold mb-3">
                      Dosyalarınızı kategorilere ayırın. Örnek: Tarifler, Egzersiz Görselleri, Sertifikalar.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-black">
                        <i className="fa-solid fa-folder mr-1"></i> Tarifler
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-black">
                        <i className="fa-solid fa-folder mr-1"></i> Egzersizler
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-black">
                        <i className="fa-solid fa-folder mr-1"></i> Form Örnekleri
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-tags text-purple-500"></i>
                      Etiketler
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Dosyalarınıza etiket ekleyerek hızlı arama ve filtreleme yapın.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-orange-400 transition">
                    <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-search text-orange-500"></i>
                      Arama
                    </h3>
                    <p className="text-sm text-gray-600 font-bold">
                      Dosya adı, etiket veya açıklama ile hızlıca arama yapın.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-share-nodes text-blue-500"></i>
                  Paylaşım ve Kullanım
                </h2>
                <p className="mb-4">Kütüphanenizdeki dosyaları nasıl kullanabilirsiniz:</p>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                  <h3 className="font-black text-blue-700 mb-3">Kullanım Alanları:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Blog yazılarında görsel ekleme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Diyet planlarına tarif fotoğrafları</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Egzersiz programlarına video ekleme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Danışanlara özel PDF gönderimi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                      <span className="font-bold text-gray-700">Profil fotoğrafı ve kapak görseli</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-hard-drive text-purple-500"></i>
                  Depolama Alanı
                </h2>
                <p className="mb-4">Her uzman hesabında belirli bir depolama alanı bulunur:</p>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Kullanılan Alan</h3>
                      <p className="text-sm text-gray-600 font-bold">1.2 GB / 5 GB</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-purple-600">24%</span>
                      <p className="text-xs text-gray-600 font-bold">Doluluk</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full" style={{width: '24%'}}></div>
                  </div>
                  <p className="text-xs text-gray-600 font-bold mt-3">
                    💡 Daha fazla alana mı ihtiyacın var? Premium plana yükselterek 20 GB'a kadar alan kazanabilirsin!
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-lightbulb text-yellow-500"></i>
                  En İyi Uygulamalar
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <i className="fa-solid fa-1 text-yellow-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Açıklayıcı İsimler Kullanın</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        "IMG_001.jpg" yerine "kahvalti-tarifi-yulaf.jpg" gibi anlaşılır isimler verin
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <i className="fa-solid fa-2 text-yellow-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Düzenli Temizlik Yapın</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Kullanılmayan dosyaları düzenli olarak silin, depolama alanınızı optimize edin
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <i className="fa-solid fa-3 text-yellow-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Görselleri Optimize Edin</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Yüklemeden önce görselleri sıkıştırın (TinyPNG gibi araçlar kullanabilirsiniz)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <i className="fa-solid fa-4 text-yellow-600 mt-1"></i>
                    <div>
                      <h3 className="font-black text-gray-800 mb-1">Telif Haklarına Dikkat Edin</h3>
                      <p className="text-sm text-gray-600 font-bold">
                        Sadece kullanma hakkına sahip olduğunuz görselleri yükleyin
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-images"></i>
                    Medyanızı Profesyonelce Yönetin!
                  </h3>
                  <p className="font-bold mb-4 opacity-90">
                    Organize bir medya kütüphanesi, içerik üretiminizi hızlandırır.
                  </p>
                  <a href="/dashboard/pro/media" className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-xl font-extrabold shadow-btn shadow-indigo-900 btn-game hover:bg-gray-100">
                    Medya Kütüphanesine Git
                  </a>
                </div>
              </section>
            </HelpArticle>
          </div>

          <div className="lg:col-span-3">
            <HelpRelated articles={[
              { title: 'Blog Yazma', href: '/help/pro', icon: 'fa-solid fa-pen-nib' },
              { title: 'Diyet Planları', href: '/help/pro/plans', icon: 'fa-solid fa-utensils' },
              { title: 'Uzman Paneli', href: '/help/pro', icon: 'fa-solid fa-briefcase' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
