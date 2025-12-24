"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { earnPoints, getProgress, claimReward } from "@/lib/api";
import MascotDisplay from "@/components/MascotDisplay";
import CommentsSection from "@/components/CommentsSection";
import AuthorCard from "@/components/AuthorCard"; // YENİ BİLEŞEN
import { getUserProfileUrl } from "@/lib/helpers";

interface ClientBlogPostProps {
  post: any;
  relatedPosts: any[];
  formattedTitle: React.ReactNode;
}

// DETAYLI UZMANLIK KATEGORİLERİ
const SPECIALTY_CATEGORIES = [
    {
        title: "Beslenme",
        items: [{ id: "dietitian_spec", label: "Diyetisyen" }, { id: "dietitian", label: "Diyetisyen" }]
    },
    {
        title: "Hareket",
        items: [
            { id: "pt", label: "PT / Fitness Koçu" },
            { id: "yoga", label: "Yoga / Pilates" },
            { id: "functional", label: "Fonksiyonel Antrenman" },
            { id: "swim", label: "Yüzme Eğitmeni" },
            { id: "run", label: "Koşu Eğitmeni" },
            { id: "trainer", label: "Antrenör" }
        ]
    },
    {
        title: "Zihin & Alışkanlık",
        items: [
            { id: "life_coach", label: "Yaşam Koçu" },
            { id: "breath", label: "Nefes & Meditasyon" },
            { id: "psychologist", label: "Psikolog" }
        ]
    },
    {
        title: "Sağlık Destek",
        items: [
            { id: "physio", label: "Fizyoterapist" },
            { id: "doctor", label: "Doktor" }
        ]
    },
    {
        title: "Kardiyo & Güç",
        items: [
            { id: "box", label: "Boks / Kickboks" },
            { id: "defense", label: "Savunma & Kondisyon" }
        ]
    }
];

// Meslek ID'sine göre Türkçe Etiket Bulucu
const getProfessionLabel = (slug: string = '') => {
    if (!slug) return '';
    const slugLower = slug.toLowerCase();
    
    for (const cat of SPECIALTY_CATEGORIES) {
        const found = cat.items.find(item => item.id === slugLower || slugLower.includes(item.id));
        if (found) return found.label;
    }
    // Eşleşme yoksa slug'ı biraz düzelterek göster
    return slug.charAt(0).toUpperCase() + slug.slice(1);
};

