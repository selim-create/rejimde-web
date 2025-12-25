"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { earnPoints, getProgress, claimReward } from "@/lib/api";
import { claimBlogPoints } from "@/lib/events";
import { usePoints } from "@/hooks/usePoints";
import PointsToast from "@/components/PointsToast";
import MascotDisplay from "@/components/MascotDisplay";
import CommentsSection from "@/components/CommentsSection";
import AuthorCard from "@/components/AuthorCard"; 
import SocialShare from "@/components/SocialShare";
import { getUserProfileUrl, getSafeAvatarUrl } from "@/lib/helpers";

interface ClientBlogPostProps {
  post: any;
  relatedPosts: any[];
  formattedTitle: React.ReactNode;
}

// URL Slug Yardımcısı
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// KATEGORİ TEMALARI
// Gelen kategori ismine göre stil döndürür. Eşleşme yoksa 'Genel' temasını kullanır.
const CATEGORY_THEMES: Record<string, { cardBorder: string, badge: string, icon: string }> = {
  'Beslenme': { cardBorder: 'hover:border-green-400', badge: 'text-green-700 bg-green-50 border border-green-200', icon: 'fa-carrot' },
  'Egzersiz': { cardBorder: 'hover:border-red-400', badge: 'text-red-700 bg-red-50 border border-red-200', icon: 'fa-dumbbell' },
  'Motivasyon': { cardBorder: 'hover:border-purple-400', badge: 'text-purple-700 bg-purple-50 border border-purple-200', icon: 'fa-fire' },
  'Tarif': { cardBorder: 'hover:border-yellow-400', badge: 'text-yellow-700 bg-yellow-50 border border-yellow-200', icon: 'fa-utensils' },
  'Tarifler': { cardBorder: 'hover:border-yellow-400', badge: 'text-yellow-700 bg-yellow-50 border border-yellow-200', icon: 'fa-utensils' },
  'Genel': { cardBorder: 'hover:border-gray-400', badge: 'text-gray-600 bg-gray-50 border border-gray-200', icon: 'fa-tag' },
  'Bilim & Mitler': { cardBorder: 'hover:border-blue-400', badge: 'text-blue-700 bg-blue-50 border border-blue-200', icon: 'fa-atom' },
  'Gerçek Hikayeler': { cardBorder: 'hover:border-orange-400', badge: 'text-orange-700 bg-orange-50 border border-orange-200', icon: 'fa-book-open' },
  'Pratik Hayat': { cardBorder: 'hover:border-teal-400', badge: 'text-teal-700 bg-teal-50 border border-teal-200', icon: 'fa-leaf' },
  'Psikoloji': { cardBorder: 'hover:border-indigo-400', badge: 'text-indigo-700 bg-indigo-50 border border-indigo-200', icon: 'fa-brain' },
};

