"use client";

import { useState } from "react";
import { ReviewFormData } from "@/types/expert-reviews";
import { GOAL_TAGS, PROGRAM_TYPES } from "@/lib/constants";

interface ReviewFormProps {
  user: {
    isLoggedIn: boolean;
    name: string;
    avatar: string;
  } | null;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  isSubmitting: boolean;
}

const emojis = ['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '😡', '🎉', '💪'];

export default function ReviewForm({ user, onSubmit, isSubmitting }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    content: "",
    isAnonymous: false,
    goalTag: undefined,
    programType: undefined,
    processWeeks: undefined,
    wouldRecommend: true,
    hasSuccessStory: false,
    successStory: undefined,
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addEmoji = (emoji: string) => {
    setFormData(prev => ({ ...prev, content: prev.content + emoji }));
    setShowEmojiPicker(false);
  };

  const handleSubmit = async () => {
    if (formData.rating === 0 || !formData.content.trim()) {
      return;
    }
    await onSubmit(formData);
    // Reset form
    setFormData({
      rating: 0,
      content: "",
      isAnonymous: false,
      goalTag: undefined,
      programType: undefined,
      processWeeks: undefined,
      wouldRecommend: true,
      hasSuccessStory: false,
      successStory: undefined,
    });
    setShowAdvanced(false);
  };

  if (!user?.isLoggedIn) {
    return null;
  }

  return (
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

        {/* Rating */}
        <div className="flex gap-2 mb-4 justify-center bg-gray-50 p-3 rounded-xl border border-gray-100">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => setFormData(prev => ({ ...prev, rating: star }))} 
              className={`fa-solid fa-star text-3xl transition transform hover:scale-110 ${
                formData.rating >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-400'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative mb-4">
          <textarea 
            value={formData.content} 
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))} 
            className="w-full bg-gray-50 border-2 border-indigo-50 rounded-xl p-4 text-sm font-bold text-gray-600 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none h-28" 
            placeholder="Tecrübelerini diğer danışanlarla paylaş..."
          />
          <div className="absolute bottom-3 left-3">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
              className="text-gray-400 hover:text-yellow-500 p-1 rounded transition"
            >
              <i className="fa-regular fa-face-smile text-xl"></i>
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-10 left-0 bg-white shadow-xl border border-gray-100 rounded-xl p-2 grid grid-cols-5 gap-1 z-20 w-48">
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

        {/* Anonymous Option */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
              className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition block">
                Anonim olarak paylaş
              </span>
              <span className="text-xs text-gray-400">
                Adınız baş harfleriniz olarak görünecek (örn: A.K.)
              </span>
            </div>
          </label>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-xs font-bold text-gray-500 hover:text-indigo-600 transition flex items-center justify-center gap-2 mb-3 py-2"
        >
          {showAdvanced ? 'Daha Az Bilgi' : 'Daha Fazla Bilgi Ekle (Opsiyonel)'}
          <i className={`fa-solid fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
            {/* Goal Tag */}
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 block">
                Hangi hedef için çalıştınız?
              </label>
              <select 
                value={formData.goalTag || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, goalTag: e.target.value || undefined }))}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-400 transition"
              >
                <option value="">Seçiniz (Opsiyonel)</option>
                {GOAL_TAGS.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.label}</option>
                ))}
              </select>
            </div>

            {/* Program Type */}
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 block">
                Program Tipi
              </label>
              <select 
                value={formData.programType || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, programType: e.target.value || undefined }))}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-400 transition"
              >
                <option value="">Seçiniz (Opsiyonel)</option>
                {PROGRAM_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Process Duration */}
            <div>
              <label className="text-xs font-black text-gray-400 uppercase mb-2 block">
                Süreç kaç hafta sürdü?
              </label>
              <input
                type="number"
                min="1"
                max="104"
                value={formData.processWeeks || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  processWeeks: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-400 transition"
                placeholder="Hafta sayısı (örn: 12)"
              />
            </div>

            {/* Would Recommend */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.wouldRecommend}
                  onChange={(e) => setFormData(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-bold text-gray-700 group-hover:text-green-600 transition">
                  Başkalarına tavsiye ederim
                </span>
              </label>
            </div>

            {/* Success Story */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group mb-2">
                <input
                  type="checkbox"
                  checked={formData.hasSuccessStory}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    hasSuccessStory: e.target.checked,
                    successStory: e.target.checked ? prev.successStory : undefined
                  }))}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-bold text-gray-700 group-hover:text-purple-600 transition">
                  Başarı hikayesi eklemek istiyorum
                </span>
              </label>
              {formData.hasSuccessStory && (
                <textarea
                  value={formData.successStory || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, successStory: e.target.value }))}
                  className="w-full bg-white border border-purple-200 rounded-xl p-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-purple-400 transition resize-none h-24 animate-in fade-in slide-in-from-top-2"
                  placeholder="Başarı hikayenizi paylaşın... (örn: Nasıl başladınız, neler değişti?)"
                />
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.content || formData.rating === 0} 
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-extrabold text-sm uppercase shadow-[0_4px_0_rgb(67,56,202)] hover:bg-indigo-500 hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Değerlendir'} <i className="fa-solid fa-check"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