// URL Slug Yardımcısı (Fallback)
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Boşlukları - yap
    .replace(/[^\w\-]+/g, '') // Alfanümerik olmayanları sil
    .replace(/\-\-+/g, '-');  // Tekrar eden - leri sil
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

  // Kullanıcı State'i
  const [currentUser, setCurrentUser] = useState<{ role: string, name: string, id: number, avatar: string } | null>(null);

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

  // Check if user has already claimed reward via API
  const checkRewardStatus = useCallback(async () => {
      try {
          const progressData = await getProgress('blog', post.id);
          if (progressData && progressData.reward_claimed) {
              setHasClaimed(true);
          }
      } catch (e) {
          // Fallback to localStorage
          const claimedPosts = JSON.parse(localStorage.getItem('claimed_posts') || '[]');
          if (claimedPosts.includes(post.id)) {
              setHasClaimed(true);
          }
      }
  }, [post.id]);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          // 1. Mevcut Kullanıcı Bilgisi
          const role = localStorage.getItem('user_role') || '';
          const name = localStorage.getItem('user_name') || '';
          const id = parseInt(localStorage.getItem('user_id') || '0');
          const avatar = localStorage.getItem('user_avatar') || `https://api.dicebear.com/9.x/personas/svg?seed=${name || 'guest'}`;
          
          if (role) {
              setCurrentUser({ role, name, id, avatar });
              checkRewardStatus();
          } else {
              // Guest user - localStorage fallback
              const claimedPosts = JSON.parse(localStorage.getItem('claimed_posts') || '[]');
              if (claimedPosts.includes(post.id)) {
                  setHasClaimed(true);
              }
          }

          // 3. Yazar Bilgisini Doğrula (API'den Rol, Slug ve Diğer Verileri Çek)
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
                          
                          // Uzmanlık Alanı
                          let profession = '';
                          if (isPro) {
                              // API'den gelen profession slug'ını Türkçe etikete çevir
                              const rawProfession = user.profession || ''; 
                              profession = getProfessionLabel(rawProfession) || 'Uzman'; 
                          }

                          setAuthorDetail({
                              id: user.id,
                              name: user.name,
                              slug: user.slug,
                              avatar: avatar,
                              isExpert: isPro,
                              isVerified: isPro, // Pro ise onaylı sayalım şimdilik
                              role: isPro ? 'rejimde_pro' : 'rejimde_user',
                              profession: profession,
                              level: user.rejimde_level || 5, 
                              score: user.rejimde_score || 1250,
                              articleCount: user.posts_count || 12, // API'den gelen post sayısı veya mock
                              followers_count: user.followers_count || 0, 
                              high_fives: user.high_fives || 0, 
                              is_following: false 
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

  const handleClaimReward = async () => {
      if (hasClaimed) return;
      setClaiming(true);
      
      // Try new Progress API first
      if (currentUser) {
          try {
              const result = await claimReward('blog', post.id);
              if (result.success) {
                  setHasClaimed(true);
                  // Also update localStorage as fallback
                  const claimedPosts = JSON.parse(localStorage.getItem('claimed_posts') || '[]');
                  claimedPosts.push(post.id);
                  localStorage.setItem('claimed_posts', JSON.stringify(claimedPosts));
                  
                  setRewardMessage({
                      title: "Harikasın! 🎉",
                      desc: `Bu yazıyı tamamladın ve ${result.data?.earned || 10} Puan kazandın!`,
                      points: result.data?.earned || 10
                  });
                  setShowRewardModal(true);
                  setClaiming(false);
                  return;
              }
          } catch (e) {
              console.error('Progress API error, falling back to old method:', e);
          }
      }
      
      // Fallback to old earnPoints API
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
          if (res.message?.includes('zaten')) {
              setHasClaimed(true);
              setRewardMessage({
                  title: "Daha Önce Aldın 😎",
                  desc: "Bu yazının puanını zaten kapmışsın. Başka yazılara göz at!",
                  points: 0
              });
              setShowRewardModal(true);
          } else {
              setInfoModal({ show: true, title: "Hata", message: res.message || "Bir hata oluştu.", type: "error" });
          }
      }
      setClaiming(false);
  };

  const categoryName = post.category ? 
    <span dangerouslySetInnerHTML={{ __html: post.category }} /> : 
    "Genel";

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-20 left-0 w-full h-1.5 bg-gray-100 z-40">
        <div className="h-full bg-rejimde-blue rounded-r-full shadow-[0_0_10px_#1cb0f6] transition-all duration-100 ease-out" style={{ width: `${readingProgress}%` }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Article Content */}
          <article className="lg:col-span-8 relative">
              
              {/* Edit Button */}
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={authorDetail.avatar}
                        className="w-12 h-12 rounded-xl border-2 border-white shadow-sm object-cover" 
                        alt={authorDetail.name}
                      />
                      <div>
                          <Link 
                             href={getUserProfileUrl(authorDetail.slug, authorDetail.isExpert)} 
                             className="font-extrabold text-gray-700 hover:text-rejimde-blue transition block"
                          >
                              {authorDetail.name}
                          </Link>
                          <div className="text-xs font-bold text-rejimde-blue">{authorDetail.isExpert ? 'Uzman Yazar' : 'Yazar'}</div>
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

              {/* COMMENTS SECTION - NEW */}
              <section className="mt-16">
                 <CommentsSection 
                    postId={post.id} 
                    context="blog" 
                    title="Yorumlar"
                    allowRating={false} 
                  />
              </section>

          </article>

          {/* RIGHT: Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
              
              {/* YENİ: Ortak Author Card */}
              <div className="sticky top-24 z-10">
                  <AuthorCard author={authorDetail} context="Yazar" />
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
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${infoModal.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                        <i className={`fa-solid ${infoModal.type === 'error' ? 'fa-triangle-exclamation' : (infoModal.type === 'success' ? 'fa-check' : 'fa-info')} text-3xl`}></i>
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