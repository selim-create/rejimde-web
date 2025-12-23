'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchComments, postComment, toggleLikeComment, CommentData } from '@/lib/comment-service';

interface CommentsSectionProps {
  postId: number;
  context: 'blog' | 'expert' | 'diet' | 'exercise' | 'dictionary';
  title?: string;
  allowRating?: boolean;
  expertId?: number;
}

export default function CommentsSection({
  postId,
  context,
  title = "Yorumlar",
  allowRating = false,
  expertId
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [replyTo, setReplyTo] = useState<{id: number, authorName: string} | null>(null);
  const [user, setUser] = useState<{ isLoggedIn: boolean, name: string, avatar: string, role: string, level?: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        // LocalStorage'dan level gibi verileri de alabiliriz veya API'den
        const storedLevel = localStorage.getItem('user_level');
        setUser({
          isLoggedIn: true,
          name: localStorage.getItem('user_name') || 'Kullanıcı',
          avatar: localStorage.getItem('user_avatar') || `https://api.dicebear.com/9.x/avataaars/svg?seed=User`,
          role: localStorage.getItem('user_role') || 'rejimde_user',
          level: storedLevel ? parseInt(storedLevel) : 1
        });
      }
    }
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setIsLoading(true);
    const data = await fetchComments(postId, context);
    setComments(data); 
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await postComment({
        post: postId,
        content: newComment,
        context: context,
        parent: replyTo ? replyTo.id : 0,
        rating: (allowRating && !replyTo) ? rating : undefined,
      });
      
      setNewComment('');
      setRating(0);
      setReplyTo(null);
      loadComments();
    } catch (error: any) {
      alert(error.message || 'Yorum gönderilirken bir hata oluştu.');
    }
  };

  const handleLike = async (commentId: number) => {
    if (!user?.isLoggedIn) return alert("Beğenmek için giriş yapmalısın.");
    setComments(prevComments => updateCommentLikeInTree(prevComments, commentId));
    await toggleLikeComment(commentId);
  };

  const updateCommentLikeInTree = (list: CommentData[], targetId: number): CommentData[] => {
    return list.map(c => {
      if (c.id === targetId) {
        const isLiked = !c.is_liked;
        return { 
          ...c, 
          is_liked: isLiked, 
          likes_count: (c.likes_count || 0) + (isLiked ? 1 : -1) 
        };
      }
      if (c.replies) {
        return { ...c, replies: updateCommentLikeInTree(c.replies, targetId) };
      }
      return c;
    });
  };

  const getProfileLink = (author: CommentData['author']) => {
    // Return null if no author or no slug - component will handle this appropriately
    if (!author || !author.slug) return null;
    
    // If the author has a slug, use it
    const slug = author.slug;
    
    // Determine if this is an expert based on role
    if (author.role === 'rejimde_pro' || author.is_expert) {
        return `/experts/${slug}`;
    }
    
    // For regular users
    return `/profile/${slug}`;
  };

  // ---------------------------------------------
  // COMMENT ITEM COMPONENT (Mockup Uyumlu)
  // ---------------------------------------------
  const CommentItem = ({ comment, isReply = false }: { comment: CommentData, isReply?: boolean }) => {
    // Ensure author exists with default values
    const author = comment.author || { 
        name: 'Anonim Kullanıcı', 
        avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=Anonymous',  // Consistent with comment-service.ts
        slug: '',
        role: 'guest', 
        is_expert: false,
        level: 1
    };
    const isExpert = author.role === 'rejimde_pro' || author.is_expert;
    
    // --- STİL SINIFLARI (HTML MOCKUP'TAN ALINDI) ---
    
    // 1. UZMAN YORUMU (mockup: 2. UZMAN YORUMU)
    // bg-blue-50/50 p-5 rounded-[1.5rem] rounded-tl-none border-2 border-blue-100 shadow-sm relative group-hover:border-blue-200 transition
    const expertBubbleClass = "bg-blue-50/50 p-5 rounded-[1.5rem] rounded-tl-none border-2 border-blue-100 shadow-sm relative group-hover:border-blue-200 transition";
    
    // 2. STANDART YORUM (mockup: 1. STANDART KULLANICI YORUMU)
    // bg-white p-5 rounded-[1.5rem] rounded-tl-none border-2 border-gray-100 shadow-sm relative group-hover:border-purple-100 transition
    const userBubbleClass = "bg-white p-5 rounded-[1.5rem] rounded-tl-none border-2 border-gray-100 shadow-sm relative group-hover:border-purple-100 transition";
    
    // 3. NESTED REPLY (mockup: 3. NESTED REPLY)
    // bg-gray-50 p-4 rounded-[1.5rem] rounded-tl-none border border-gray-100 relative hover:bg-white hover:shadow-sm transition
    const replyBubbleClass = "bg-gray-50 p-4 rounded-[1.5rem] rounded-tl-none border border-gray-100 relative hover:bg-white hover:shadow-sm transition";

    let cardClass = userBubbleClass;
    if (isExpert) cardClass = expertBubbleClass;
    else if (isReply) cardClass = replyBubbleClass;

    // Avatar Container
    const avatarContainerClass = isExpert 
        ? "w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-200 p-0.5 overflow-hidden ring-4 ring-blue-50 relative hover:scale-105 transition"
        : isReply 
            ? "w-10 h-10 rounded-xl bg-white border-2 border-gray-100 p-0.5 overflow-hidden hover:border-purple-300 transition"
            : "w-14 h-14 rounded-2xl bg-white border-2 border-gray-200 p-0.5 overflow-hidden hover:border-purple-400 transition relative";

    // Girinti
    const containerClass = isReply ? "flex gap-4 ml-16 group mt-4" : "flex gap-4 group mb-6";
    
    // Get profile link - may be null for guest users
    const profileLink = getProfileLink(author);
    
    // Wrapper component for author name - renders as link if profileLink exists, otherwise plain text
    const AuthorNameLink = ({ children, className }: { children: React.ReactNode, className: string }) => {
        if (profileLink) {
            return <Link href={profileLink} className={className}>{children}</Link>;
        }
        return <span className={className}>{children}</span>;
    };

    return (
      <div className={containerClass}>
          {/* Avatar Kolonu */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            {profileLink ? (
                <Link href={profileLink} className={avatarContainerClass}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={author.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${author.name}`} 
                    alt={author.name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {/* Online / Expert Badge in Avatar */}
                  {isExpert ? (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] border-2 border-white">
                          <i className="fa-solid fa-check"></i>
                      </div>
                  ) : (
                      !isReply && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </Link>
            ) : (
                <div className={avatarContainerClass}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={author.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${author.name}`} 
                    alt={author.name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {/* Online / Expert Badge in Avatar */}
                  {isExpert ? (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] border-2 border-white">
                          <i className="fa-solid fa-check"></i>
                      </div>
                  ) : (
                      !isReply && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
            )}
            
            {/* Kullanıcı Skoru / Uzman Puanı */}
            {!isReply && (
                isExpert ? (
                    <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg mt-1 border border-blue-700 shadow-sm flex items-center gap-1 w-full justify-center">
                        <i className="fa-solid fa-star text-yellow-300"></i> 5.0
                    </div>
                ) : (
                    <div className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-lg mt-1 border border-yellow-200 shadow-sm flex items-center gap-1" title="Seviye">
                        <i className="fa-solid fa-bolt text-yellow-500"></i> Lvl {author.level || 1}
                    </div>
                )
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* İçerik Balonu */}
            <div className={cardClass}>
              <div className="flex justify-between items-start mb-2">
                <div>
                    {isExpert ? (
                        <div className="flex items-center gap-2">
                            <AuthorNameLink className="font-extrabold text-blue-900 text-sm hover:underline">
                                {author.name}
                            </AuthorNameLink>
                            <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-blue-200">
                                UZMAN
                            </span>
                        </div>
                    ) : (
                        <AuthorNameLink className="font-extrabold text-gray-800 text-sm hover:text-purple-600 transition">
                            {author.name}
                        </AuthorNameLink>
                    )}
                    <span className="text-[10px] font-bold text-gray-400 ml-2 md:ml-0 block md:inline md:ml-2 mt-0.5 md:mt-0">{comment.timeAgo}</span>
                </div>
                
                {/* Rapor Et Butonu (Sadece hover'da görünür vs. eklenebilir) */}
                <button className="text-gray-300 hover:text-red-400 transition bg-transparent hover:bg-red-50 w-6 h-6 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-flag text-[10px]"></i>
                </button>
              </div>

              {/* Yorum Metni */}
              <div 
                className={`text-sm font-bold leading-relaxed ${isExpert ? 'text-gray-700' : 'text-gray-600'}`}
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            </div>

            {/* Aksiyonlar (Beğen / Yanıtla) */}
            <div className="flex items-center gap-4 mt-2 ml-4">
                <button 
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 text-xs font-black uppercase transition px-3 py-1.5 rounded-xl border-2 border-transparent ${
                      isExpert 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100' 
                      : (comment.is_liked ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-white hover:text-green-500 hover:bg-green-50 hover:border-green-100')
                  }`}
                >
                    <i className={`${comment.is_liked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up text-lg`}></i> 
                    {comment.likes_count > 0 ? comment.likes_count : ''} Beğeni
                </button>
                
                <button 
                  onClick={() => setReplyTo({id: comment.id, authorName: author.name})}
                  className={`text-xs font-black uppercase transition px-3 py-1.5 rounded-xl ${
                      isExpert
                      ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                    Yanıtla
                </button>
            </div>

            {/* Yanıt Formu (Inline) */}
            {replyTo?.id === comment.id && (
               <div className="mt-4 ml-2 animate-fade-in">
                 <div className="flex items-center justify-between mb-2 px-2 bg-purple-50 py-1 rounded-lg border border-purple-100">
                    <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                        <i className="fa-solid fa-share text-[10px]"></i> 
                        @{replyTo.authorName} yanıtlanıyor...
                    </span>
                    <button onClick={() => setReplyTo(null)} className="text-xs font-bold text-gray-400 hover:text-red-500 transition">
                        <i className="fa-solid fa-times"></i>
                    </button>
                 </div>
                 <CommentForm isReply={true} />
               </div>
            )}

            {/* Alt Yorumlar (Recursive) */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
      </div>
    );
  };

  // ---------------------------------------------
  // COMMENT FORM COMPONENT (Mockup "YORUM YAZMA ALANI" ile Birebir)
  // ---------------------------------------------
  const CommentForm = ({ isReply = false }) => {
    // Reply modunda biraz daha sade olabilir ama mockup yapısını koruyalım
    const containerClass = isReply 
        ? "bg-white rounded-[1.5rem] p-2 border-2 border-purple-100 relative group focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-50 transition-all duration-300"
        : "bg-white rounded-[2rem] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-gray-100 relative group focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-50 transition-all duration-300";

    return (
        <div className={containerClass}>
            <div className="flex gap-3 p-4">
                <div className="shrink-0 hidden md:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={user?.isLoggedIn ? user.avatar : "https://api.dicebear.com/9.x/personas/svg?seed=Guest"} 
                        className="w-12 h-12 rounded-2xl bg-gray-100 border-2 border-gray-100 object-cover" 
                        alt="Me" 
                    />
                    {user?.isLoggedIn && !isReply && (
                        <div className="text-[10px] font-black text-center text-purple-600 mt-1 bg-purple-50 rounded-md py-0.5">
                            LVL {user.level || 1}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 relative">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-transparent border-none p-2 text-sm font-bold text-gray-700 placeholder:text-gray-400 outline-none resize-none h-16" 
                        placeholder={user?.isLoggedIn ? "Düşüncelerini paylaş..." : "Yorum yapmak için giriş yapmalısın..."}
                        disabled={!user?.isLoggedIn}
                    ></textarea>
                    
                    {/* Emoji Button (Visual Only for now) */}
                    <button className="absolute bottom-0 left-0 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 p-1.5 rounded-lg transition">
                        <i className="fa-regular fa-face-smile text-xl"></i>
                    </button>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={`flex justify-between items-center bg-gray-50/80 p-2 rounded-[1.5rem] mt-2 ${isReply ? 'bg-purple-50/50' : ''}`}>
                <div className="flex items-center gap-2 px-3">
                    {allowRating && !isReply && (
                        <div className="flex gap-1 mr-4 border-r border-gray-200 pr-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setRating(star)} className={`text-lg hover:scale-110 transition ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    <i className="fa-solid fa-star"></i>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {!isReply && (
                        <>
                            <i className="fa-solid fa-coins text-yellow-500 animate-bounce"></i>
                            <span className="text-[10px] md:text-xs font-black text-yellow-600 uppercase tracking-wide hidden md:inline">
                                Yorum yap, <span className="text-yellow-500">+2 Puan</span> kazan!
                            </span>
                        </>
                    )}
                </div>
                
                <button 
                    onClick={handleSubmit}
                    disabled={!user?.isLoggedIn || !newComment.trim()}
                    className="bg-purple-600 text-white px-6 md:px-8 py-3 rounded-2xl font-extrabold text-xs uppercase shadow-[0_4px_0_rgb(107,33,168)] hover:bg-purple-500 hover:shadow-[0_2px_0_rgb(107,33,168)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                >
                    Gönder <i className="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-nunito">
        
        {/* YORUM BAŞLIĞI */}
        <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <i className="fa-regular fa-comments text-gray-400"></i>
                {title} <span className="bg-gray-200 text-gray-600 text-sm px-2 py-1 rounded-lg ml-1">{comments.length}</span>
            </h3>
            
            {/* Sıralama (Visual) */}
            <div className="flex items-center gap-2 text-xs font-bold bg-white px-4 py-2 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-purple-300 transition text-gray-500">
                <span>En Popüler</span>
                <i className="fa-solid fa-chevron-down"></i>
            </div>
        </div>

        {/* GİRİŞ UYARISI */}
        {!user?.isLoggedIn && (
            <div className="bg-orange-50 border-2 border-orange-100 p-4 rounded-2xl flex items-center gap-3 text-orange-700 font-bold text-sm">
                <i className="fa-solid fa-lock text-xl"></i>
                <div>Yorum yazmak için <Link href="/login" className="underline font-black">giriş yapmalısın</Link>.</div>
            </div>
        )}

        {/* YORUM YAZMA ALANI */}
        <CommentForm />

        {/* YORUM LİSTESİ */}
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <i className="fa-solid fa-circle-notch animate-spin text-3xl text-purple-300"></i>
                </div>
            ) : comments.length > 0 ? (
                comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                ))
            ) : (
                <div className="text-center py-12 text-gray-400 font-bold">
                    Henüz yorum yok. İlk yorumu sen yap!
                </div>
            )}
        </div>

    </div>
  );
}