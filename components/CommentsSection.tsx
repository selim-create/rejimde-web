"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getComments, createComment } from "@/lib/api";

interface CommentsSectionProps {
  postId: number;
  title?: string;
}

// Zaman Formatı
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

export default function CommentsSection({ postId, title = "Yorumlar" }: CommentsSectionProps) {
  // State'ler
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<{id: number, user: string} | null>(null);
  const [likedComments, setLikedComments] = useState<number[]>([]);
  
  const [currentUser, setCurrentUser] = useState<{ role: string, name: string, avatar: string } | null>(null);
  
  // Basit Modal State
  const [modal, setModal] = useState<{show: boolean, title: string, msg: string, type: 'info'|'error'|'success'}>({
      show: false, title: "", msg: "", type: "info"
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 1. Mevcut Kullanıcıyı Al
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            const role = localStorage.getItem('user_role') || 'rejimde_user';
            const name = localStorage.getItem('user_name') || 'Kullanıcı';
            const storedAvatar = localStorage.getItem('user_avatar');
            const avatar = storedAvatar && storedAvatar.startsWith('http') ? storedAvatar : `https://api.dicebear.com/9.x/personas/svg?seed=${name}`;
            
            setCurrentUser({ role, name, avatar });
        }
    }

    // 2. Yorumları Çek ve Zenginleştir
    const fetchAndEnrichComments = async () => {
        try {
            const rawComments = await getComments(postId);
            
            // Yorum yapanların ID'lerini topla
            const userIds = Array.from(new Set(rawComments.map((c: any) => c.userId).filter((id: any) => id)));
            const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';
            
            const userDetailsMap: Record<number, any> = {};

            // Kullanıcı detaylarını çek (Rol, Slug, Avatar için)
            if (userIds.length > 0) {
                 await Promise.all(userIds.map(async (uid: any) => {
                    try {
                        const res = await fetch(`${apiUrl}/wp/v2/users/${uid}`);
                        if (res.ok) {
                            const user = await res.json();
                            const isPro = user.roles && user.roles.includes('rejimde_pro');
                            // Özel avatar yoksa DiceBear
                            const userAvatar = user.avatar_url || user.avatar_urls?.['96'] || `https://api.dicebear.com/9.x/personas/svg?seed=${user.slug}`;
                            
                            userDetailsMap[uid] = {
                                avatar: userAvatar,
                                isExpert: isPro,
                                slug: user.slug,
                                role: isPro ? 'rejimde_pro' : 'rejimde_user'
                            };
                        }
                    } catch (e) {
                        console.error(`User fetch error for ID ${uid}`, e);
                    }
                }));
            }
            
            // Yorumları eşle
            const formatted = rawComments.map((c: any) => {
                const details = userDetailsMap[c.userId];
                
                const avatar = details ? details.avatar : (c.avatar && !c.avatar.includes('gravatar') ? c.avatar : `https://api.dicebear.com/9.x/personas/svg?seed=${c.user}`);
                const isExpert = details ? details.isExpert : false;
                const slug = details ? details.slug : slugify(c.user);

                return {
                    ...c,
                    avatar: avatar,
                    timeAgo: timeAgo(c.date),
                    likes: c.likes || Math.floor(Math.random() * 5),
                    isExpert: isExpert,
                    slug: slug
                };
            });

            setComments(formatted);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    fetchAndEnrichComments();
  }, [postId]);

  const handleSend = async () => {
    if (!comment.trim()) return;
    
    if (!currentUser) {
        setModal({ show: true, title: "Giriş Yapmalısın", msg: "Yorum yapmak için giriş yapmalısın.", type: "info" });
        return;
    }

    setPosting(true);
    
    const contentToSend = replyTo ? `<b>@${replyTo.user}</b> ${comment}` : comment;

    const res = await createComment(postId, contentToSend);

    if (res.success && res.data) {
        const isPro = currentUser.role === 'rejimde_pro';
        
        // Optimistik UI
        const newComment = {
            ...res.data,
            id: res.data.id || Date.now(),
            user: currentUser.name,
            text: contentToSend,
            date: new Date().toISOString(),
            timeAgo: "Şimdi",
            avatar: currentUser.avatar,
            isExpert: isPro,
            likes: 0,
            slug: localStorage.getItem('user_name') || slugify(currentUser.name), // Geçici slug
            userId: 0
        };
        
        setComments([newComment, ...comments]);
        setComment("");
        setReplyTo(null);
        setModal({ show: true, title: "Başarılı! 🎉", msg: "Yorumun paylaşıldı. +2 Puan kazandın!", type: "success" });
    } else {
        setModal({ show: true, title: "Hata", msg: res.message || "Yorum gönderilemedi.", type: "error" });
    }
    setPosting(false);
  };

  const handleLike = (id: number) => {
      if (likedComments.includes(id)) return;
      setComments(comments.map(c => c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c));
      setLikedComments([...likedComments, id]);
  };

  const handleReply = (id: number, user: string) => {
      setReplyTo({ id, user });
      if (textAreaRef.current) {
          textAreaRef.current.focus();
          textAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  };

  return (
    <div className="mt-16">
        <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            {title} <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-sm">{comments.length}</span>
        </h3>

        {/* Input Area */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 mb-8 flex gap-4 shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl shrink-0 overflow-hidden relative border-2 border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={currentUser?.avatar || "https://api.dicebear.com/9.x/personas/svg?seed=Guest"} 
                    alt="Me" 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1">
                {replyTo && (
                    <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg mb-2 text-xs font-bold text-rejimde-blue border border-blue-100">
                        <span><i className="fa-solid fa-reply mr-1"></i> @{replyTo.user} yanıtlanıyor...</span>
                        <button onClick={() => setReplyTo(null)} className="hover:text-red-500"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                )}
                <textarea 
                    ref={textAreaRef}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Düşüncelerini paylaş..." 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-rejimde-green rounded-xl p-3 text-sm font-bold resize-none h-24 outline-none transition placeholder-gray-400"
                ></textarea>
                <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        <i className="fa-solid fa-star text-rejimde-yellow"></i> Yorum yaz, +2 puan kazan
                    </span>
                    <button 
                        onClick={handleSend} 
                        disabled={posting}
                        className="bg-rejimde-green text-white px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-btn shadow-rejimde-greenDark btn-game uppercase disabled:opacity-50 flex items-center gap-2"
                    >
                        {posting && <i className="fa-solid fa-circle-notch animate-spin"></i>}
                        Gönder
                    </button>
                </div>
            </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
            {loading ? (
                <div className="flex justify-center p-8"><i className="fa-solid fa-circle-notch animate-spin text-3xl text-gray-300"></i></div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <i className="fa-regular fa-comments text-4xl text-gray-300 mb-2"></i>
                    <p className="text-gray-400 font-bold">Henüz yorum yok. İlk yorumu sen yap!</p>
                </div>
            ) : (
                comments.map((c, i) => (
                    <div key={i} className={`flex gap-4 ${c.isExpert ? 'pl-4 md:pl-12' : ''} animate-fadeIn`}>
                        <div className="shrink-0">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={c.avatar} 
                                className={`w-12 h-12 rounded-2xl border-2 object-cover ${c.isExpert ? 'border-rejimde-blue shadow-sm' : 'border-gray-100'}`} 
                                alt={c.user} 
                                onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/9.x/personas/svg?seed=${c.user}` }}
                            />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className={`${c.isExpert ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-200'} border-2 p-4 rounded-3xl rounded-tl-none relative shadow-sm`}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        {/* DOĞRU LİNKLEME: Rol ve Slug kontrolü */}
                                        <Link 
                                            href={c.isExpert ? `/experts/${c.slug}` : `/profile/${c.slug}`} 
                                            className={`font-extrabold text-sm hover:underline ${c.isExpert ? 'text-rejimde-blueDark' : 'text-gray-700'}`}
                                        >
                                            {c.user}
                                        </Link>
                                        {c.isExpert && (
                                            <span className="bg-rejimde-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                <i className="fa-solid fa-check"></i> Uzman
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold ${c.isExpert ? 'text-blue-300' : 'text-gray-400'}`}>
                                        {c.timeAgo || c.date}
                                    </span>
                                </div>
                                
                                <div className="text-gray-600 font-bold text-sm break-words leading-relaxed" dangerouslySetInnerHTML={{ __html: c.text }}></div>
                                
                                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100/50">
                                    <button 
                                        onClick={() => handleLike(c.id)}
                                        className={`text-xs font-bold flex items-center gap-1.5 transition ${likedComments.includes(c.id) ? 'text-rejimde-green' : 'text-gray-400 hover:text-rejimde-green'}`}
                                    >
                                        <i className={`fa-${likedComments.includes(c.id) ? 'solid' : 'regular'} fa-thumbs-up`}></i> 
                                        {likedComments.includes(c.id) ? `Faydalı (${(c.likes || 0) + 1})` : 'Faydalı'}
                                    </button>
                                    <button 
                                        onClick={() => handleReply(c.id, c.user)}
                                        className="text-xs font-bold text-gray-400 hover:text-rejimde-blue flex items-center gap-1.5 transition"
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

        {/* INFO MODAL */}
        {modal.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setModal({...modal, show: false})}>
                <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 text-center animate-bounce-slow" onClick={e => e.stopPropagation()}>
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modal.type === 'error' ? 'bg-red-100 text-red-500' : (modal.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-blue-100 text-blue-500')}`}>
                          <i className={`fa-solid ${modal.type === 'error' ? 'fa-triangle-exclamation' : (modal.type === 'success' ? 'fa-check' : 'fa-info')} text-3xl`}></i>
                     </div>
                     <h3 className="text-xl font-black text-gray-800 mb-2">{modal.title}</h3>
                     <p className="text-gray-500 font-bold mb-6 text-sm">{modal.msg}</p>
                     
                     {modal.title.includes("Giriş") ? (
                         <div className="flex gap-3">
                             <button onClick={() => setModal({...modal, show: false})} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-bold btn-game">İptal</button>
                             <Link href="/login" className="flex-1 bg-rejimde-blue text-white py-3 rounded-xl font-extrabold shadow-btn btn-game uppercase text-center">Giriş Yap</Link>
                         </div>
                     ) : (
                         <button onClick={() => setModal({...modal, show: false})} className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-extrabold btn-game uppercase">Tamam</button>
                     )}
                </div>
            </div>
        )}
    </div>
  );
}