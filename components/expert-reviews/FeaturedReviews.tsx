"use client";

import { CommentData } from "@/lib/comment-service";

interface FeaturedReviewsProps {
  reviews: CommentData[];
}

const renderStars = (score: number) => {
  return (
    <div className="flex text-yellow-400 text-sm gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <i 
          key={star} 
          className={`fa-star ${star <= score ? 'fa-solid' : 'fa-regular text-gray-200'}`}
        ></i>
      ))}
    </div>
  );
};

export default function FeaturedReviews({ reviews }: FeaturedReviewsProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-award text-yellow-500"></i>
        Öne Çıkan Değerlendirmeler
      </h3>
      
      <div className={`grid grid-cols-1 ${reviews.length > 1 ? 'md:grid-cols-2' : ''} ${reviews.length > 2 ? 'lg:grid-cols-3' : ''} gap-6`}>
        {reviews.map((review) => (
          <div 
            key={review.id}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-[2rem] p-6 shadow-lg relative overflow-hidden group hover:shadow-xl transition"
          >
            {/* Featured Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <i className="fa-solid fa-star text-lg"></i>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-yellow-200 overflow-hidden shrink-0 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={review.author.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${review.author.name}`} 
                  className="w-full h-full object-cover" 
                  alt={review.author.name} 
                />
              </div>
              <div className="flex-1">
                <span className="font-extrabold text-gray-800 text-sm block">
                  {review.author.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {review.rating && renderStars(review.rating)}
                  {review.author.is_verified && (
                    <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      <i className="fa-solid fa-check-circle"></i> Onaylı
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Review Content */}
            <p className="text-sm font-bold text-gray-700 leading-relaxed bg-white/60 p-4 rounded-xl border border-yellow-100 line-clamp-4">
              {review.content}
            </p>

            {/* Date */}
            <div className="mt-3 text-xs font-bold text-gray-400 flex items-center justify-between">
              <span>{review.timeAgo}</span>
              {review.likes_count > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <i className="fa-solid fa-heart"></i> {review.likes_count}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
