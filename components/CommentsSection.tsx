'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchComments, postComment, toggleLikeComment, CommentData } from '@/lib/comment-service';

// --- SABİTLER: DETAYLI UZMANLIK KATEGORİLERİ ---
const SPECIALTY_CATEGORIES = [
    {
        title: "Beslenme",
        theme: "green",
        icon: "fa-carrot",
        items: [{ id: "dietitian_spec", label: "Diyetisyen" }, { id: "dietitian", label: "Diyetisyen" }, { id: "nutritionist", label: "Beslenme Uzmanı" }]
    },
    {
        title: "Hareket",
        theme: "blue",
        icon: "fa-dumbbell",
        items: [
            { id: "pt", label: "PT / Fitness Koçu" },
            { id: "trainer", label: "Antrenör" },
            { id: "yoga", label: "Yoga / Pilates" },
            { id: "functional", label: "Fonksiyonel Antrenman" },
            { id: "swim", label: "Yüzme Eğitmeni" },
            { id: "run", label: "Koşu Eğitmeni" }
        ]
    },
    {
        title: "Zihin & Alışkanlık",
        theme: "purple",
        icon: "fa-brain",
        items: [
            { id: "life_coach", label: "Yaşam Koçu" },
            { id: "breath", label: "Nefes & Meditasyon" },
            { id: "psychologist", label: "Psikolog" }
        ]
    },
    {
        title: "Sağlık Destek",
        theme: "teal",
        icon: "fa-user-doctor",
        items: [
            { id: "physio", label: "Fizyoterapist" },
            { id: "doctor", label: "Doktor" }
        ]
    },
    {
        title: "Kardiyo & Güç",
        theme: "red",
        icon: "fa-heart-pulse",
        items: [
            { id: "box", label: "Boks / Kickboks" },
            { id: "defense", label: "Savunma & Kondisyon" }
        ]
    }
];

// Helper: Meslek Label
const getProfessionLabel = (slug: string = '') => {
    const slugLower = slug.toLowerCase();
    for (const cat of SPECIALTY_CATEGORIES) {
        const found = cat.items.find(item => item.id === slugLower || slugLower.includes(item.id));
        if (found) return found.label;
    }
    return slug;
};

// Helper: Stil
const getExpertStyle = (profession: string = '') => {
    const prof = profession.toLowerCase();
    let category = SPECIALTY_CATEGORIES.find(cat => 
        cat.items.some(item => item.id === prof || prof.includes(item.id))
    );

    const theme = category ? category.theme : 'indigo';
    const icon = category ? category.icon : 'fa-user-doctor';

    return {
        theme,
        bg: `bg-${theme}-50/50`,
        border: `border-${theme}-100`,
        hoverBorder: `group-hover:border-${theme}-200`,
        text: `text-${theme}-900`,
        badge: `bg-${theme}-100 text-${theme}-700 border-${theme}-200`,
        iconColor: `text-${theme}-600`,
        iconBg: `bg-${theme}-50`,
        button: `text-${theme}-600 bg-${theme}-50 hover:bg-${theme}-100 border-${theme}-100`,
        decorationIcon: icon
    };
};

// Helper: Placeholder Metni
const getPlaceholder = (context: string) => {
    switch (context) {
        case 'diet': return "Bu diyet nasıldı? Deneyimini paylaş...";
        case 'exercise': return "Bu egzersiz nasıldı? Zorlandın mı?";
        case 'expert': return "Bu uzmanla deneyimin nasıldı?";
        case 'dictionary': return "Bu terim hakkında eklemek istediklerin var mı?";
        default: return "Düşüncelerini paylaş...";
    }
};

interface CommentsSectionProps {
  postId: number;
  context: 'blog' | 'expert' | 'diet' | 'exercise' | 'dictionary';
  title?: string;
  allowRating?: boolean;
  expertId?: number;
}

