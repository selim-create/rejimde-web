'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HelpHeroProps {
  onSearch?: (query: string) => void;
}

export default function HelpHero({ onSearch }: HelpHeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/help?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-rejimde-green/10 via-rejimde-blue/10 to-rejimde-purple/10 py-16 lg:py-24 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)'}}></div>
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-card border-2 border-gray-200 mb-6">
          <i className="fa-solid fa-circle-question text-4xl text-rejimde-blue"></i>
        </div>

        {/* Title */}
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 mb-4">
          Yardım & Destek Merkezi
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-gray-600 font-bold mb-8 max-w-2xl mx-auto">
          Rejimde platformunu daha iyi anlamak için aradığın her şey burada! 🎯
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ne aramak istersin? (örn: puan sistemi, circle)"
              className="w-full px-6 py-5 pl-14 rounded-3xl border-2 border-gray-200 focus:border-rejimde-blue focus:outline-none text-gray-800 font-bold shadow-card text-lg"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-rejimde-green text-white px-6 py-3 rounded-2xl font-extrabold shadow-btn shadow-rejimde-greenDark btn-game hover:bg-rejimde-greenDark transition"
            >
              Ara
            </button>
          </div>
        </form>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <span className="text-sm font-bold text-gray-500">Popüler:</span>
          <a href="/help/score-system" className="text-sm font-black text-rejimde-green hover:underline">Puan Sistemi</a>
          <a href="/help/levels" className="text-sm font-black text-rejimde-blue hover:underline">Seviyeler</a>
          <a href="/help/circles" className="text-sm font-black text-rejimde-purple hover:underline">Circle'lar</a>
          <a href="/help/streak" className="text-sm font-black text-rejimde-yellow hover:underline">Streak</a>
        </div>
      </div>
    </div>
  );
}
