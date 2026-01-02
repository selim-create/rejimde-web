"use client";

import { useState } from "react";
import { CommentData } from "@/lib/comment-service";

interface ReviewCardProps {
  review: CommentData;
  expertSlug?: string;
  onLike: (commentId: number) => void;
  onReply?: (commentId: number) => void;
  canReply: boolean;
  user: {
    isLoggedIn: boolean;
    name: string;
    slug: string;
    avatar: string;
    role: string;
  } | null;
}

// Helper function to get display name (anonymous or full)
const getDisplayName = (authorName: string, isAnonymous: boolean) => {
  if (isAnonymous) {
    const initials = authorName
      .split(' ')
      .map(word => word[0])
      .join('.')
      .toUpperCase();
    return initials + '.';
  }
  return authorName;
};

const emojis = ['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '😡', '🎉', '💪'];

export default function ReviewCard({ 
  review, 
  expertSlug, 
  onLike, 
  onReply, 
  canReply,
  user 
}: ReviewCardProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const addEmoji = (emoji: string) => {
    setReplyContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const isOwnComment = user?.isLoggedIn && (
    (user?.slug && review.author.slug === user.slug) || 
    (review.author.name === user?.name)
  );

  // Check if this is an anonymous review (we'll add metadata later)
  const isAnonymous = false; // TODO: Get from review metadata

  return (
    <div className="bg-white rounded-[2rem] p-6 border-2 border-gray-100 shadow-sm hover:border-gray-200 transition group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={review.author.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${review.author.name}`} 
              className="w-full h-full object-cover" 
              alt={review.author.name} 
            />
          </div>
          <div>
            <span className="font-extrabold text-gray-800 text-sm hover:text-green-600 transition block">
              {getDisplayName(review.author.name, isAnonymous)}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {review.author.rank && (
                <span className="bg-yellow-100 text-yellow-700 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 border border-yellow-200">
                  <i className="fa-solid fa-bolt"></i> RANK {review.author.rank}
                </span>
              )}
              {review.author.is_verified && (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                  <i className="fa-solid fa-check-circle"></i> Onaylı Danışan
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {review.rating !== undefined && review.rating !== null && review.rating > 0 && (
            <div className="flex text-yellow-400 text-xs mb-1">
              {[...Array(5)].map((_, i) => (
                <i key={i} className={`fa-star ${i < (review.rating || 0) ? 'fa-solid' : 'fa-regular text-gray-200'}`}></i>
              ))}
            </div>
          )}
          <span className="text-[10px] font-bold text-gray-400">{review.timeAgo}</span>
        </div>
      </div>

      <p className="text-sm font-bold text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-50 whitespace-pre-line">
        {review.content}
      </p>
      
      <div className="flex items-center gap-4 mt-3 ml-2">
        <button 
          onClick={() => onLike(review.id)} 
          className={`text-xs font-bold flex items-center gap-1 transition ${review.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <i className={`${review.is_liked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i> 
          {review.likes_count > 0 ? review.likes_count : 'Beğen'}
        </button>
        {canReply && onReply && (
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)} 
            className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition"
          >
            Yanıtla
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-4 ml-6 animate-in fade-in slide-in-from-top-2">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">
                @{review.author.name} yanıtlanıyor...
              </span>
              <button 
                onClick={() => setShowReplyForm(false)} 
                className="text-gray-400 hover:text-red-500"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="relative">
              <textarea 
                value={replyContent} 
                onChange={(e) => setReplyContent(e.target.value)} 
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-indigo-400 resize-none h-20" 
                placeholder="Yanıtınızı yazın..."
              />
              <div className="absolute bottom-2 left-2">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  className="text-gray-400 hover:text-yellow-500 p-1 rounded"
                >
                  <i className="fa-regular fa-face-smile text-lg"></i>
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-8 left-0 bg-white shadow-xl border border-gray-100 rounded-xl p-2 grid grid-cols-5 gap-1 z-30 w-48">
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
            <div className="flex justify-end mt-2">
              <button 
                onClick={() => {
                  if (onReply && replyContent.trim()) {
                    onReply(review.id);
                    setReplyContent("");
                    setShowReplyForm(false);
                  }
                }} 
                disabled={!replyContent.trim()} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {review.replies && review.replies.map(reply => {
        const isReplyFromExpert = reply.author.is_expert || (expertSlug && reply.author.slug === expertSlug);
        return (
          <div 
            key={reply.id} 
            className={`mt-3 ml-6 p-4 rounded-2xl rounded-tl-none relative ${
              isReplyFromExpert 
                ? 'bg-blue-50/80 border-l-4 border-blue-500' 
                : 'bg-gray-50 border-l-4 border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${
                isReplyFromExpert 
                  ? 'bg-blue-100 border-blue-200' 
                  : 'bg-gray-200 border-gray-300'
              }`}>
                <i className={`fa-solid ${
                  isReplyFromExpert 
                    ? 'fa-user-doctor text-blue-600' 
                    : 'fa-user text-gray-500'
                } text-xs`}></i>
              </div>
              <span className={`font-black text-xs ${
                isReplyFromExpert ? 'text-blue-800' : 'text-gray-700'
              }`}>
                {reply.author.name}
              </span>
              {isReplyFromExpert && (
                <span className="bg-blue-200 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase ml-2">
                  UZMAN
                </span>
              )}
              <span className="text-[9px] text-gray-400 ml-auto">{reply.timeAgo}</span>
            </div>
            <p className="text-xs font-bold text-gray-600 pl-8 whitespace-pre-line">
              {reply.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