// --- ANA COMPONENT ---
export default function CommentsSection({
  postId,
  context,
  title = "Yorumlar",
  allowRating = false,
  expertId
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<{id: number, authorName: string} | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'oldest'>('newest');
  
  // User state
  const [user, setUser] = useState<{ isLoggedIn: boolean, name: string, slug: string, avatar: string, role: string, rank?: number, score?: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        const storedRank = localStorage.getItem('user_rank') || localStorage.getItem('user_level'); // backward compatibility
        const storedScore = localStorage.getItem('user_score');
        setUser({
          isLoggedIn: true,
          name: localStorage.getItem('user_name') || 'Kullanıcı',
          slug: localStorage.getItem('user_slug') || '', // Slug eklendi
          avatar: localStorage.getItem('user_avatar') || `https://api.dicebear.com/9.x/avataaars/svg?seed=User`,
          role: localStorage.getItem('user_role') || 'rejimde_user',
          rank: storedRank ? parseInt(storedRank) : 1,
          score: storedScore ? parseInt(storedScore) : 0
        });
      }
    }
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setIsLoading(true);
    const result = await fetchComments(postId, context);
    const data = Array.isArray(result) ? result : (result.comments || []);
    setComments(data); 
    setIsLoading(false);
  };

  const handlePostComment = useCallback(async (content: string, rating: number) => {
    try {
      await postComment({
        post: postId,
        content: content,
        context: context,
        parent: replyTo ? replyTo.id : 0,
        rating: (allowRating && !replyTo) ? rating : undefined,
      });
      
      setReplyTo(null);
      loadComments();
    } catch (error: any) {
      alert(error.message || 'Yorum gönderilirken bir hata oluştu.');
    }
  }, [postId, context, replyTo, allowRating]);

  const handleLike = useCallback(async (commentId: number) => {
    if (!user?.isLoggedIn) return alert("Beğenmek için giriş yapmalısın.");
    
    setComments(prevComments => updateCommentLikeInTree(prevComments, commentId));
    
    try {
        await toggleLikeComment(commentId);
    } catch (e) {
        setComments(prevComments => updateCommentLikeInTree(prevComments, commentId));
    }
  }, [user]);

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

  // Kullanıcı bu içeriği daha önce değerlendirmiş mi? (Blog hariç)
  const hasAlreadyReviewed = React.useMemo(() => {
      if (!user?.isLoggedIn || context === 'blog') return false;
      // Kullanıcının slug'ı veya ismiyle eşleşen ana yorum var mı?
      return comments.some(c => c.parent === 0 && (c.author.slug === user.slug || c.author.name === user.name));
  }, [comments, user, context]);

  // Yorum sıralama
  const sortedComments = React.useMemo(() => {
    const sorted = [...comments].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'popular') return (b.likes_count || 0) - (a.likes_count || 0);
      return 0;
    });
    return sorted;
  }, [comments, sortBy]);

  const placeholderText = getPlaceholder(context);

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-nunito">
        
        {/* YORUM BAŞLIĞI */}
        <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <i className="fa-regular fa-comments text-gray-400"></i>
                {title} <span className="bg-gray-200 text-gray-600 text-sm px-2 py-1 rounded-lg ml-1">{comments.length}</span>
            </h3>
            
            <div className="relative group">
                <button className="flex items-center gap-2 text-xs font-bold bg-white px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition text-gray-500">
                    <span>
                        {sortBy === 'newest' && 'En Yeni'}
                        {sortBy === 'popular' && 'En Popüler'}
                        {sortBy === 'oldest' && 'En Eski'}
                    </span>
                    <i className="fa-solid fa-chevron-down"></i>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white border-2 border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button onClick={() => setSortBy('newest')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-purple-50 transition rounded-t-xl">
                        En Yeni
                    </button>
                    <button onClick={() => setSortBy('popular')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-purple-50 transition">
                        En Popüler
                    </button>
                    <button onClick={() => setSortBy('oldest')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-purple-50 transition rounded-b-xl">
                        En Eski
                    </button>
                </div>
            </div>
        </div>

        {/* GİRİŞ UYARISI */}
        {!user?.isLoggedIn && (
            <div className="bg-orange-50 border-2 border-orange-100 p-4 rounded-2xl flex items-center gap-3 text-orange-700 font-bold text-sm">
                <i className="fa-solid fa-lock text-xl"></i>
                <div>Yorum yazmak için <Link href="/login" className="underline font-black">giriş yapmalısın</Link>.</div>
            </div>
        )}

        {/* YORUM YAZMA ALANI (ANA) */}
        {/* Eğer kullanıcı zaten değerlendirmişse ana formu gösterme */}
        {hasAlreadyReviewed ? (
            <div className="bg-green-50 border-2 border-green-100 p-4 rounded-2xl flex items-center justify-center gap-3 text-green-700 font-bold text-sm shadow-sm">
                <i className="fa-solid fa-circle-check text-xl"></i>
                <span>Bu içeriği zaten değerlendirdiniz. Teşekkürler!</span>
            </div>
        ) : (
            <CommentForm 
                user={user} 
                onSubmit={handlePostComment}
                allowRating={allowRating}
                placeholder={placeholderText}
            />
        )}

        {/* YORUM LİSTESİ */}
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <i className="fa-solid fa-circle-notch animate-spin text-3xl text-purple-300"></i>
                </div>
            ) : sortedComments.length > 0 ? (
                sortedComments.map(comment => (
                    <MemoizedCommentItem 
                        key={comment.id} 
                        comment={comment} 
                        user={user}
                        onLike={handleLike}
                        onReply={(id, name) => setReplyTo({id, authorName: name})}
                        replyTo={replyTo}
                        onCancelReply={() => setReplyTo(null)}
                        onFormSubmit={handlePostComment}
                    />
                ))
            ) : (
                <div className="text-center py-12 text-gray-400 font-bold">
                    Henüz yorum yok. İlk değerlendirmeyi sen yap!
                </div>
            )}
        </div>

    </div>
  );
}

