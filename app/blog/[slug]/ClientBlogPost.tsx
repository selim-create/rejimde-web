"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { earnPoints, getComments, createComment, getProgress, claimReward } from "@/lib/api";
import MascotDisplay from "@/components/MascotDisplay";
import CommentsSection from "@/components/CommentsSection";
import { getUserProfileUrl } from "@/lib/helpers";

interface ClientBlogPostProps {
  post: any;
  relatedPosts: any[];
  formattedTitle: React.ReactNode;
}

// HTML Entity Decode Yardımcısı (SSR Uyumlu)
const decodeHtml = (html: string) => {
  if (typeof window === "undefined" || !html) return html; 
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// "Zaman Önce" Hesaplayıcısı
const timeAgo = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Şimdi";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
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
  
  // Yorum State'leri
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [replyTo, setReplyTo] = useState<{id: number, user: string} | null>(null);

  // Kullanıcı State'i
  const [currentUser, setCurrentUser] = useState<{ role: string, name: string, id: number, avatar: string } | null>(null);

  // Yazar ve Kullanıcı Detayları (Header için)
  const [authorDetail, setAuthorDetail] = useState({
      isExpert: false,
      slug: slugify(post.author_name || ""),
      avatar: post.author_avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${post.author_name}`
  });
  
  const [canEdit, setCanEdit] = useState(false);

  // Check if user has already claimed reward via API
  // Using useCallback to memoize the function and avoid re-creating it on every render
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
              
              // 2. Ödül Kontrolü - API'den çek
              checkRewardStatus();
          } else {
              // Guest user - localStorage fallback
              const claimedPosts = JSON.parse(localStorage.getItem('claimed_posts') || '[]');
              if (claimedPosts.includes(post.id)) {
                  setHasClaimed(true);
              }
          }

          // 3. Yazar Bilgisini Doğrula (API'den Rol ve Slug Çek)
          const verifyAuthor = async () => {
              try {
                  const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';
                  const res = await fetch(`${apiUrl}/wp/v2/users?search=${encodeURIComponent(post.author_name)}`);
                  
                  if (res.ok) {
                      const users = await res.json();
                      const user = users.find((u: any) => u.name === post.author_name) || users[0];
                      
                      if (user) {
                          const isPro = user.roles && user.roles.includes('rejimde_pro');
                          const avatar = user.avatar_url || user.avatar_urls?.['96'] || `https://api.dicebear.com/9.x/personas/svg?seed=${user.slug}`;
                          
                          setAuthorDetail({
                              isExpert: isPro,
                              slug: user.slug,
                              avatar: avatar
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

  // Yorumları Çek
  useEffect(() => {
      async function fetchComments() {
          const data = await getComments(post.id);
          const formattedComments = data.map((c: any) => {
              // Avatar Düzeltmesi: Gravatar ise DiceBear kullan
              let finalAvatar = c.avatar;
              if (!finalAvatar || finalAvatar.includes('gravatar.com') || finalAvatar.includes('placehold')) {
                  finalAvatar = `https://api.dicebear.com/9.x/personas/svg?seed=${c.user}`;
              }

              // Uzman Kontrolü (Basit Mantık): Eğer yorum yapan kişi makale yazarıysa ve yazarın unvanı varsa
              // Not: İdealde API 'user_role' dönmeli. Şimdilik isim eşleşmesiyle yazarın uzman olduğunu varsayıyoruz.
              const isAuthor = c.user === post.author_name;
              // Yazarın rolünü post verisinden çıkaramıyoruz ama genelde yazarlar uzmandır.
              const isExpertFallback = isAuthor; 

              return {
                  ...c,
                  avatar: finalAvatar,
                  timeAgo: timeAgo(c.date),
                  likes: Math.floor(Math.random() * 10),
                  isExpert: c.isExpert || isExpertFallback // API'den gelmezse fallback kullan
              };
          });
          setComments(formattedComments);
          setLoadingComments(false);
      }
      fetchComments();
  }, [post.id, post.author_name]);

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
              showAlert("Hata", res.message || "Bir hata oluştu.", "error");
          }
      }
      setClaiming(false);
  };

  const handlePostComment = async () => {
      if(!comment.trim()) return;
      
      const token = localStorage.getItem('jwt_token');
      if (!token) {
          showAlert("Giriş Yapmalısın", "Yorum yapmak için lütfen giriş yap.", "info");
          return;
      }

      setPostingComment(true);
      const contentToSend = replyTo ? `<b>@${replyTo.user}</b> ${comment}` : comment;

      const res = await createComment(post.id, contentToSend);
      
      if (res.success) {
          const isPro = currentUser?.role === 'rejimde_pro';
          const newComment = {
              ...res.data,
              timeAgo: "Şimdi",
              avatar: currentUser?.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${currentUser?.name}`,
              isExpert: isPro,
              likes: 0
          };
          setComments([newComment, ...comments]); 
          setComment("");
          setReplyTo(null);
          showAlert("Başarılı", "Yorumun paylaşıldı! +2 Puan kazandın.", "success");
      } else {
          showAlert("Hata", res.message, "error");
      }
      setPostingComment(false);
  };

  const handleLikeComment = (commentId: number) => {
      if (likedComments.includes(commentId)) return;
      setComments(comments.map(c => 
          c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
      ));
      setLikedComments([...likedComments, commentId]);
  };

  const handleReply = (commentId: number, userName: string) => {
      setReplyTo({ id: commentId, user: userName });
      const textArea = document.querySelector('textarea');
      if(textArea) {
          textArea.focus();
          textArea.scrollIntoView({ behavior: 'smooth' });
      }
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
                        alt={post.author_name}
                      />
                      <div>
                          <Link 
                             href={getUserProfileUrl(authorDetail.slug, authorDetail.isExpert)} 
                             className="font-extrabold text-gray-700 hover:text-rejimde-blue transition block"
                          >
                              {post.author_name}
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

              {/* COMMENTS SECTION */}
              <div className="mt-16">
                  <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                      Yorumlar <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-sm">{comments.length}</span>
                  </h3>

                  {/* Comment Input */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 mb-8 flex gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0 overflow-hidden relative">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img 
                             src={currentUser?.avatar || "https://api.dicebear.com/9.x/personas/svg?seed=Guest"} 
                             alt="Me" 
                             className="w-full h-full object-cover"
                           />
                      </div>
                      <div className="flex-1">
                          {replyTo && (
                              <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg mb-2 text-xs font-bold text-rejimde-blue">
                                  <span>@{replyTo.user} yanıtlanıyor...</span>
                                  <button onClick={() => setReplyTo(null)} className="hover:text-red-500"><i className="fa-solid fa-xmark"></i></button>
                              </div>
                          )}
                          <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Bir şeyler yaz..." 
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-rejimde-green resize-none h-20 outline-none"
                          ></textarea>
                          <div className="flex justify-between items-center mt-2">
                              <span className="text-xs font-bold text-gray-400">Yorum yazarak +2 puan kazan</span>
                              <button 
                                onClick={handlePostComment} 
                                disabled={postingComment}
                                className="bg-rejimde-green text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-rejimde-greenDark btn-game uppercase disabled:opacity-50"
                              >
                                  {postingComment ? '...' : 'Gönder'}
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6">
                      {loadingComments ? (
                          <div className="flex justify-center p-8"><i className="fa-solid fa-circle-notch animate-spin text-2xl text-gray-300"></i></div>
                      ) : comments.length === 0 ? (
                          <p className="text-center text-gray-400 font-bold">Henüz yorum yok. İlk yorumu sen yap!</p>
                      ) : (
                          comments.map((c, i) => (
                              <div key={i} className={`flex gap-4 ${c.isExpert ? 'ml-8 md:ml-12' : ''} animate-fadeIn`}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={c.avatar} 
                                    className={`w-12 h-12 rounded-2xl border-2 object-cover ${c.isExpert ? 'border-rejimde-blue' : 'border-gray-100'}`} 
                                    alt={c.user} 
                                    onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/9.x/personas/svg?seed=${c.user}` }}
                                  />
                                  <div className="flex-1 min-w-0">
                                      <div className={`${c.isExpert ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-200'} border-2 p-4 rounded-3xl rounded-tl-none relative`}>
                                          <div className="flex justify-between items-center mb-1">
                                              <div className="flex items-center gap-2">
                                                  {/* PROFİL LİNKİ: Helper fonksiyonla */}
                                                  <Link 
                                                    href={getUserProfileUrl(slugify(c.user), c.isExpert)} 
                                                    className={`font-extrabold text-sm hover:underline ${c.isExpert ? 'text-rejimde-blueDark' : 'text-gray-700'}`}
                                                  >
                                                      {c.user}
                                                  </Link>
                                                  {c.isExpert && <i className="fa-solid fa-circle-check text-rejimde-blue text-xs" title="Uzman"></i>}
                                              </div>
                                              <span className={`text-[10px] font-bold ${c.isExpert ? 'text-blue-300' : 'text-gray-400'}`}>
                                                  {c.timeAgo || c.date}
                                              </span>
                                          </div>
                                          <p className="text-gray-600 font-bold text-sm" dangerouslySetInnerHTML={{ __html: c.text }}></p>
                                          
                                          {/* Action Buttons */}
                                          <div className="flex gap-4 mt-3">
                                              <button 
                                                onClick={() => handleLikeComment(c.id)}
                                                className={`text-[10px] font-bold flex items-center gap-1 transition ${likedComments.includes(c.id) ? 'text-rejimde-green' : 'text-gray-400 hover:text-rejimde-green'}`}
                                              >
                                                  <i className={`fa-${likedComments.includes(c.id) ? 'solid' : 'regular'} fa-thumbs-up`}></i> 
                                                  {likedComments.includes(c.id) ? 'Faydalı (1)' : 'Faydalı'}
                                              </button>
                                              <button 
                                                onClick={() => handleReply(c.id, c.user)}
                                                className="text-[10px] font-bold text-gray-400 hover:text-rejimde-blue flex items-center gap-1 transition"
                                              >
                                                  <i className="fa-solid fa-reply"></i> Yanıtla
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>

          </article>

          {/* RIGHT: Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
              
              {/* Author Profile Card */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 sticky top-24 shadow-card text-center z-10">
                  <div className="w-24 h-24 mx-auto bg-gray-200 rounded-2xl border-4 border-white shadow-md overflow-hidden mb-4 relative group">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={authorDetail.avatar} 
                        className="w-full h-full object-cover" 
                        alt={post.author_name} 
                      />
                      {authorDetail.isExpert && (
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-rejimde-green border-2 border-white rounded-full flex items-center justify-center">
                              <i className="fa-solid fa-check text-white text-[10px]"></i>
                          </div>
                      )}
                  </div>
                  
                  {/* Yazar Adı (Linkli - Helper fonksiyonla) */}
                  <Link 
                    href={getUserProfileUrl(authorDetail.slug, authorDetail.isExpert)}
                    className="text-xl font-extrabold text-gray-800 mb-1 hover:text-rejimde-blue transition block"
                  >
                      {post.author_name}
                  </Link>
                  <p className="text-gray-400 font-bold text-sm mb-6">Yazar • {categoryName}</p>
                  
                  <button className="bg-rejimde-green text-white w-full py-3 rounded-xl font-extrabold shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide mb-3">
                      Takip Et
                  </button>
                  <Link href="/blog" className="block bg-white border-2 border-gray-200 text-gray-500 w-full py-3 rounded-xl font-extrabold shadow-btn shadow-gray-200 btn-game uppercase tracking-wide hover:text-rejimde-blue hover:border-rejimde-blue">
                      Diğer Yazıları
                  </Link>
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