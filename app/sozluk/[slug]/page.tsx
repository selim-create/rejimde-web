'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/LayoutWrapper';
import { auth } from '@/lib/api';
import Link from 'next/link';
import MascotDisplay from '@/components/MascotDisplay';

// Karakter Tanımları (Narrators)
const NARRATORS: Record<string, any> = {
    'Yoga': { 
        name: 'Zeynep', 
        role: 'Yoga Eğitmeni',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Zeynep&clothing=graphicShirt&top=longHairStraight', 
        color: 'text-purple-600', 
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        intro: "Namaste! Ruhunu ve bedenini esnetmeye hazır mısın? Bu pozu sana ben anlatacağım."
    },
    'Fitness': { 
        name: 'Barış', 
        role: 'Güç Koçu',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Baris&clothing=hoodie&top=shortHairShortFlat', 
        color: 'text-red-600', 
        bg: 'bg-red-50',
        border: 'border-red-200',
        intro: "Hadi bakalım şampiyon! Bu hareketi doğru formda yaparsan gelişim kaçınılmaz."
    },
    'Beslenme': { 
        name: 'Dyt. Selin', 
        role: 'Uzman Diyetisyen',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Selin&clothing=blazerAndShirt&glasses=round', 
        color: 'text-green-600', 
        bg: 'bg-green-50',
        border: 'border-green-200',
        intro: "Vücuduna ne aldığın çok önemli. Bilimsel gerçeklerle bu terimi inceleyelim."
    },
    'Pilates': { 
        name: 'Ece', 
        role: 'Pilates Eğitmeni',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ece&clothing=overall&top=longHairBun', 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        intro: "Kontrol, denge ve nefes. Pilatesin temellerini birlikte keşfedelim."
    },
    'Default': {
        name: 'Rejimde Bot',
        role: 'Asistan',
        avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=Rejimde',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        intro: "Bilgi güçtür! İşte aradığın detaylar."
    }
};

