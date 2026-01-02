"use client";

import { CommentData } from "@/lib/comment-service";
import ReviewCard from "./ReviewCard";

interface ReviewListProps {
  reviews: CommentData[];
  expertSlug?: string;
  onLike: (commentId: number) => void;
  onReply?: (commentId: number, replyContent: string) => void;
  user: {
    isLoggedIn: boolean;
    name: string;
    slug: string;
    avatar: string;
    role: string;
  } | null;
  isLoading?: boolean;
}

export default function ReviewList({ 
  reviews, 
  expertSlug, 
  onLike, 
  onReply,
  user,
  isLoading = false 
}: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-400 animate-pulse">
        Yorumlar Yükleniyor...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-regular fa-comment text-gray-300 text-2xl"></i>
        </div>
        <p className="text-gray-400 font-bold">Henüz değerlendirme yapılmamış.</p>
        <p className="text-gray-300 font-bold text-sm mt-1">İlk yorumu sen yap!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const isOwnComment = user?.isLoggedIn && (
          (user?.slug && review.author.slug === user.slug) || 
          (review.author.name === user?.name)
        );
        const canModerate = user?.isLoggedIn && (
          user?.role === 'rejimde_pro' || 
          user?.role === 'administrator' ||
          (expertSlug && user?.slug === expertSlug)
        );
        const canReply = !!(canModerate || isOwnComment);

        return (
          <ReviewCard
            key={review.id}
            review={review}
            expertSlug={expertSlug}
            onLike={onLike}
            onReply={canReply ? onReply : undefined}
            canReply={canReply}
            user={user}
          />
        );
      })}
    </div>
  );
}
