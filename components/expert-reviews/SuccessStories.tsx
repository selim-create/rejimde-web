"use client";

import { SuccessStory } from "@/types/expert-reviews";
import { GOAL_TAGS } from "@/lib/constants";
import { getDisplayName } from "./utils";

interface SuccessStoriesProps {
  stories: SuccessStory[];
}

const renderStars = (score: number) => {
  return (
    <div className="flex text-yellow-400 text-xs gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <i 
          key={star} 
          className={`fa-star ${star <= score ? 'fa-solid' : 'fa-regular text-gray-200'}`}
        ></i>
      ))}
    </div>
  );
};

export default function SuccessStories({ stories }: SuccessStoriesProps) {
  if (stories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-200 shadow-sm">
      <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
        <span className="bg-purple-100 text-purple-600 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-purple-200">
          <i className="fa-solid fa-trophy"></i>
        </span>
        Başarı Hikayeleri
      </h3>

      <div className="space-y-6">
        {stories.map((story) => {
          const goalTag = GOAL_TAGS.find(tag => tag.id === story.goalTag);
          
          return (
            <div 
              key={story.id}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-[2rem] p-6 hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-black text-sm shadow-sm">
                    {getDisplayName(story.authorName, story.isAnonymous)}
                  </div>
                  <div>
                    <div className="font-black text-gray-800 text-sm">
                      {getDisplayName(story.authorName, story.isAnonymous)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(story.rating)}
                      {story.verifiedClient && (
                        <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          <i className="fa-solid fa-check-circle"></i> Onaylı
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Goal & Duration Badge */}
                <div className="flex flex-col items-end gap-1">
                  {goalTag && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">
                      <i className={`fa-solid ${goalTag.icon}`}></i>
                      {goalTag.label}
                    </span>
                  )}
                  <span className="text-xs font-bold text-gray-500">
                    {story.processWeeks} haftalık süreç
                  </span>
                </div>
              </div>

              {/* Story Content */}
              <div className="bg-white/60 rounded-xl p-4 border border-purple-100">
                <p className="text-sm font-bold text-gray-700 leading-relaxed whitespace-pre-line">
                  {story.story}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-3 text-xs font-bold text-gray-400">
                {new Date(story.createdAt).toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State Info */}
      {stories.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-book-open text-purple-400 text-2xl"></i>
          </div>
          <p className="text-gray-400 font-bold">Henüz başarı hikayesi paylaşılmamış.</p>
          <p className="text-gray-300 font-bold text-sm mt-1">İlk hikayeyi sen paylaş!</p>
        </div>
      )}
    </div>
  );
}