export default function DictionaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [learned, setLearned] = useState(false);

  useEffect(() => {
    async function fetchData() {
        try {
            const data = await auth.getDictionaryItem(slug);
            if (data) {
                setItem(data);
            } else {
                // Bulunamadıysa listeye yönlendirilebilir veya hata gösterilebilir
                // router.push('/sozluk');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [slug]);

  const handleLearn = () => {
      // Puan kazanma (Simülasyon)
      setLearned(true);
      // auth.earnPoints('read_blog') gibi bir aksiyon tetiklenebilir
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
  );
  
  if (!item) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
          <MascotDisplay state="cheat_meal_detected" size={180} showBubble={false} />
          <h2 className="text-2xl font-black text-gray-800 mt-4">İçerik Bulunamadı</h2>
          <p className="text-gray-500 font-bold mb-6">Aradığın terim silinmiş veya taşınmış olabilir.</p>
          <Link href="/sozluk" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-extrabold uppercase shadow-btn btn-game">Sözlüğe Dön</Link>
      </div>
  );

  // Kategoriye göre anlatıcı seç
  const narrator = NARRATORS[item.category] || NARRATORS['Default'];

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-800 bg-gray-50/50">
        
        {/* HERO HEADER */}
        <div className="bg-white border-b-2 border-gray-200 pt-24 pb-12 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
             
             <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                 <Link href="/sozluk" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold text-xs uppercase mb-6 transition bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50">
                    <i className="fa-solid fa-arrow-left"></i> Sözlüğe Dön
                 </Link>
                 
                 <div className="flex justify-center mb-6">
                     <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${narrator.bg} ${narrator.color} border-2 ${narrator.border} shadow-sm`}>
                        {item.category}
                     </span>
                 </div>
                 
                 <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">{item.title}</h1>
                 
                 {item.benefit && (
                     <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 max-w-2xl mx-auto transform -rotate-1 shadow-sm">
                         <p className="text-lg md:text-xl text-yellow-800 font-bold leading-relaxed">
                             <i className="fa-solid fa-star text-yellow-500 mr-2"></i>
                             &quot;{item.benefit}&quot;
                         </p>
                     </div>
                 )}
             </div>
        </div>

        <LayoutWrapper>
            <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* LEFT CONTENT */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* MEDIA CARD (Video or Image) */}
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border-2 border-gray-200 aspect-video relative group">
                        {item.video_url ? (
                            <iframe 
                                className="w-full h-full" 
                                src={`https://www.youtube.com/embed/${item.video_url}`} 
                                title={item.title} 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        ) : item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
                                <i className={`fa-solid ${narrator.icon || 'fa-book-open'} text-6xl mb-4 opacity-50`}></i>
                                <span className="font-bold uppercase tracking-widest text-sm">Görsel Yok</span>
                            </div>
                        )}
                    </div>

                    {/* CONTENT BODY */}
                    <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-8 shadow-sm">
                        {/* İçerik Başlığı */}
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-50">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                <i className="fa-solid fa-align-left text-xl"></i>
                            </div>
                            <h3 className="font-extrabold text-xl text-gray-800">Detaylı Bilgi</h3>
                        </div>
                        
                        <div className="prose prose-lg prose-indigo max-w-none font-medium text-gray-600 leading-loose" dangerouslySetInnerHTML={{ __html: item.content }} />
                    </div>

                    {/* TAGS ROW (Muscles & Equipment) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-6 shadow-sm hover:border-red-200 transition">
                            <h3 className="font-extrabold text-red-500 uppercase text-sm mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-child-reaching text-lg"></i> Hedef Kaslar
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {item.muscles && item.muscles.length > 0 ? item.muscles.map((m: string) => (
                                    <span key={m} className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-black border border-red-200 shadow-sm">{m}</span>
                                )) : <span className="text-xs text-red-400 font-bold bg-white px-3 py-1 rounded-lg border border-red-100">Genel vücut</span>}
                            </div>
                        </div>
                        <div className="bg-blue-50 border-2 border-blue-100 rounded-[2rem] p-6 shadow-sm hover:border-blue-200 transition">
                            <h3 className="font-extrabold text-blue-500 uppercase text-sm mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-dumbbell text-lg"></i> Ekipman
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {item.equipment && item.equipment.length > 0 ? item.equipment.map((e: string) => (
                                     <span key={e} className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-black border border-blue-200 shadow-sm">{e}</span>
                                )) : <span className="text-xs text-blue-400 font-bold bg-white px-3 py-1 rounded-lg border border-blue-100">Ekipmansız</span>}
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT SIDEBAR (NARRATOR & GAMIFICATION) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* NARRATOR CARD */}
                    <div className={`rounded-[2rem] p-6 relative overflow-hidden border-2 ${narrator.border} bg-white shadow-card group hover:-translate-y-1 transition duration-300`}>
                        <div className={`absolute top-0 left-0 w-full h-24 ${narrator.bg} opacity-50`}></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center -mt-2">
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 mb-3">
                                <img src={narrator.avatar} className="w-full h-full object-cover" alt="Narrator" />
                            </div>
                            
                            <h3 className={`text-xl font-black ${narrator.color} mb-1`}>{narrator.name}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">{narrator.role}</p>
                            
                            <div className={`${narrator.bg} p-4 rounded-2xl border border-white/50 w-full relative`}>
                                {/* Speech Bubble Arrow */}
                                <div className={`absolute -top-2 left-1/2 -ml-2 w-4 h-4 ${narrator.bg} transform rotate-45`}></div>
                                <p className={`text-sm font-bold ${narrator.color} italic leading-snug`}>
                                    &quot;{narrator.intro}&quot;
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* GAMIFICATION: Did you learn? */}
                    <div className="bg-gray-900 text-white rounded-[2rem] p-8 text-center shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                        
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg transition-transform duration-500 ${learned ? 'bg-green-500 text-white scale-110' : 'bg-gray-800 text-gray-500'}`}>
                            <i className={`fa-solid ${learned ? 'fa-check' : 'fa-lightbulb'}`}></i>
                        </div>
                        
                        <h3 className="font-black text-xl mb-2">{learned ? 'Tebrikler!' : 'Öğrendim!'}</h3>
                        <p className="text-gray-400 text-sm font-bold mb-6 px-2">
                            {learned ? 'Bu bilgiyi hafızana kazıdın. +10 XP hesabına eklendi.' : 'Bu terimi öğrendiğini onayla, bilgi rozeti için puan kazan.'}
                        </p>
                        
                        <button 
                            onClick={handleLearn}
                            disabled={learned}
                            className={`w-full py-4 rounded-xl font-extrabold uppercase shadow-btn btn-game transition-all flex items-center justify-center gap-2 ${
                                learned 
                                ? 'bg-green-500 text-white shadow-green-800 cursor-default' 
                                : 'bg-white text-gray-900 shadow-gray-400 hover:bg-gray-100'
                            }`}
                        >
                            {learned ? (
                                <><i className="fa-solid fa-check-double"></i> Tamamlandı</>
                            ) : (
                                <><i className="fa-solid fa-thumbs-up"></i> Okudum & Anladım</>
                            )}
                        </button>
                    </div>
                    
                    {/* Share / Actions */}
                    <div className="grid grid-cols-2 gap-3">
                         <button className="bg-white border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-extrabold text-xs uppercase hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition flex items-center justify-center gap-2">
                             <i className="fa-solid fa-share-nodes"></i> Paylaş
                         </button>
                         <button className="bg-white border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-extrabold text-xs uppercase hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition flex items-center justify-center gap-2">
                             <i className="fa-regular fa-heart"></i> Kaydet
                         </button>
                    </div>

                </div>

            </div>
        </LayoutWrapper>

    </div>
  );
}