// ---------------------------------------------
// ALT BİLEŞENLER
// ---------------------------------------------

interface CommentFormProps {
    user: any;
    onSubmit: (content: string, rating: number) => void;
    allowRating?: boolean;
    isReply?: boolean;
    autoFocus?: boolean;
    placeholder?: string;
}

const CommentForm = ({ user, onSubmit, allowRating, isReply = false, autoFocus = false, placeholder }: CommentFormProps) => {
    const [text, setText] = useState('');
    const [rating, setRating] = useState(0);
    const [showEmoji, setShowEmoji] = useState(false);
    
    const emojis = ['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '😡', '🎉', '💪'];

    const addEmoji = (emoji: string) => {
        setText(prev => prev + emoji);
        setShowEmoji(false);
    };

    const handleSubmit = () => {
        if (!text.trim()) return;
        onSubmit(text, rating);
        setText('');
        setRating(0);
    };

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
                            {user.role === 'rejimde_pro' ? `${user.score || 0} XP` : `RANK ${user.rank || 1}`}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 relative">
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-transparent border-none p-2 text-sm font-bold text-gray-700 placeholder:text-gray-400 outline-none resize-none h-16" 
                        placeholder={placeholder || (user?.isLoggedIn ? "Düşüncelerini paylaş..." : "Yorum yapmak için giriş yapmalısın...")}
                        disabled={!user?.isLoggedIn}
                        autoFocus={autoFocus}
                    ></textarea>
                    
                    <div className="absolute bottom-0 left-0 relative">
                        <button 
                            type="button"
                            onClick={() => setShowEmoji(!showEmoji)}
                            className="text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 p-1.5 rounded-lg transition"
                        >
                            <i className="fa-regular fa-face-smile text-xl"></i>
                        </button>
                        
                        {showEmoji && (
                            <div className="absolute bottom-10 left-0 bg-white shadow-xl border border-gray-100 rounded-xl p-2 grid grid-cols-5 gap-1 z-50 w-48 animate-in fade-in zoom-in duration-200">
                                {emojis.map(e => (
                                    <button 
                                        key={e} 
                                        onClick={() => addEmoji(e)}
                                        className="hover:bg-gray-100 p-1 rounded text-lg transition"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                    disabled={!user?.isLoggedIn || !text.trim()}
                    className="bg-purple-600 text-white px-6 md:px-8 py-3 rounded-2xl font-extrabold text-xs uppercase shadow-[0_4px_0_rgb(107,33,168)] hover:bg-purple-500 hover:shadow-[0_2px_0_rgb(107,33,168)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                >
                    Gönder <i className="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};

interface CommentItemProps {
    comment: CommentData;
    isReply?: boolean;
    user: any;
    onLike: (id: number) => void;
    onReply: (id: number, name: string) => void;
    replyTo: {id: number, authorName: string} | null;
    onCancelReply: () => void;
    onFormSubmit: (content: string, rating: number) => void;
}

const CommentItem = ({ 
    comment, 
    isReply = false, 
    user, 
    onLike, 
    onReply, 
    replyTo, 
    onCancelReply,
    onFormSubmit
}: CommentItemProps) => {
    
    const author = comment.author || { 
        name: 'Anonim Kullanıcı', 
        avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=Anonymous',
        slug: '',
        role: 'guest', 
        is_expert: false,
        level: 1,
        profession: '',
        is_verified: false,
        is_online: false
    };

    const isExpert = author.role === 'rejimde_pro' || author.is_expert;
    const expertStyle = isExpert ? getExpertStyle(author.profession) : null;
    const professionLabel = isExpert ? getProfessionLabel(author.profession) : '';

    const expertBubbleClass = expertStyle 
        ? `${expertStyle.bg} p-5 rounded-[1.5rem] rounded-tl-none border-2 ${expertStyle.border} shadow-sm relative ${expertStyle.hoverBorder} transition overflow-hidden`
        : "bg-blue-50/50 p-5 rounded-[1.5rem] rounded-tl-none border-2 border-blue-100 shadow-sm relative group-hover:border-blue-200 transition overflow-hidden";
    
    const userBubbleClass = "bg-white p-5 rounded-[1.5rem] rounded-tl-none border-2 border-gray-100 shadow-sm relative group-hover:border-purple-100 transition";
    const replyBubbleClass = "bg-gray-50 p-4 rounded-[1.5rem] rounded-tl-none border border-gray-100 relative hover:bg-white hover:shadow-sm transition";

    let cardClass = userBubbleClass;
    if (isExpert) cardClass = expertBubbleClass;
    else if (isReply) cardClass = replyBubbleClass;

    const avatarContainerClass = isExpert && expertStyle
        ? `w-14 h-14 rounded-2xl ${expertStyle.iconBg} border-2 ${expertStyle.border} p-0.5 overflow-hidden ring-4 ring-opacity-50 ${expertStyle.theme === 'green' ? 'ring-green-50' : expertStyle.theme === 'blue' ? 'ring-blue-50' : 'ring-indigo-50'} hover:scale-105 transition shrink-0 block`
        : isReply 
            ? "w-10 h-10 rounded-xl bg-white border-2 border-gray-100 p-0.5 overflow-hidden hover:border-purple-300 transition shrink-0 block"
            : "w-14 h-14 rounded-2xl bg-white border-2 border-gray-200 p-0.5 overflow-hidden hover:border-purple-400 transition shrink-0 block";

    const containerClass = isReply ? "flex gap-4 ml-16 group mt-4" : "flex gap-4 group mb-6";
    const profileLink = author.slug ? (isExpert ? `/experts/${author.slug}` : `/profile/${author.slug}`) : null;
    const showVerifiedIcon = isExpert && author.is_verified;

    return (
      <div className={containerClass}>
          <div className="flex flex-col items-center gap-1 shrink-0">
            
            <div className="relative">
                {profileLink ? (
                    <Link href={profileLink} className={avatarContainerClass}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={author.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${author.name}`} 
                            alt={author.name} 
                            className="w-full h-full object-cover rounded-lg"
                            loading="lazy" 
                        />
                    </Link>
                ) : (
                    <div className={avatarContainerClass}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={author.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${author.name}`} 
                            alt={author.name} 
                            className="w-full h-full object-cover rounded-lg"
                            loading="lazy" 
                        />
                    </div>
                )}

                {isExpert && showVerifiedIcon && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] border-2 border-white z-30 shadow-sm" title="Onaylı Uzman">
                        <i className="fa-solid fa-check"></i>
                    </div>
                )}

                {!isReply && (
                    <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full z-30 shadow-sm ${author.is_online ? 'bg-green-500' : 'bg-gray-300'}`} title={author.is_online ? "Çevrimiçi" : "Çevrimdışı"}></div>
                )}
            </div>
            
            {!isReply && (
                isExpert ? (
                    <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg mt-1 border border-blue-700 shadow-sm flex items-center gap-1 w-full justify-center">
                        <i className="fa-solid fa-star text-yellow-300"></i> {comment.rating ? comment.rating.toFixed(1) : '5.0'}
                    </div>
                ) : (
                    <div className="flex flex-col items-center mt-1 w-full gap-1">
                        {author.rank && (
                            <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-md flex items-center gap-1">
                                <i className="fa-solid fa-bolt text-yellow-400 text-[8px]"></i> RANK {typeof author.rank === 'number' ? author.rank : author.rank}
                            </div>
                        )}
                        {(author.score || author.rank) && (
                            <span className="text-[9px] text-gray-500 font-bold bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">
                                {author.score ? `${author.score} P` : ''}
                            </span>
                        )}
                    </div>
                )
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className={cardClass}>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    {isExpert && expertStyle ? (
                        <div className="flex items-center gap-2">
                            {profileLink ? (
                                <Link href={profileLink} className={`font-extrabold ${expertStyle.text} text-sm hover:underline`}>
                                    {author.name}
                                </Link>
                            ) : (
                                <span className={`font-extrabold ${expertStyle.text} text-sm`}>
                                    {author.name}
                                </span>
                            )}
                            <span className={`${expertStyle.badge} text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border`}>
                                {professionLabel || 'UZMAN'}
                            </span>
                        </div>
                    ) : (
                        profileLink ? (
                            <Link href={profileLink} className="font-extrabold text-gray-800 text-sm hover:text-purple-600 transition">
                                {author.name}
                            </Link>
                        ) : (
                            <span className="font-extrabold text-gray-800 text-sm">
                                {author.name}
                            </span>
                        )
                    )}
                    
                    {/* PUAN GÖSTERİMİ */}
                    <div className="flex items-center gap-2 mt-1">
                        {comment.rating !== undefined && comment.rating !== null && comment.rating > 0 && (
                            <div className="flex text-yellow-400 text-[10px]">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fa-star ${i < (comment.rating || 0) ? 'fa-solid' : 'fa-regular text-gray-300'}`}></i>
                                ))}
                            </div>
                        )}
                        <span className="text-[10px] font-bold text-gray-400">{comment.timeAgo}</span>
                    </div>
                </div>
                
                <button className="text-gray-300 hover:text-red-400 transition bg-transparent hover:bg-red-50 w-6 h-6 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-flag text-[10px]"></i>
                </button>
              </div>

              <div 
                className={`text-sm font-bold leading-relaxed whitespace-pre-line relative z-10 ${isExpert ? (expertStyle ? expertStyle.text : 'text-gray-700') : 'text-gray-600'}`}
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />

              {isExpert && expertStyle && expertStyle.decorationIcon && (
                  <div className={`absolute -bottom-2 -right-2 text-6xl opacity-[0.07] transform rotate-12 pointer-events-none ${expertStyle.iconColor}`}>
                      <i className={`fa-solid ${expertStyle.decorationIcon}`}></i>
                  </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 ml-4">
                <button 
                  onClick={() => onLike(comment.id)}
                  className={`flex items-center gap-1.5 text-xs font-black uppercase transition px-3 py-1.5 rounded-xl border-2 border-transparent ${
                      isExpert && expertStyle
                      ? expertStyle.button
                      : (comment.is_liked ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-white hover:text-green-500 hover:bg-green-50 hover:border-green-100')
                  }`}
                >
                    <i className={`${comment.is_liked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up text-lg`}></i> 
                    {comment.likes_count > 0 ? comment.likes_count : ''} Beğeni
                </button>
                
                <button 
                  onClick={() => onReply(comment.id, author.name)}
                  className={`text-xs font-black uppercase transition px-3 py-1.5 rounded-xl ${
                      isExpert && expertStyle
                      ? `${expertStyle.text} hover:bg-white`
                      : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                    Yanıtla
                </button>
            </div>

            {replyTo?.id === comment.id && (
               <div className="mt-4 ml-2 animate-fade-in">
                 <div className="flex items-center justify-between mb-2 px-2 bg-purple-50 py-1 rounded-lg border border-purple-100">
                    <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                        <i className="fa-solid fa-share text-[10px]"></i> 
                        @{replyTo.authorName} yanıtlanıyor...
                    </span>
                    <button onClick={onCancelReply} className="text-xs font-bold text-gray-400 hover:text-red-500 transition">
                        <i className="fa-solid fa-times"></i>
                    </button>
                 </div>
                 <CommentForm 
                    isReply={true} 
                    user={user}
                    onSubmit={onFormSubmit}
                    autoFocus={true}
                 />
               </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => (
                  <MemoizedCommentItem 
                    key={reply.id} 
                    comment={reply} 
                    isReply={true} 
                    user={user}
                    onLike={onLike}
                    onReply={onReply}
                    replyTo={replyTo}
                    onCancelReply={onCancelReply}
                    onFormSubmit={onFormSubmit}
                  />
                ))}
              </div>
            )}
          </div>
      </div>
    );
};

const MemoizedCommentItem = React.memo(CommentItem);