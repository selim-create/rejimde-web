"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchComments, postComment, toggleLikeComment, CommentData } from '@/lib/comment-service';

interface ExpertReviewsProps {
    expertId: number;
    expertSlug?: string;
}

// --- MODAL ---
const AlertModal = ({ isOpen, title, message, type, onClose }: { isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'warning', onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className={`absolute top-0 left-0 w-full h-2 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${type === 'success' ? 'bg-green-100 text-green-600' : type === 'error' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    <i className={`fa-solid ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'} text-3xl`}></i>
                </div>
                <h3 className="text-xl font-black text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-gray-500 text-center text-sm mb-6 font-bold leading-relaxed">{message}</p>
                <button onClick={onClose} className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-extrabold text-sm transition shadow-lg">Tamam</button>
            </div>
        </div>
    );
};

export default function ExpertReviews({ expertId, expertSlug }: ExpertReviewsProps) {
    const [comments, setComments] = useState<CommentData[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState(0);
    const [user, setUser] = useState<{ isLoggedIn: boolean, name: string, slug: string, avatar: string, role: string, level?: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [hasSubmittedLocal, setHasSubmittedLocal] = useState(false);
    const [replyTo, setReplyTo] = useState<{id: number, name: string} | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [modal, setModal] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'warning' }>({ isOpen: false, title: '', message: '', type: 'success' });

    const emojis = ['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '😡', '🎉', '💪'];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                setUser({
                    isLoggedIn: true,
                    name: localStorage.getItem('user_name') || 'Kullanıcı',
                    slug: localStorage.getItem('user_slug') || '',
                    avatar: localStorage.getItem('user_avatar') || `https://api.dicebear.com/9.x/avataaars/svg?seed=User`,
                    role: localStorage.getItem('user_role') || 'rejimde_user',
                    level: parseInt(localStorage.getItem('user_level') || '1')
                });
            }
        }
        loadData();
    }, [expertId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await fetchComments(expertId, 'expert');
            if (data) {
                setComments(data.comments || []);
                setStats(data.stats || null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning') => setModal({ isOpen: true, title, message, type });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    // --- KONTROLLER ---
    
    // 1. Profil Sahibi Kontrolü (GÜÇLENDİRİLDİ)
    const isProfileOwner = user?.isLoggedIn && expertSlug && user?.slug === expertSlug;
    
    // 2. Moderasyon Yetkisi
    const canModerate = user?.isLoggedIn && (user?.role === 'rejimde_pro' || user?.role === 'administrator' || isProfileOwner);

    // 3. Kullanıcı daha önce değerlendirme yapmış mı?
    const hasReviewed = hasSubmittedLocal || comments.some(c => c.parent === 0 && (
        (user?.slug && c.author.slug === user.slug) || (c.author.name === user?.name)
    ));

    const handleSubmit = async () => {
        if (!user?.isLoggedIn) return showAlert("Giriş Gerekli", "Değerlendirme yapmak için giriş yapmalısınız.", "warning");
        if (isProfileOwner) return showAlert("Hata", "Kendi profilinize değerlendirme yapamazsınız.", "error"); 
        if (!newComment.trim()) return showAlert("Eksik Bilgi", "Lütfen bir yorum yazın.", "warning");
        if (rating === 0) return showAlert("Puan Gerekli", "Değerlendirme yapabilmek için lütfen yıldız vererek puanlayın.", "warning");

        setIsSubmitting(true);
        try {
            const res = await postComment({
                post: expertId,
                content: newComment,
                context: 'expert',
                rating: rating
            });
            
            if (res.success) {
                setNewComment("");
                setRating(0);
                setHasSubmittedLocal(true);
                showAlert("Başarılı", res.message || "Yorumunuz alındı.", "success");
                loadData(); 
            } else {
                showAlert("Hata", res.message || "Bir hata oluştu.", "error");
            }
        } catch (error: any) {
            showAlert("Hata", error.message || "Yorum gönderilirken bir hata oluştu.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplySubmit = async (parentId: number) => {
        if (!user?.isLoggedIn) return showAlert("Giriş Gerekli", "Yanıtlamak için giriş yapmalısınız.", "warning");
        if (!replyContent.trim()) return showAlert("Eksik Bilgi", "Lütfen bir yanıt yazın.", "warning");

        setIsSubmitting(true);
        try {
            const res = await postComment({
                post: expertId,
                content: replyContent,
                context: 'expert',
                parent: parentId
            });
            
            if (res.success) {
                setReplyContent("");
                setReplyTo(null);
                showAlert("Başarılı", res.message || "Yanıtınız gönderildi.", "success");
                loadData();
            } else {
                showAlert("Hata", res.message || "Bir hata oluştu.", "error");
            }
        } catch (error: any) {
            showAlert("Hata", error.message || "Bir hata oluştu.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async (commentId: number) => {
        if (!user?.isLoggedIn) return showAlert("Giriş Gerekli", "Beğenmek için giriş yapmalısın.", "warning");
        
        setComments(prev => {
            const updateLike = (list: CommentData[]): CommentData[] => {
                return list.map(c => {
                    if (c.id === commentId) {
                        const isLiked = !c.is_liked;
                        return { ...c, is_liked: isLiked, likes_count: c.likes_count + (isLiked ? 1 : -1) };
                    }
                    if (c.replies) {
                        return { ...c, replies: updateLike(c.replies) };
                    }
                    return c;
                });
            };
            return updateLike(prev);
        });

        try {
            await toggleLikeComment(commentId);
        } catch (e) {
            console.error(e);
        }
    };

    const renderStars = (score: number, size = "text-lg") => {
        return (
            <div className={`flex ${size} text-yellow-400 gap-0.5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className={`fa-star ${star <= Math.round(score) ? 'fa-solid' : 'fa-regular text-gray-200'}`}></i>
                ))}
            </div>
        );
    };

    const addEmoji = (emoji: string, isReply = false) => {
        if (isReply) setReplyContent(prev => prev + emoji);
        else setNewComment(prev => prev + emoji);
        setShowEmojiPicker(null);
    };

    return (
        <div className="space-y-8 font-nunito">
            <AlertModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={closeModal} />
            
            {/* HEADER */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
                
                <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3 relative z-10">
                    <span className="bg-yellow-100 text-yellow-600 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-yellow-200">
                        <i className="fa-solid fa-star"></i>
                    </span>
                    Danışan Değerlendirmeleri
                </h2>

                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="text-center md:text-left shrink-0 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 min-w-[180px] flex flex-col items-center">
                        <div className="text-6xl font-black text-gray-800 leading-none tracking-tighter">
                            {stats?.average || "0.0"}
                        </div>
                        <div className="my-2">{renderStars(Number(stats?.average || 0))}</div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-wide bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                            {stats?.total || 0} Yorum
                        </p>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const dist = stats?.distribution?.[star] || { count: 0, percent: 0 };
                            return (
                                <div key={star} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                    <span className="w-4 font-black">{star}</span> <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                                        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${dist.percent}%`, opacity: dist.percent > 0 ? 1 : 0.3 }}></div>
                                    </div>
                                    <span className="w-8 text-right font-black text-gray-700">{dist.percent}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FORM ALANI */}
            {!user?.isLoggedIn && (
                <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-bold mb-2">Yorum yapmak ve puan kazanmak için</p>
                    <Link href="/login" className="text-indigo-600 font-black hover:underline">Giriş Yapın</Link>
                </div>
            )}

            {/* Giriş Yapmışsa */}
            {user?.isLoggedIn && (
                // Durum: Kendi Profili - HİÇ GÖSTERME (return null)
                isProfileOwner ? null : (
                    // Durum: Başkasının Profili
                    hasReviewed ? (
                        <div className="bg-green-50 border-2 border-green-100 p-6 rounded-[2rem] text-center shadow-sm animate-in fade-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                                <i className="fa-solid fa-check"></i>
                            </div>
                            <h3 className="text-lg font-black text-green-800 mb-1">Değerlendirmeniz Alındı</h3>
                            <p className="text-green-600 font-bold text-sm">Teşekkürler! Deneyiminiz uzman onayı sonrası yayınlanacaktır.</p>
                        </div>
                    ) : (
                        // Formu Göster
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-[2rem] p-1 shadow-sm relative group hover:border-indigo-200 transition">
                            <div className="bg-white rounded-[1.8rem] p-6 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 border-2 border-gray-100 overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={user.avatar} className="w-full h-full object-cover" alt="Me" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-800 text-lg leading-tight">Deneyimini Paylaş</h3>
                                            <p className="text-xs font-bold text-gray-400">Sürecin nasıldı?</p>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-yellow-200 flex items-center gap-1 shadow-sm">
                                        <i className="fa-solid fa-bolt"></i> +20 Puan
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-4 justify-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} onClick={() => setRating(star)} className={`fa-solid fa-star text-3xl transition transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-400'}`}></button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full bg-gray-50 border-2 border-indigo-50 rounded-xl p-4 text-sm font-bold text-gray-600 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none h-28" placeholder="Tecrübelerini diğer danışanlarla paylaş..."></textarea>
                                    <div className="absolute bottom-3 left-3">
                                        <button onClick={() => setShowEmojiPicker(showEmojiPicker === 'main' ? null : 'main')} className="text-gray-400 hover:text-yellow-500 p-1 rounded transition">
                                            <i className="fa-regular fa-face-smile text-xl"></i>
                                        </button>
                                        {showEmojiPicker === 'main' && (
                                            <div className="absolute bottom-10 left-0 bg-white shadow-xl border border-gray-100 rounded-xl p-2 grid grid-cols-5 gap-1 z-20 w-48">
                                                {emojis.map(e => (
                                                    <button key={e} onClick={() => addEmoji(e)} className="hover:bg-gray-100 p-1 rounded text-lg transition">{e}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex justify-end mt-4">
                                    <button onClick={handleSubmit} disabled={isSubmitting || !newComment || rating === 0} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-extrabold text-sm uppercase shadow-[0_4px_0_rgb(67,56,202)] hover:bg-indigo-500 hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0">
                                        {isSubmitting ? 'Gönderiliyor...' : 'Değerlendir'} <i className="fa-solid fa-check"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )
            )}

            {/* LIST */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-400 animate-pulse">Yorumlar Yükleniyor...</div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => {
                        const isOwnComment = user?.isLoggedIn && (
                            (user?.slug && comment.author.slug === user.slug) || 
                            (comment.author.name === user?.name)
                        );
                        const canReply = canModerate || isOwnComment;

                        return (
                            <div key={comment.id} className="bg-white rounded-[2rem] p-6 border-2 border-gray-100 shadow-sm hover:border-gray-200 transition group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={comment.author.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${comment.author.name}`} className="w-full h-full object-cover" alt={comment.author.name} />
                                        </div>
                                        <div>
                                            <span className="font-extrabold text-gray-800 text-sm hover:text-green-600 transition block">{comment.author.name}</span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {comment.author.level && <span className="bg-yellow-100 text-yellow-700 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 border border-yellow-200"><i className="fa-solid fa-bolt"></i> {comment.author.level}</span>}
                                                {comment.author.is_verified && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100"><i className="fa-solid fa-check-circle"></i> Onaylı Danışan</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {comment.rating !== undefined && comment.rating !== null && comment.rating > 0 && (
                                            <div className="flex text-yellow-400 text-xs mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`fa-star ${i < (comment.rating || 0) ? 'fa-solid' : 'fa-regular text-gray-200'}`}></i>
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-[10px] font-bold text-gray-400">{comment.timeAgo}</span>
                                    </div>
                                </div>

                                <p className="text-sm font-bold text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-50 whitespace-pre-line">{comment.content}</p>
                                
                                <div className="flex items-center gap-4 mt-3 ml-2">
                                    <button onClick={() => handleLike(comment.id)} className={`text-xs font-bold flex items-center gap-1 transition ${comment.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}>
                                        <i className={`${comment.is_liked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i> {comment.likes_count > 0 ? comment.likes_count : 'Beğen'}
                                    </button>
                                    {canReply && (
                                        <button onClick={() => setReplyTo({id: comment.id, name: comment.author.name})} className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition">
                                            Yanıtla
                                        </button>
                                    )}
                                </div>

                                {replyTo?.id === comment.id && (
                                    <div className="mt-4 ml-6 animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-500">@{replyTo.name} yanıtlanıyor...</span>
                                                <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-500"><i className="fa-solid fa-times"></i></button>
                                            </div>
                                            <div className="relative">
                                                <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-indigo-400 resize-none h-20" placeholder="Yanıtınızı yazın..."></textarea>
                                                <div className="absolute bottom-2 left-2">
                                                    <button onClick={() => setShowEmojiPicker(showEmojiPicker === `reply-${comment.id}` ? null : `reply-${comment.id}`)} className="text-gray-400 hover:text-yellow-500 p-1 rounded"><i className="fa-regular fa-face-smile text-lg"></i></button>
                                                    {showEmojiPicker === `reply-${comment.id}` && (
                                                        <div className="absolute bottom-8 left-0 bg-white shadow-xl border border-gray-100 rounded-xl p-2 grid grid-cols-5 gap-1 z-30 w-48">
                                                            {emojis.map(e => (<button key={e} onClick={() => addEmoji(e, true)} className="hover:bg-gray-100 p-1 rounded text-lg transition">{e}</button>))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-2">
                                                <button onClick={() => handleReplySubmit(comment.id)} disabled={isSubmitting || !replyContent} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                                                    {isSubmitting ? '...' : 'Gönder'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {comment.replies && comment.replies.map(reply => {
                                    const isReplyFromExpert = reply.author.is_expert || (expertSlug && reply.author.slug === expertSlug);
                                    return (
                                        <div key={reply.id} className={`mt-3 ml-6 p-4 rounded-2xl rounded-tl-none relative ${isReplyFromExpert ? 'bg-blue-50/80 border-l-4 border-blue-500' : 'bg-gray-50 border-l-4 border-gray-300'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${isReplyFromExpert ? 'bg-blue-100 border-blue-200' : 'bg-gray-200 border-gray-300'}`}>
                                                    <i className={`fa-solid ${isReplyFromExpert ? 'fa-user-doctor text-blue-600' : 'fa-user text-gray-500'} text-xs`}></i>
                                                </div>
                                                <span className={`font-black text-xs ${isReplyFromExpert ? 'text-blue-800' : 'text-gray-700'}`}>{reply.author.name}</span>
                                                {isReplyFromExpert && <span className="bg-blue-200 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase ml-2">UZMAN</span>}
                                                <span className="text-[9px] text-gray-400 ml-auto">{reply.timeAgo}</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-600 pl-8 whitespace-pre-line">{reply.content}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-gray-100">
                        <p className="text-gray-400 font-bold">Henüz değerlendirme yapılmamış. İlk yorumu sen yap!</p>
                    </div>
                )}
            </div>
        </div>
    );
}