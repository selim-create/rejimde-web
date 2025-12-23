'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LayoutWrapper from '@/components/LayoutWrapper';
import { auth } from '@/lib/api';

const CATEGORIES = [
    { name: 'Tümü', icon: 'fa-layer-group', color: 'text-gray-600', bg: 'bg-gray-100' },
    { name: 'Fitness', icon: 'fa-dumbbell', color: 'text-red-500', bg: 'bg-red-50' },
    { name: 'Yoga', icon: 'fa-yin-yang', color: 'text-purple-500', bg: 'bg-purple-50' },
    { name: 'Beslenme', icon: 'fa-carrot', color: 'text-green-500', bg: 'bg-green-50' },
    { name: 'Pilates', icon: 'fa-person-praying', color: 'text-blue-500', bg: 'bg-blue-50' },
];

export default function DictionaryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await auth.getDictionaryItems(searchTerm, activeCategory);
        setItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
        fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, activeCategory]);

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50">
      
      {/* HEADER */}
      <div className="bg-indigo-600 text-white pt-12 pb-20 relative overflow-hidden rounded-b-[3rem] shadow-lg mb-8">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '24px 24px'}}></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-sm">Rejimde Wiki</h1>
            <p className="text-indigo-100 font-bold text-lg mb-8 max-w-xl mx-auto opacity-90">
                Bilgi olmadan disiplin olmaz. Hareketi doğrusunu öğren, terimleri keşfet.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
                <input 
                    type="text" 
                    placeholder="Terim ara (Örn: Squat, Makro, Plank)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white text-gray-800 border-4 border-indigo-400/50 focus:border-indigo-300 rounded-2xl py-4 pl-14 pr-4 font-bold outline-none transition text-lg shadow-xl placeholder:text-gray-400" 
                />
                <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 transform -translate-y-1/2 text-indigo-400 text-xl group-focus-within:text-indigo-600 transition-colors"></i>
            </div>
        </div>
      </div>

      <LayoutWrapper>
        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
            
            {/* CATEGORY FILTERS */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
                {CATEGORIES.map((cat) => (
                    <button 
                        key={cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`px-6 py-3 rounded-2xl font-extrabold text-sm shadow-md transition-all hover:-translate-y-1 flex items-center gap-2 ${
                            activeCategory === cat.name 
                            ? 'bg-gray-800 text-white ring-4 ring-gray-200' 
                            : 'bg-white text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <i className={`fa-solid ${cat.icon} ${activeCategory === cat.name ? 'text-white' : cat.color}`}></i>
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* CONTENT GRID */}
            {loading ? (
                 <div className="flex justify-center py-20">
                     <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                 </div>
            ) : items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {items.map((item) => (
                        <Link href={`/sozluk/${item.slug}`} key={item.id} className="group bg-white border-2 border-gray-100 rounded-3xl p-4 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-2 cursor-pointer">
                            <div className="relative h-48 bg-gray-100 rounded-2xl overflow-hidden mb-4 border border-gray-100 group-hover:border-indigo-100">
                                
                                {/* MEDYA MANTIĞI: Önce Görsel, Yoksa Video Thumbnail, Hiçbiri Yoksa İkon */}
                                {item.image ? (
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                ) : item.video_url ? (
                                    <>
                                        <img 
                                            src={`https://img.youtube.com/vi/${item.video_url}/hqdefault.jpg`} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:scale-110 transition">
                                                <i className="fa-solid fa-play text-red-600 ml-1"></i>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                        <i className="fa-solid fa-book-open text-5xl opacity-50"></i>
                                    </div>
                                )}
                                
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-black text-indigo-600 uppercase shadow-sm">
                                    {item.category}
                                </div>
                            </div>
                            
                            <div className="px-2 pb-2 flex-1 flex flex-col">
                                <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</h3>
                                <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-4 flex-1">
                                    {item.excerpt || item.benefit || "Bu terim hakkında detaylı bilgiyi inceleyin."}
                                </p>
                                
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                                    <div className="flex gap-2">
                                         {item.muscles && item.muscles.length > 0 && (
                                             <span className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-1 rounded-md">{item.muscles[0]}</span>
                                         )}
                                    </div>
                                    <span className="text-xs font-bold text-indigo-500 uppercase group-hover:underline flex items-center gap-1">
                                        İncele <i className="fa-solid fa-arrow-right"></i>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <i className="fa-solid fa-file-circle-question text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-xl font-bold text-gray-600">Sonuç Bulunamadı</h3>
                    <p className="text-gray-400">Aradığın terim henüz sözlüğümüze eklenmemiş olabilir.</p>
                </div>
            )}

        </div>
      </LayoutWrapper>
    </div>
  );
}