'use client';

import { useState, useEffect } from 'react';
import { auth, createComment, getComments } from '@/lib/api';
import Link from 'next/link';

interface CommentsSectionProps {
  postId: number;
  context: 'expert' | 'blog' | 'diet' | 'exercise' | 'general';
  title?: string;
  expertId?: number; // Uzman ID'si (Cevaplarda vurgulamak için)
}

export default function CommentsSection({ postId, context, title = "Yorumlar", expertId }: CommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [replyTo, setReplyTo] = useState<{id: number, name: string} | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Verileri Çek
  useEffect(() => {
    async function init() {
      const user = await auth.me();
      setCurrentUser(user);

      const res = await getComments(postId, context);
      if (res) {
          setComments(res.comments || []);
          setStats(res.stats || null);
      }
      setLoading(false);
    }
    init();
  }, [postId, context]);

  // Yorum Gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // Uzman değerlendirmesi için puan zorunlu
    if (context === 'expert' && rating === 0 && !replyTo) {
        alert("Lütfen bir puan verin.");
        return;
    }

    setSubmitting(true);
    const res = await createComment(postId, newComment, context, rating, replyTo?.id || 0);

    if (res.success) {
        // Listeyi güncelle (Basitçe en başa ekleyelim veya reload edelim)
        // Eğer cevap ise ilgili yorumun altına eklemek gerekir ama şimdilik reload mantığı
        const updatedRes = await getComments(postId, context);
        setComments(updatedRes.comments || []);
        setStats(updatedRes.stats || null);
        
        setNewComment('');
        setRating(0);
        setReplyTo(null);
        if (res.earned_points > 0) alert(`Tebrikler! ${res.earned_points} puan kazandın! 🎉`);
    } else {
        alert(res.message);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-8"><i className="fa-solid fa-circle-notch fa-spin text-gray-400"></i></div>;

  return (
    <div className="space-y-8">
        
        {/* 1. REVIEW SUMMARY (Sadece Expert Context İçin) */}
        {context === 'expert' && stats && (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                    <span className="bg-yellow-100 text-yellow-600 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-yellow-200">
                        <i className="fa-solid fa-star"></i>
                    </span>
                    Danışan Değerlendirmeleri
                </h2>

                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="text-center bg-gray-50 p-6 rounded-[2rem] border border-gray-100 min-w-[180px]">
                        <div className="text-6xl font-black text-gray-800 leading-none tracking-tighter">{stats.average}</div>
                        <div className="flex text-yellow-400 text-lg my-2 justify-center gap-1">
                             {[1,2,3,4,5].map(i => (
                                 <i key={i} className={`fa-solid fa-star ${i <= Math.round(stats.average) ? '' : 'text-gray-200'}`}></i>
                             ))}
                        </div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-wide bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">{stats.total} Yorum</p>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                        {[5, 4, 3, 2, 1].map(r => {
                            const dist = stats.distribution[r] || { count: 0, percent: 0 };
                            return (
                                <div key={r} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                    <span className="w-4 font-black">{r}</span> <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{width: `${dist.percent}%`}}></div>
                                    </div>
                                    <span className="w-8 text-right font-black text-gray-700">{dist.percent}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* 2. COMMENT FORM */}
        {!currentUser ? (
             <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-8 text-center">
                 <p className="text-gray-500 font-bold mb-4">Yorum yapmak ve puan kazanmak için giriş yapmalısın.</p>
                 <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-extrabold uppercase shadow-lg hover:bg-blue-700 transition inline-block">Giriş Yap</Link>
             </div>
        ) : (
            <div className={`rounded-[2rem] p-1 shadow-sm relative overflow-hidden transition-all ${context === 'expert' ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100' : 'bg-white border-2 border-gray-100'}`}>
                <div className="bg-white rounded-[1.8rem] p-6">
                    {/* Header: Reply Info or Gamification Hint */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4 items-center">
                            <img src={currentUser.avatar_url || `https://api.dicebear.com/9.x/personas/svg?seed=${currentUser.name}`} className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-gray-100" alt="Me" />
                            <div>
                                <h3 className="font-black text-gray-800 text-lg leading-tight">
                                    {replyTo ? `Yanıtla: ${replyTo.name}` : (context === 'expert' ? 'Deneyimini Paylaş' : 'Düşüncelerini Paylaş')}
                                </h3>
                                {replyTo && <button onClick={() => setReplyTo(null)} className="text-xs text-red-500 font-bold hover:underline">İptal</button>}
                            </div>
                        </div>
                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-yellow-200 flex items-center gap-1 shadow-sm">
                            <i className="fa-solid fa-bolt"></i> +{context === 'expert' && !replyTo ? '20' : '5'} Puan
                        </div>
                    </div>

                    {/* Star Rating (Only for Expert & No Reply) */}
                    {context === 'expert' && !replyTo && (
                        <div className="flex gap-2 mb-4 justify-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i 
                                    key={star}
                                    className={`fa-solid fa-star text-3xl cursor-pointer transition transform hover:scale-110 ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                ></i>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none h-28" 
                            placeholder={context === 'expert' ? "Tecrübelerini diğer danışanlarla paylaş..." : "Yorumunu buraya yaz..."}
                        ></textarea>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-extrabold text-sm uppercase shadow-[0_4px_0_rgb(67,56,202)] hover:bg-indigo-500 hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Gönderiliyor...' : (replyTo ? 'Yanıtla' : (context === 'expert' ? 'Değerlendir' : 'Yorum Yap'))} <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 3. COMMENT LIST */}
        <div className="space-y-6">
            {comments.map((comment) => (
                <div key={comment.id} className="group">
                    {/* Main Comment */}
                    <div className="flex gap-4">
                        {/* Avatar Column */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className={`w-14 h-14 rounded-2xl p-0.5 overflow-hidden ring-2 ring-offset-2 transition relative ${comment.author.details.is_expert ? 'bg-blue-50 border-2 border-blue-200 ring-blue-50' : 'bg-white border-2 border-gray-200 ring-transparent'}`}>
                                <img src={comment.author.details.avatar} className="w-full h-full object-cover rounded-xl" alt="User" />
                                {comment.author.details.is_expert && (
                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] border-2 border-white">
                                        <i className="fa-solid fa-check"></i>
                                    </div>
                                )}
                            </div>
                            
                            {/* Score/Rating Badge */}
                            {comment.author.details.is_expert ? (
                                <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg mt-1 border border-blue-700 shadow-sm flex items-center gap-1">
                                    <i className="fa-solid fa-star text-yellow-300"></i> {comment.author.details.score || '5.0'}
                                </div>
                            ) : (
                                <div className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-lg mt-1 border border-yellow-200 shadow-sm flex items-center gap-1">
                                    <i className="fa-solid fa-bolt text-yellow-500"></i> {comment.author.details.score}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className={`p-5 rounded-[1.5rem] rounded-tl-none border-2 shadow-sm relative transition ${comment.author.details.is_expert ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100 hover:border-purple-100'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-extrabold text-sm ${comment.author.details.is_expert ? 'text-blue-900' : 'text-gray-800'}`}>{comment.author.name}</span>
                                            {comment.author.details.is_expert && (
                                                <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-blue-200">UZMAN</span>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold ${comment.author.details.is_expert ? 'text-blue-400' : 'text-gray-400'} mt-0.5 block`}>{comment.date}</span>
                                    </div>
                                    {comment.rating > 0 && (
                                        <div className="flex text-yellow-400 text-xs">
                                            {[1,2,3,4,5].map(i => <i key={i} className={`fa-solid fa-star ${i <= comment.rating ? '' : 'text-gray-200'}`}></i>)}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-2 ml-4">
                                <button className="flex items-center gap-1.5 text-gray-400 hover:text-green-500 text-xs font-black uppercase transition hover:bg-green-50 px-3 py-1.5 rounded-xl">
                                    <i className="fa-regular fa-thumbs-up text-lg"></i> Beğen
                                </button>
                                <button 
                                    onClick={() => setReplyTo({id: comment.id, name: comment.author.name})}
                                    className="text-gray-400 hover:text-purple-600 text-xs font-black uppercase transition hover:bg-purple-50 px-3 py-1.5 rounded-xl"
                                >
                                    Yanıtla
                                </button>
                            </div>

                            {/* REPLIES (Nested) */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 space-y-4">
                                    {comment.replies.map((reply: any) => (
                                        <div key={reply.id} className="flex gap-4">
                                            <div className="flex flex-col items-center gap-1 shrink-0">
                                                <div className={`w-10 h-10 rounded-xl p-0.5 overflow-hidden ${reply.author.details.is_expert ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-100'}`}>
                                                    <img src={reply.author.details.avatar} className="w-full h-full object-cover rounded-lg" alt="User" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className={`p-4 rounded-[1.5rem] rounded-tl-none border relative ${reply.author.details.is_expert ? 'bg-blue-50/80 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-extrabold text-xs ${reply.author.details.is_expert ? 'text-blue-900' : 'text-gray-700'}`}>{reply.author.name}</span>
                                                            {reply.author.details.is_expert && <i className="fa-solid fa-certificate text-blue-500 text-[10px]" title="Uzman"></i>}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-gray-400">{reply.date}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-600 leading-relaxed">{reply.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            ))}

            {comments.length === 0 && (
                <div className="text-center py-10 text-gray-400 font-bold bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <i className="fa-regular fa-comments text-3xl mb-2 opacity-50"></i>
                    <p>Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                </div>
            )}
        </div>

    </div>
  );
}