export default function ClientBlogPost({ post, relatedPosts, formattedTitle }: ClientBlogPostProps) {
  const router = useRouter();
  const [readingProgress, setReadingProgress] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardMessage, setRewardMessage] = useState({ title: "", desc: "", points: 0 });
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [infoModal, setInfoModal] = useState<{show: boolean, title: string, message: string, type: 'error' | 'success' | 'info'}>({ show: false, title: "", message: "", type: "info" });
  const [currentUser, setCurrentUser] = useState<{ role: string, name: string, id: number, avatar: string } | null>(null);
  const { lastEarned, lastMessage, showToast, handleEventResponse, hideToast } = usePoints();

  // Yazar Detayları
  const [authorDetail, setAuthorDetail] = useState<any>({
      id: 0,
      name: post.author_name || "Yazar",
      slug: slugify(post.author_name || ""),
      avatar: post.author_avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${post.author_name}`,
      isExpert: false,
      isVerified: false,
      role: 'rejimde_user',
      profession: '', 
      level: 1, 
      score: 0,
      articleCount: 1,
      followers_count: 0,
      high_fives: 0,
      is_following: false
  });
  
  const [canEdit, setCanEdit] = useState(false);

  const checkRewardStatus = useCallback(async () => {
      try {
          const progressData = await getProgress('blog', post.id);
          if (progressData && progressData.reward_claimed) {
              setHasClaimed(true);
          }
      } catch (e) {
          const claimedPosts = JSON.parse(localStorage.getItem('claimed_posts') || '[]');
          if (claimedPosts.includes(post.id)) {
              setHasClaimed(true);
          }
      }
  }, [post.id]);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          const role = localStorage.getItem('user_role') || '';
          const name = localStorage.getItem('user_name') || '';
          const id = parseInt(localStorage.getItem('user_id') || '0');
          const avatar = localStorage.getItem('user_avatar') || `https://api.dicebear.com/9.x/personas/svg?seed=${name || 'guest'}`;
          
          if (role) {
              setCurrentUser({ role, name, id, avatar });
              checkRewardStatus();
          } else {
              const claimedPosts = JSON.parse(localStorage.getItem('claimed_posts') || '[]');
              if (claimedPosts.includes(post.id)) {
                  setHasClaimed(true);
              }
          }

          const verifyAuthor = async () => {
              try {
                  const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.rejimde.com/wp-json';
                  const res = await fetch(`${apiUrl}/wp/v2/users?search=${encodeURIComponent(post.author_name)}`);
                  
                  if (res.ok) {
                      const users = await res.json();
                      const user = users.find((u: any) => u.name === post.author_name) || users[0];
                      
                      if (user) {
                          const isPro = user.roles && user.roles.includes('rejimde_pro');
                          const avatar = user.avatar_url || user.avatar_urls?.['96'] || `https://api.dicebear.com/9.x/personas/svg?seed=${user.slug}`;
                          
                          setAuthorDetail({
                              id: user.id,
                              name: user.name,
                              slug: user.slug,
                              avatar: avatar,
                              isExpert: isPro,
                              isVerified: isPro,
                              role: isPro ? 'rejimde_pro' : 'rejimde_user',
                              profession: user.profession || (isPro ? 'Uzman' : ''),
                              level: user.rejimde_level || 5, 
                              score: user.rejimde_score || 0,
                              articleCount: user.posts_count || 12, 
                              followers_count: user.followers_count || 0, 
                              high_fives: user.high_fives || 0, 
                              is_following: user.is_following || false 
                          });

                          const currentRole = localStorage.getItem('user_role');
                          const currentName = localStorage.getItem('user_name');
                          if (currentRole === 'administrator' || (isPro && currentName === user.name)) {
                              setCanEdit(true);
                          }
                      }
                  }
              } catch (e) {
                  console.error("Yazar bilgileri alınamadı:", e);
              }
          };
          
          if (post.author_name) {
              verifyAuthor();
          }
      }
  }, [post.id, post.author_name, checkRewardStatus]);

  useEffect(() => {
    const updateScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  const handleClaimReward = async () => {
      if (hasClaimed) return;
      setClaiming(true);
      
      if (!currentUser) {
          setInfoModal({ show: true, title: "Hata", message: "Giriş yapmalısınız.", type: "error" });
          setClaiming(false);
          return;
      }
      
      try {
          // Use new gamification v2 API
          const isSticky = post.sticky || false;
          const response = await claimBlogPoints(post.id, isSticky);
          
          if (response.status === 'success' && response.data) {
              setHasClaimed(true);
              const claimedPosts = JSON.parse(localStorage.getItem('claimed_posts') || '[]');
              claimedPosts.push(post.id);
              localStorage.setItem('claimed_posts', JSON.stringify(claimedPosts));
              
              // Handle event response with toast
              handleEventResponse(response);
              
              // Also show reward modal
              setRewardMessage({
                  title: "Harikasın! 🎉",
                  desc: response.data.messages?.[0] || `Bu yazıyı tamamladın ve ${response.data.awarded_points_total} Puan kazandın!`,
                  points: response.data.awarded_points_total
              });
              setShowRewardModal(true);
          } else {
              // Check error message
              const errorMsg = response.message || 'Bir hata oluştu.';
              if (errorMsg.includes('zaten') || errorMsg.includes('aldın')) {
                  setHasClaimed(true);
                  setRewardMessage({
                      title: "Daha Önce Aldın 😎",
                      desc: "Bu yazının puanını zaten kapmışsın. Başka yazılara göz at!",
                      points: 0
                  });
                  setShowRewardModal(true);
              } else {
                  setInfoModal({ show: true, title: "Bilgi", message: errorMsg, type: "info" });
              }
          }
      } catch (error) {
          console.error('Blog claim error:', error);
          setInfoModal({ show: true, title: "Hata", message: "Bir hata oluştu.", type: "error" });
      }
      
      setClaiming(false);
  };

  // Check if favorited on mount
  useEffect(() => {
      if (typeof window !== 'undefined') {
          const favorites = JSON.parse(localStorage.getItem('favorite_posts') || '[]');
          setIsFavorited(favorites.includes(post.id));
      }
  }, [post.id]);

  const toggleFavorite = () => {
      if (typeof window !== 'undefined') {
          const favorites = JSON.parse(localStorage.getItem('favorite_posts') || '[]');
          if (isFavorited) {
              const updated = favorites.filter((id: number) => id !== post.id);
              localStorage.setItem('favorite_posts', JSON.stringify(updated));
              setIsFavorited(false);
              setInfoModal({ show: true, title: "Favorilerden Çıkarıldı", message: "Bu yazı favorilerinden kaldırıldı.", type: "info" });
          } else {
              favorites.push(post.id);
              localStorage.setItem('favorite_posts', JSON.stringify(favorites));
              setIsFavorited(true);
              setInfoModal({ show: true, title: "Favorilere Eklendi", message: "Bu yazı favorilerine eklendi!", type: "success" });
          }
      }
  };

  // Dinamik Kategori Teması
  const catTheme = CATEGORY_THEMES[post.category] || CATEGORY_THEMES['Genel'];
  const categoryBadge = (
    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1 ${catTheme.badge}`}>
        <i className={`fa-solid ${catTheme.icon}`}></i>
        {post.category || "Genel"}
    </span>
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
              {canEdit && (
                  <Link href={`/dashboard/pro/blog/edit/${post.id}`} className="absolute top-0 right-0 bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-rejimde-blue hover:text-white transition flex items-center gap-2 z-10">
                      <i className="fa-solid fa-pen"></i> Düzenle
                  </Link>
              )}

              <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {categoryBadge}
                      <span className="text-gray-400 text-xs font-bold"><i className="fa-regular fa-clock mr-1"></i> {post.read_time} okuma</span>
                      {!hasClaimed && (
                          <span className="bg-rejimde-yellow/10 text-rejimde-yellow border border-rejimde-yellow/30 px-3 py-1 rounded-lg text-xs font-black ml-auto">
                              <i className="fa-solid fa-star mr-1"></i> +50 Puan
                          </span>
                      )}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-gray-800 leading-tight mb-6">{formattedTitle}</h1>
                  
                  <div className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl lg:hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={authorDetail.avatar} className="w-12 h-12 rounded-xl border-2 border-white shadow-sm object-cover" alt={authorDetail.name} />
                      <div>
                          <Link href={getUserProfileUrl(authorDetail.slug, authorDetail.isExpert)} className="font-extrabold text-gray-700 hover:text-rejimde-blue transition block">{authorDetail.name}</Link>
                          <div className="text-xs font-bold text-rejimde-blue">{authorDetail.isExpert ? 'Uzman Yazar' : 'Yazar'}</div>
                      </div>
                  </div>
              </div>

              <div className="w-full h-80 bg-gray-200 rounded-3xl mb-10 overflow-hidden border-2 border-gray-200 relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="Featured" />
              </div>

              <div className="bg-white border-2 border-gray-100 p-6 md:p-10 rounded-3xl shadow-sm prose prose-lg prose-headings:font-black prose-headings:text-gray-800 prose-p:text-gray-500 prose-p:font-medium prose-p:leading-relaxed prose-a:text-rejimde-blue prose-a:font-bold prose-img:rounded-2xl prose-strong:text-gray-700 max-w-none [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl" dangerouslySetInnerHTML={{ __html: post.content }}></div>

              {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                      {post.tags.map((tag: any, idx: number) => (
                          <span key={idx} className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold">#{tag.name || tag}</span>
                      ))}
                  </div>
              )}

              {/* Social Share & Favorites */}
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gray-50 rounded-2xl border-2 border-gray-100">
                  <SocialShare url={`/blog/${post.slug}`} title={post.title} description={post.excerpt} />
                  
                  <button 
                      onClick={toggleFavorite}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition ${
                          isFavorited 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-red-300 hover:text-red-500'
                      }`}
                  >
                      <i className={`${isFavorited ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                      {isFavorited ? 'Favorilerde' : 'Favorilere Ekle'}
                  </button>
              </div>

              <div className="mt-8 bg-rejimde-purple text-white rounded-3xl p-8 text-center shadow-float relative overflow-hidden group cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                  {hasClaimed ? (
                      <div className="animate-fadeIn">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40"><i className="fa-solid fa-check text-3xl"></i></div>
                          <h3 className="text-2xl font-black mb-2">Okudun, puanı kaptın 😄</h3>
                          <p className="font-bold text-purple-100">Bu yazıyı tamamladın ve puanını aldın!</p>
                      </div>
                  ) : (
                      <>
                          <h3 className="text-2xl font-black mb-2">Tebrikler! 🎉</h3>
                          <p className="font-bold text-purple-100 mb-6">Bu yazıyı okuyarak bir şeyler öğrendin.</p>
                          <button onClick={handleClaimReward} disabled={claiming} className="bg-white text-rejimde-purple px-8 py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-purple-900/30 btn-game uppercase tracking-wide group-hover:scale-105 transition disabled:opacity-70">{claiming ? 'İşleniyor...' : '+50 Puan Al'}</button>
                      </>
                  )}
              </div>

              <section className="mt-16">
                 <CommentsSection postId={post.id} context="blog" title="Yorumlar" allowRating={false} />
              </section>
          </article>

          {/* RIGHT: Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
              <div className="sticky top-24 z-10 space-y-6">
                  {/* Ortak Yazar Kartı */}
                  <AuthorCard author={authorDetail} context="Yazar" />

                  {/* YENİ: Okuyanlar Bölümü (Mock) */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                      <h4 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">
                          <i className="fa-solid fa-book-open-reader text-rejimde-blue"></i> Okuyanlar
                      </h4>
                      <div className="flex -space-x-3 overflow-hidden mb-2 pl-2">
                          {[1,2,3,4,5].map((i) => (
                              <div key={i} className="w-10 h-10 rounded-full border-2 border-white relative block hover:scale-110 transition-transform bg-gray-100">
                                   {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=Reader${i}`} alt="Okuyucu" className="w-full h-full object-cover rounded-full" />
                              </div>
                          ))}
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                              +12
                          </div>
                      </div>
                      <p className="text-xs font-bold text-gray-400">
                          17 kişi bu yazıyı okuyup puan kazandı.
                      </p>
                  </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 relative z-0">
                  <h3 className="font-extrabold text-gray-400 text-xs uppercase mb-4">Bunları da Oku</h3>
                  <div className="space-y-4">
                      {relatedPosts.map((relPost: any) => (
                          <Link href={`/blog/${relPost.slug}`} key={relPost.id} className={`flex gap-3 group p-2 rounded-xl transition border border-transparent ${CATEGORY_THEMES[relPost.category || 'Genel']?.cardBorder || 'hover:border-gray-300'}`}>
                              <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0 border-2 border-transparent group-hover:border-rejimde-blue transition overflow-hidden relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={relPost.image} alt={relPost.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Blog" }} />
                              </div>
                              <div>
                                  <h4 className="font-extrabold text-gray-700 text-sm leading-tight group-hover:text-rejimde-blue transition line-clamp-2">{relPost.title}</h4>
                                  <span className="text-xs font-bold text-gray-400">{relPost.read_time} okuma</span>
                              </div>
                          </Link>
                      ))}
                  </div>
              </div>
          </aside>
      </div>

      {showRewardModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setShowRewardModal(false)}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-bounce-slow" onClick={e => e.stopPropagation()}>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-green-500"><i className={`fa-solid ${rewardMessage.points > 0 ? 'fa-gift' : 'fa-check'} text-4xl`}></i></div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">{rewardMessage.title}</h3>
                <p className="text-gray-500 font-bold mb-6 text-sm">{rewardMessage.desc}</p>
                <div className="flex justify-center mb-6"><MascotDisplay state={rewardMessage.points > 0 ? "success_milestone" : "idle_dashboard"} size={120} showBubble={false} /></div>
                <button onClick={() => setShowRewardModal(false)} className="w-full bg-rejimde-text text-white py-3 rounded-xl font-extrabold shadow-btn btn-game uppercase">Harika!</button>
            </div>
        </div>
      )}

      {infoModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setInfoModal({...infoModal, show: false})}>
              <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 text-center animate-bounce-slow" onClick={e => e.stopPropagation()}>
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${infoModal.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}><i className={`fa-solid ${infoModal.type === 'error' ? 'fa-triangle-exclamation' : (infoModal.type === 'success' ? 'fa-check' : 'fa-info')} text-3xl`}></i></div>
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
      
      {showToast && <PointsToast points={lastEarned} message={lastMessage} onClose={hideToast} />}
    </>
  );
}