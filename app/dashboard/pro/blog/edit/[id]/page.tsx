"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { earnPoints } from "@/lib/api";
import MascotDisplay from "@/components/MascotDisplay";
import CommentsSection from "@/components/CommentsSection"; // Modüler Yorumlar

interface ClientBlogPostProps {
  post: any;
  relatedPosts: any[];
  formattedTitle: React.ReactNode;
}

// URL Slug Yardımcısı (İsimden slug üretmek için)
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export default function ClientBlogPost({ post, relatedPosts, formattedTitle }: ClientBlogPostProps) {
  const router = useRouter();
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Ödül Modal State
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardMessage, setRewardMessage] = useState({ title: "", desc: "", points: 0 });
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  
  // Bilgi/Uyarı Modal State
  const [infoModal, setInfoModal] = useState<{show: boolean, title: string, message: string, type: 'error' | 'success' | 'info'}>({
    show: false, title: "", message: "", type: "info"
  });
  
  // Kullanıcı State'i (Edit butonu ve linkleme için)
  const [currentUser, setCurrentUser] = useState<{ role: string, name: string } | null>(null);

  useEffect(() => {
      // Kullanıcı bilgisini al
      if (typeof window !== 'undefined') {
          const role = localStorage.getItem('user_role') || '';
          const name = localStorage.getItem('user_name') || '';
          if (role) setCurrentUser({ role, name });

          const claimedPosts = JSON.parse(localStorage.getItem('claimed_posts') || '[]');
          if (claimedPosts.includes(post.id)) {
              setHasClaimed(true);
          }
      }
  }, [post.id]);

  // Okuma İlerlemesi
  useEffect(() => {
    const updateScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'info' = 'info') => {
      setInfoModal({ show: true, title, message, type });
  };

  // Puan Kazanma (MODAL İLE)
  const handleClaimReward = async () => {
      if (hasClaimed) return;
      setClaiming(true);
      
      const res = await earnPoints('read_blog', post.id);
      
      if (res.success) {
          setHasClaimed(true);
          const claimedPosts = JSON.parse(localStorage.getItem('claimed_posts') || '[]');
          claimedPosts.push(post.id);
          localStorage.setItem('claimed_posts', JSON.stringify(claimedPosts));

          setRewardMessage({
              title: "Harikasın! 🎉",
              desc: `Bu yazıyı tamamladın ve ${res.data.earned} Puan kazandın!`,
              points: res.data.earned
          });
          setShowRewardModal(true);
      } else {
          // Zaten almışsa
          if (res.message?.includes('zaten')) {
              setHasClaimed(true);
              setRewardMessage({
                  title: "Daha Önce Aldın 😎",
                  desc: "Bu yazının puanını zaten kapmışsın. Başka yazılara göz at!",
                  points: 0
              });
              setShowRewardModal(true);
          } else {
              showAlert("Hata", res.message || "Bir hata oluştu.", "error");
          }
      }
      setClaiming(false);
  };

  const categoryName = post.category ? 
    <span dangerouslySetInnerHTML={{ __html: post.category }} /> : "Genel";

  // Düzenleme Yetkisi Kontrolü
  const canEdit = currentUser && (
      currentUser.role === 'administrator' || 
      (currentUser.role === 'rejimde_pro' && post.author_name === currentUser.name)
  );

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-20 left-0 w-full h-1.5 bg-gray-100 z-40">
        <div className="h-full bg-rejimde-blue rounded-r-full shadow-[0_0_10px_#1cb0f6] transition-all duration-100 ease-out" style={{ width: `${readingProgress}%` }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Article Content */}
          <article className="lg:col-span-8 relative">
              
              {/* Edit Button (Yetkiliye Özel) */}
              {canEdit && (
                  <Link href={`/dashboard/pro/blog/edit/${post.id}`} className="absolute top-0 right-0 bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-rejimde-blue hover:text-white transition flex items-center gap-2 z-10">
                      <i className="fa-solid fa-pen"></i> Düzenle
                  </Link>
              )}

              {/* Header */}
              <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                      <span className="bg-blue-50 text-rejimde-blue px-3 py-1 rounded-lg text-xs font-black uppercase">{categoryName}</span>
                      <span className="text-gray-400 text-xs font-bold"><i className="fa-regular fa-clock mr-1"></i> {post.read_time} okuma</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-gray-800 leading-tight mb-6">
                      {formattedTitle}
                  </h1>
                  
                  {/* Author Mini (Mobile) */}
                  <div className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl lg:hidden">
                      <img src={post.author_avatar} className="w-12 h-12 rounded-xl border-2 border-white shadow-sm object-cover" alt={post.author_name} />
                      <div>
                          {/* YENİ: Doğru Linkleme */}
                          <Link 
                            href={post.author_is_expert ? `/experts/${post.author_slug}` : `/profile/${post.author_slug}`}
                            className="font-extrabold text-gray-700 hover:text-rejimde-blue block"
                          >
                              {post.author_name}
                          </Link>
                          <div className="text-xs font-bold text-rejimde-blue">Yazar</div>
                      </div>
                  </div>
              </div>

              {/* Featured Image */}
              <div className="w-full h-80 bg-gray-200 rounded-3xl mb-10 overflow-hidden border-2 border-gray-200 relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="Featured" />
                  {!hasClaimed && (
                      <div className="absolute top-4 right-4 bg-rejimde-yellow text-white px-4 py-2 rounded-xl font-black text-sm shadow-btn shadow-yellow-600 rotate-3 border border-white/20 animate-pulse">
                          <i className="fa-solid fa-star mr-1"></i> +10 Puan Fırsatı
                      </div>
                  )}
              </div>

              {/* Content */}
              <div className="bg-white border-2 border-gray-100 p-6 md:p-10 rounded-3xl shadow-sm prose prose-lg prose-headings:font-black prose-headings:text-gray-800 prose-p:text-gray-500 prose-p:font-medium prose-p:leading-relaxed prose-a:text-rejimde-blue prose-a:font-bold prose-img:rounded-2xl prose-strong:text-gray-700 max-w-none [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl"
                   dangerouslySetInnerHTML={{ __html: post.content }}>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                      {post.tags.map((tag: any, idx: number) => (
                          <span key={idx} className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold">#{tag.name || tag}</span>
                      ))}
                  </div>
              )}

              {/* Gamification Reward */}
              <div className="mt-8 bg-rejimde-purple text-white rounded-3xl p-8 text-center shadow-float relative overflow-hidden group cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                  
                  {hasClaimed ? (
                      <div className="animate-fadeIn">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40">
                              <i className="fa-solid fa-check text-3xl"></i>
                          </div>
                          <h3 className="text-2xl font-black mb-2">Harikasın!</h3>
                          <p className="font-bold text-purple-100">Bu yazıyı tamamladın.</p>
                      </div>
                  ) : (
                      <>
                          <h3 className="text-2xl font-black mb-2">Tebrikler! 🎉</h3>
                          <p className="font-bold text-purple-100 mb-6">Bu yazıyı okuyarak bir şeyler öğrendin.</p>
                          <button 
                            onClick={handleClaimReward} 
                            disabled={claiming} 
                            className="bg-white text-rejimde-purple px-8 py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-purple-900/30 btn-game uppercase tracking-wide group-hover:scale-105 transition disabled:opacity-70"
                          >
                              {claiming ? 'İşleniyor...' : '+10 Puanımı Al'}
                          </button>
                      </>
                  )}
              </div>

              {/* COMMENTS SECTION (MODÜLER) */}
              <CommentsSection postId={post.id} />

          </article>

          {/* RIGHT: Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
              
              {/* Author Profile Card */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 sticky top-24 shadow-card text-center z-10">
                  <div className="w-24 h-24 mx-auto bg-gray-200 rounded-2xl border-4 border-white shadow-md overflow-hidden mb-4 relative group">
                      <img src={post.author_avatar} className="w-full h-full object-cover" alt={post.author_name} />
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-rejimde-green border-2 border-white rounded-full"></div>
                  </div>
                  
                  {/* YENİ: Doğru Linkleme */}
                  <Link 
                    href={post.author_is_expert ? `/experts/${post.author_slug}` : `/profile/${post.author_slug}`}
                    className="text-xl font-extrabold text-gray-800 mb-1 hover:text-rejimde-blue transition block"
                  >
                      {post.author_name}
                  </Link>
                  <p className="text-gray-400 font-bold text-sm mb-6">Yazar • {categoryName}</p>
                  
                  <button className="bg-rejimde-green text-white w-full py-3 rounded-xl font-extrabold shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide mb-3">
                      Takip Et
                  </button>
              </div>

              {/* Related Posts */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 relative z-0">
                  <h3 className="font-extrabold text-gray-400 text-xs uppercase mb-4">Bunları da Oku</h3>
                  <div className="space-y-4">
                      {relatedPosts.map((relPost: any) => (
                          <Link href={`/blog/${relPost.slug}`} key={relPost.id} className="flex gap-3 group">
                              <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0 border-2 border-transparent group-hover:border-rejimde-blue transition overflow-hidden relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={relPost.image} 
                                    alt={relPost.title} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Blog" }}
                                  />
                              </div>
                              <div>
                                  <h4 className="font-extrabold text-gray-700 text-sm leading-tight group-hover:text-rejimde-blue transition line-clamp-2">
                                      {relPost.title}
                                  </h4>
                                  <span className="text-xs font-bold text-gray-400">{relPost.read_time} okuma</span>
                              </div>
                          </Link>
                      ))}
                  </div>
              </div>

          </aside>

      </div>

      {/* REWARD SUCCESS MODAL */}
      {showRewardModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setShowRewardModal(false)}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-bounce-slow" onClick={e => e.stopPropagation()}>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-green-500">
                    <i className={`fa-solid ${rewardMessage.points > 0 ? 'fa-gift' : 'fa-check'} text-4xl`}></i>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">{rewardMessage.title}</h3>
                <p className="text-gray-500 font-bold mb-6 text-sm">{rewardMessage.desc}</p>
                <div className="flex justify-center mb-6">
                     <MascotDisplay state={rewardMessage.points > 0 ? "success_milestone" : "idle_dashboard"} size={120} showBubble={false} />
                </div>
                <button onClick={() => setShowRewardModal(false)} className="w-full bg-rejimde-text text-white py-3 rounded-xl font-extrabold shadow-btn btn-game uppercase">Harika!</button>
            </div>
        </div>
      )}

      {/* INFO MODAL */}
      {infoModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setInfoModal({...infoModal, show: false})}>
              <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 text-center animate-bounce-slow" onClick={e => e.stopPropagation()}>
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${infoModal.type === 'error' ? 'bg-red-100 text-red-500' : (modal.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-blue-100 text-blue-500')}`}>
                        <i className={`fa-solid ${infoModal.type === 'error' ? 'fa-triangle-exclamation' : (modal.type === 'success' ? 'fa-check' : 'fa-info')} text-3xl`}></i>
                   </div>
                   <h3 className="text-xl font-black text-gray-800 mb-2">{infoModal.title}</h3>
                   <p className="text-gray-500 font-bold mb-6 text-sm">{infoModal.message}</p>
                   
                   {infoModal.title.includes("Giriş") ? (
                       <div className="flex gap-3">
                           <button onClick={() => setInfoModal({...infoModal, show: false})} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-bold btn-game">İptal</button>
                           <Link href="/login" className="flex-1 bg-rejimde-blue text-white py-3 rounded-xl font-extrabold shadow-btn btn-game uppercase text-center">Giriş Yap</Link>
                       </div>
                   ) : (
                       <button onClick={() => setInfoModal({...infoModal, show: false})} className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-extrabold btn-game uppercase">Tamam</button>
                   )}
              </div>
          </div>
      )}
    </>
  );
}