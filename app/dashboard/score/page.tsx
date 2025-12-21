"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";
import { getGamificationStats, getAllBadges } from "@/lib/api";

export default function ScoreAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<number[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);

  // Simülatör State'leri
  const [water, setWater] = useState(3);
  const [steps, setSteps] = useState(8000);
  const [diet, setDiet] = useState(100);
  
  // Animasyon State'i
  const [progress, setProgress] = useState(0);

  // Veri Çekme
  useEffect(() => {
    async function loadData() {
        // İkisini paralel çekelim
        const [stats, badges] = await Promise.all([
            getGamificationStats(),
            getAllBadges()
        ]);

        if (stats) {
            setCurrentScore(stats.total_score);
            setLevel(stats.level);
            setEarnedBadgeIds(stats.earned_badges || []);
            
            // Animasyonu başlat
            const targetProgress = Math.min((stats.total_score % 1000) / 10, 100);
            setTimeout(() => setProgress(targetProgress), 100);
        }

        if (badges) {
            setAllBadges(badges);
        }

        setLoading(false);
    }
    loadData();
  }, []);

  // Simülasyon
  const projectedScore = currentScore + Math.floor((water * 10) + (steps / 1000 * 5) + (diet / 5));

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Yükleniyor...</div>;

  return (
    <div className="min-h-screen pb-24 font-sans text-rejimde-text bg-[#f7f7f7]">
      
      {/* HERO: SCORE DASHBOARD */}
      <div className="bg-white border-b-2 border-gray-200 pb-12 pt-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)'}}></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                  
                  {/* Left: Big Score Gauge */}
                  <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                          <path 
                            className="text-rejimde-green transition-all duration-[1500ms] ease-out" 
                            strokeDasharray={`${progress}, 100`} 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                          />
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-1">Toplam Skor</span>
                          <span className="text-6xl font-black text-gray-800 tracking-tighter">{currentScore}</span>
                          <div className="inline-flex items-center gap-1 bg-green-100 text-rejimde-greenDark px-2 py-1 rounded-lg text-xs font-black mt-2">
                              Seviye {level}
                          </div>
                      </div>

                      <div className="absolute -bottom-4 bg-rejimde-blue text-white px-4 py-2 rounded-xl border-4 border-white shadow-lg text-sm font-black uppercase flex items-center gap-2">
                          <i className="fa-solid fa-gem"></i> Safir Ligi
                      </div>
                  </div>

                  {/* Right: Mascot & Analysis */}
                  <div className="flex-1 text-center md:text-left w-full">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
                          <div className="shrink-0">
                              <MascotDisplay 
                                state="success_milestone" 
                                size={120} 
                                showBubble={false} 
                                className="transform -rotate-6"
                              />
                          </div>
                          <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl rounded-tl-none relative shadow-sm text-left flex-1">
                              <h2 className="text-xl font-extrabold text-rejimde-blueDark mb-2">Harika gidiyorsun! 🎉</h2>
                              <p className="text-gray-600 font-bold leading-relaxed">
                                  &quot;Puanların birikiyor! Rozet koleksiyonuna bakmayı unutma, yeni bir tane kazanmış olabilirsin.&quot;
                              </p>
                          </div>
                      </div>

                      {/* Mini Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-2xl p-3 text-center border-2 border-transparent hover:border-rejimde-green transition cursor-pointer group">
                              <div className="text-xs font-bold text-gray-400 uppercase mb-1 group-hover:text-rejimde-green">Rozetler</div>
                              <div className="text-xl font-black text-rejimde-green">{earnedBadgeIds.length} / {allBadges.length}</div>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-3 text-center border-2 border-transparent hover:border-rejimde-blue transition cursor-pointer group">
                              <div className="text-xs font-bold text-gray-400 uppercase mb-1 group-hover:text-rejimde-blue">Su</div>
                              <div className="text-xl font-black text-rejimde-blue">2.5L</div>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-3 text-center border-2 border-transparent hover:border-rejimde-red transition cursor-pointer group">
                              <div className="text-xs font-bold text-gray-400 uppercase mb-1 group-hover:text-rejimde-red">Hareket</div>
                              <div className="text-xl font-black text-rejimde-red">3k</div>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-3 text-center border-2 border-transparent hover:border-rejimde-purple transition cursor-pointer group">
                              <div className="text-xs font-bold text-gray-400 uppercase mb-1 group-hover:text-rejimde-purple">Uyku</div>
                              <div className="text-xl font-black text-rejimde-purple">7s</div>
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Simulator */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* ROZET KOLEKSİYONU (YENİ) */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-card">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                          <i className="fa-solid fa-medal text-rejimde-purple"></i>
                          Rozet Koleksiyonu
                      </h2>
                      <span className="bg-gray-100 text-gray-500 font-bold px-3 py-1 rounded-lg text-xs">
                          {earnedBadgeIds.length} / {allBadges.length} Kazanıldı
                      </span>
                  </div>

                  {allBadges.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 font-bold bg-gray-50 rounded-2xl">
                          Henüz sisteme rozet eklenmemiş.
                      </div>
                  ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {allBadges.map((badge) => {
                              const isEarned = earnedBadgeIds.includes(badge.id);
                              return (
                                  <div key={badge.id} className="group relative flex flex-col items-center">
                                      {/* Badge Image */}
                                      <div className={`relative w-20 h-20 mb-2 transition-all duration-300 ${isEarned ? 'scale-100 hover:scale-110 drop-shadow-md cursor-pointer' : 'scale-90 opacity-40 grayscale cursor-not-allowed'}`}>
                                          <img 
                                            src={badge.image} 
                                            className="w-full h-full object-contain" 
                                            alt={badge.title} 
                                          />
                                          {!isEarned && (
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                  <i className="fa-solid fa-lock text-gray-500 text-2xl drop-shadow-sm"></i>
                                              </div>
                                          )}
                                      </div>
                                      
                                      {/* Badge Title */}
                                      <span className={`text-[10px] font-black uppercase text-center leading-tight px-1 ${isEarned ? 'text-gray-700' : 'text-gray-400'}`}>
                                          {badge.title}
                                      </span>

                                      {/* TOOLTIP (Hover) */}
                                      <div className="absolute bottom-full mb-2 hidden group-hover:block w-40 bg-gray-800 text-white text-xs p-3 rounded-xl z-50 text-center pointer-events-none shadow-xl">
                                          <p className="font-bold text-yellow-400 mb-1">{badge.title}</p>
                                          <p className="text-[10px] font-medium opacity-80 mb-2">{badge.description || "Bu rozeti kazanmak için çabala!"}</p>
                                          {!isEarned && (
                                              <div className="inline-block bg-white/20 px-2 py-0.5 rounded text-[9px] font-bold">
                                                  Hedef: {badge.points_required} Puan
                                              </div>
                                          )}
                                          {/* Arrow */}
                                          <div className="absolute top-full left-1/2 -ml-2 w-4 h-4 bg-gray-800 transform rotate-45"></div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  )}
              </div>

              {/* SIMULATOR CARD */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-card relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                      <div>
                          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                              <i className="fa-solid fa-sliders text-rejimde-yellow"></i>
                              Günlük Puan Simülatörü
                          </h2>
                          <p className="text-gray-400 font-bold text-xs mt-1">Bugün neler yaparsan skorun kaç olur?</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs font-bold text-gray-400 uppercase">Tahmini +Puan</p>
                          <div className="text-3xl font-black text-rejimde-green animate-pulse">+{projectedScore - currentScore}</div>
                      </div>
                  </div>

                  <div className="space-y-6">
                      {/* Water Slider */}
                      <div>
                          <div className="flex justify-between mb-2">
                              <label className="font-extrabold text-gray-700 flex items-center gap-2 text-sm">
                                  <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-rejimde-blue text-xs"><i className="fa-solid fa-glass-water"></i></div>
                                  Su Tüketimi
                              </label>
                              <span className="font-black text-rejimde-blue text-sm">{water} Litre</span>
                          </div>
                          <input type="range" min="0" max="5" step="0.5" value={water} onChange={(e) => setWater(parseFloat(e.target.value))} className="w-full accent-rejimde-blue h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>

                      {/* Steps Slider */}
                      <div>
                          <div className="flex justify-between mb-2">
                              <label className="font-extrabold text-gray-700 flex items-center gap-2 text-sm">
                                  <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center text-rejimde-red text-xs"><i className="fa-solid fa-person-walking"></i></div>
                                  Adım Sayısı
                              </label>
                              <span className="font-black text-rejimde-red text-sm">{steps.toLocaleString('tr-TR')} Adım</span>
                          </div>
                          <input type="range" min="0" max="20000" step="1000" value={steps} onChange={(e) => setSteps(parseInt(e.target.value))} className="w-full accent-rejimde-red h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>

                      {/* Diet Quality Slider */}
                      <div>
                          <div className="flex justify-between mb-2">
                              <label className="font-extrabold text-gray-700 flex items-center gap-2 text-sm">
                                  <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center text-rejimde-green text-xs"><i className="fa-solid fa-carrot"></i></div>
                                  Beslenme
                              </label>
                              <span className="font-black text-rejimde-green text-sm">{diet === 100 ? 'Mükemmel' : diet > 50 ? 'Dengeli' : 'Kaçamaklı'}</span>
                          </div>
                          <input type="range" min="0" max="100" step="25" value={diet} onChange={(e) => setDiet(parseInt(e.target.value))} className="w-full accent-rejimde-green h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                  </div>
              </div>

          </div>

          {/* RIGHT COLUMN: Weekly Trend */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
                  <h3 className="font-extrabold text-gray-700 mb-6 uppercase text-sm">Haftalık Trend</h3>
                  <div className="flex items-end justify-between h-40 gap-2">
                      {/* Mock Chart Bars */}
                      {[60, 50, 75, 30, 85, 80, 10].map((h, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                              <div className={`w-full rounded-t-xl transition relative ${i === 5 ? 'bg-rejimde-green shadow-md' : 'bg-gray-200 hover:bg-rejimde-blue'}`} style={{height: `${h}%`}}></div>
                              <span className={`text-[10px] font-bold uppercase ${i === 5 ? 'text-rejimde-green' : 'text-gray-400'}`}>
                                  {['Pzt','Sal','Çar','Per','Cum','Bgn','Paz'][i]}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Expert Feedback */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full border-4 border-white shadow-md overflow-hidden mb-3">
                      <img src="https://i.pravatar.cc/150?img=44" className="w-full h-full object-cover" alt="Coach" />
                  </div>
                  <p className="text-gray-500 font-bold text-sm mb-4 leading-snug">&quot;Diyet kalitesini %80 üzerinde tutarsan, haftaya yeni bir rozet kazanabilirsin!&quot;</p>
                  <button className="w-full bg-white border-2 border-rejimde-blue text-rejimde-blue py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-blue-100 btn-game uppercase">Tavsiye Al</button>
              </div>
          </div>

      </div>
    </div>
  );
}