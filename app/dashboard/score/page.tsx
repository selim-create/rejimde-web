'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import LayoutWrapper from '@/components/LayoutWrapper';
import MascotDisplay from "@/components/MascotDisplay";
import { auth, getAllBadges } from "@/lib/api";

export default function ScoreAnalysisPage() {
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [currentScore, setCurrentScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelName, setLevelName] = useState('Begin (Level 1)');
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<number[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);

  // Simulator States
  const [water, setWater] = useState(3);
  const [steps, setSteps] = useState(8000);
  const [diet, setDiet] = useState(100);
  
  // Animation State
  const [progress, setProgress] = useState(0);

  // Veri Çekme
  useEffect(() => {
    async function loadData() {
        try {
            // Paralel veri çekimi (Hız için)
            const [stats, badgesData] = await Promise.all([
                auth.getGamificationStats(),
                getAllBadges()
            ]);

            // İstatistikleri İşle
            if (stats) {
                setCurrentScore(stats.total_score || 0);
                setLevel(stats.level || 1);
                
                // Level bilgisi
                if (stats.league && stats.league.name) {
                    setLevelName(stats.league.name);
                }

                // Kazanılan rozet ID'leri (Array değilse boş array yap)
                const earned = Array.isArray(stats.earned_badges) ? stats.earned_badges.map(Number) : [];
                setEarnedBadgeIds(earned);

                // Dairesel progress bar animasyonu (0-100 arası)
                // Örn: Her 1000 puan 1 level ise, modülo ile yüzdeyi bul
                const scoreModulo = (stats.total_score || 0) % 1000;
                const percentage = (scoreModulo / 1000) * 100;
                
                // Animasyonun görünmesi için küçük bir gecikme
                setTimeout(() => setProgress(percentage), 100);
            }

            // Rozetleri İşle
            if (Array.isArray(badgesData)) {
                setAllBadges(badgesData);
            }

        } catch (error) {
            console.error("Veri yüklenirken hata:", error);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  // Simülasyon Hesaplaması
  const projectedScore = currentScore + Math.floor((water * 10) + (steps / 1000 * 5) + (diet / 5));

  if (loading) {
      return (
        <LayoutWrapper>
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-rejimde-blue"></div>
            </div>
        </LayoutWrapper>
      );
  }

  return (
    <LayoutWrapper>
    <div className="min-h-screen pb-24 font-sans text-gray-800 bg-[#f7f7f7]">
      
      {/* HERO: SCORE DASHBOARD */}
      <div className="bg-white border-b-2 border-gray-200 pb-12 pt-8 relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)'}}></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                  
                  {/* Left: Big Score Gauge */}
                  <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
                      {/* SVG Gauge */}
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          {/* Background Circle */}
                          <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                          {/* Progress Circle */}
                          <path 
                            className="text-green-500 transition-all duration-[1500ms] ease-out" 
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
                          <span className="text-5xl md:text-6xl font-black text-gray-800 tracking-tighter">{currentScore}</span>
                          <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-black mt-2">
                              Seviye {level}
                          </div>
                      </div>

                      <div className="absolute -bottom-4 bg-blue-600 text-white px-5 py-2 rounded-xl border-4 border-white shadow-lg text-sm font-black uppercase flex items-center gap-2">
                          <i className="fa-solid fa-gem"></i> {levelName}
                      </div>
                  </div>

                  {/* Right: Mascot & Analysis */}
                  <div className="flex-1 text-center md:text-left w-full">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                          <div className="shrink-0">
                              <MascotDisplay 
                                state="success_milestone" 
                                size={120} 
                                showBubble={false} 
                                className="transform -rotate-6 filter drop-shadow-lg"
                              />
                          </div>
                          <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl rounded-tl-none relative shadow-sm text-left flex-1">
                              <h2 className="text-xl font-extrabold text-blue-900 mb-2">Harika gidiyorsun! 🎉</h2>
                              <p className="text-gray-600 font-bold leading-relaxed text-sm">
                                  &quot;Puanların birikiyor! Rozet koleksiyonuna bakmayı unutma, yeni bir tane kazanmış olabilirsin. Hedefine giden yolda emin adımlarla ilerliyorsun.&quot;
                              </p>
                          </div>
                      </div>

                      {/* Mini Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-2xl p-4 text-center border-2 border-transparent hover:border-green-500 transition cursor-pointer group shadow-sm">
                              <div className="text-xs font-bold text-gray-400 uppercase mb-1 group-hover:text-green-500">Rozetler</div>
                              <div className="text-xl font-black text-green-500">{earnedBadgeIds.length} / {allBadges.length}</div>
                          </div>
                          <div className="bg-white rounded-2xl p-4 text-center border-2 border-transparent hover:border-blue-500 transition cursor-pointer group shadow-sm">
                              <div className="text-xs font-bold text-gray-400 uppercase mb-1 group-hover:text-blue-500">Su</div>
                              <div className="text-xl font-black text-blue-500">2.5L</div>
                          </div>
                          <div className="bg-white rounded-2xl p-4 text-center border-2 border-transparent hover:border-red-500 transition cursor-pointer group shadow-sm">
                              <div className="text-xs font-bold text-gray-400 uppercase mb-1 group-hover:text-red-500">Hareket</div>
                              <div className="text-xl font-black text-red-500">3k</div>
                          </div>
                          <div className="bg-white rounded-2xl p-4 text-center border-2 border-transparent hover:border-purple-500 transition cursor-pointer group shadow-sm">
                              <div className="text-xs font-bold text-gray-400 uppercase mb-1 group-hover:text-purple-500">Uyku</div>
                              <div className="text-xl font-black text-purple-500">7s</div>
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* ROZET KOLEKSİYONU */}
              <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                             <i className="fa-solid fa-medal"></i>
                          </div>
                          Rozet Koleksiyonu
                      </h2>
                      <span className="bg-purple-50 text-purple-700 font-bold px-4 py-2 rounded-xl text-xs border border-purple-100">
                          {earnedBadgeIds.length} / {allBadges.length} Kazanıldı
                      </span>
                  </div>

                  {allBadges.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 font-bold bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                          <i className="fa-solid fa-box-open text-4xl mb-3 opacity-50"></i>
                          <p>Henüz sisteme rozet eklenmemiş.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
                          {allBadges.map((badge) => {
                              const isEarned = earnedBadgeIds.includes(badge.id);
                              return (
                                  <div key={badge.id} className="group relative flex flex-col items-center">
                                      {/* Badge Image */}
                                      <div className={`relative w-24 h-24 mb-3 transition-all duration-300 ${isEarned ? 'scale-100 hover:scale-110 drop-shadow-xl cursor-pointer' : 'scale-90 opacity-40 grayscale cursor-not-allowed'}`}>
                                          {badge.image ? (
                                              <img 
                                                src={badge.image} 
                                                className="w-full h-full object-contain" 
                                                alt={badge.title} 
                                              />
                                          ) : (
                                              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                                                  <i className="fa-solid fa-award text-3xl text-gray-400"></i>
                                              </div>
                                          )}
                                          
                                          {!isEarned && (
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                  <div className="bg-gray-800/80 w-8 h-8 rounded-full flex items-center justify-center">
                                                      <i className="fa-solid fa-lock text-white text-sm"></i>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                      
                                      {/* Badge Title */}
                                      <span className={`text-[10px] font-black uppercase text-center leading-tight px-1 ${isEarned ? 'text-gray-700' : 'text-gray-400'}`}>
                                          {badge.title}
                                      </span>

                                      {/* TOOLTIP (Hover) */}
                                      <div className="absolute bottom-full mb-3 hidden group-hover:block w-48 bg-gray-900 text-white text-xs p-4 rounded-xl z-50 text-center pointer-events-none shadow-xl transform -translate-x-1/2 left-1/2 ml-0">
                                          <p className="font-bold text-yellow-400 mb-1 text-sm">{badge.title}</p>
                                          <p className="text-[11px] font-medium opacity-80 mb-3 leading-snug">{badge.description || "Bu rozeti kazanmak için çabala!"}</p>
                                          {!isEarned && badge.points_required > 0 && (
                                              <div className="inline-block bg-white/20 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                                  Hedef: {badge.points_required} Puan
                                              </div>
                                          )}
                                          {/* Arrow */}
                                          <div className="absolute top-full left-1/2 -ml-2 w-4 h-4 bg-gray-900 transform rotate-45"></div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  )}
              </div>

              {/* SIMULATOR CARD */}
              <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                      <div>
                          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-500">
                                  <i className="fa-solid fa-sliders"></i>
                              </div>
                              Günlük Simülatör
                          </h2>
                          <p className="text-gray-400 font-bold text-xs mt-1 ml-12">Bugün neler yaparsan skorun kaç olur?</p>
                      </div>
                      <div className="text-right bg-green-50 px-4 py-2 rounded-2xl border border-green-100">
                          <p className="text-[10px] font-bold text-green-600 uppercase">Tahmini +Puan</p>
                          <div className="text-3xl font-black text-green-500 animate-pulse">+{projectedScore - currentScore}</div>
                      </div>
                  </div>

                  <div className="space-y-8">
                      {/* Water Slider */}
                      <div>
                          <div className="flex justify-between mb-3">
                              <label className="font-extrabold text-gray-700 flex items-center gap-3 text-sm">
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm"><i className="fa-solid fa-glass-water"></i></div>
                                  Su Tüketimi
                              </label>
                              <span className="font-black text-blue-600 text-lg">{water} Litre</span>
                          </div>
                          <input type="range" min="0" max="5" step="0.5" value={water} onChange={(e) => setWater(parseFloat(e.target.value))} className="w-full accent-blue-600 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer hover:bg-gray-300 transition-colors" />
                      </div>

                      {/* Steps Slider */}
                      <div>
                          <div className="flex justify-between mb-3">
                              <label className="font-extrabold text-gray-700 flex items-center gap-3 text-sm">
                                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-sm"><i className="fa-solid fa-person-walking"></i></div>
                                  Adım Sayısı
                              </label>
                              <span className="font-black text-red-600 text-lg">{steps.toLocaleString('tr-TR')}</span>
                          </div>
                          <input type="range" min="0" max="20000" step="1000" value={steps} onChange={(e) => setSteps(parseInt(e.target.value))} className="w-full accent-red-600 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer hover:bg-gray-300 transition-colors" />
                      </div>

                      {/* Diet Quality Slider */}
                      <div>
                          <div className="flex justify-between mb-3">
                              <label className="font-extrabold text-gray-700 flex items-center gap-3 text-sm">
                                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-sm"><i className="fa-solid fa-carrot"></i></div>
                                  Beslenme Kalitesi
                              </label>
                              <span className="font-black text-green-600 text-lg">{diet === 100 ? 'Mükemmel' : diet > 50 ? 'Dengeli' : 'Kaçamaklı'}</span>
                          </div>
                          <input type="range" min="0" max="100" step="25" value={diet} onChange={(e) => setDiet(parseInt(e.target.value))} className="w-full accent-green-600 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer hover:bg-gray-300 transition-colors" />
                      </div>
                  </div>
              </div>

          </div>

          {/* RIGHT COLUMN: Weekly Trend */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-6 shadow-sm">
                  <h3 className="font-extrabold text-gray-700 mb-6 uppercase text-sm flex items-center gap-2">
                      <i className="fa-solid fa-calendar-days text-gray-400"></i> Haftalık Trend
                  </h3>
                  <div className="flex items-end justify-between h-40 gap-2 px-2">
                      {/* Mock Chart Bars - Gelecekte API'den history çekilip buraya basılabilir */}
                      {[60, 50, 75, 30, 85, 80, 10].map((h, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                              <div className={`w-full rounded-t-xl transition-all relative ${i === 5 ? 'bg-green-500 shadow-md scale-110' : 'bg-gray-200 hover:bg-blue-400'}`} style={{height: `${h}%`}}></div>
                              <span className={`text-[10px] font-bold uppercase ${i === 5 ? 'text-green-600' : 'text-gray-400'}`}>
                                  {['Pzt','Sal','Çar','Per','Cum','Bgn','Paz'][i]}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Expert Feedback */}
              <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-8 text-center shadow-sm">
                  <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full border-4 border-white shadow-md overflow-hidden mb-4">
                      <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Coach" className="w-full h-full object-cover" alt="Coach" />
                  </div>
                  <h4 className="font-black text-gray-800 mb-1">Koç'un Tavsiyesi</h4>
                  <p className="text-gray-500 font-bold text-sm mb-6 leading-relaxed">
                      &quot;Diyet kalitesini %80 üzerinde tutarsan, haftaya yeni bir <strong>Beslenme Uzmanı</strong> rozeti kazanabilirsin!&quot;
                  </p>
                  <button className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-extrabold text-xs shadow-btn shadow-blue-100 btn-game uppercase hover:bg-blue-50 transition-colors">
                      Detaylı Analiz
                  </button>
              </div>
          </div>

      </div>
    </div>
    </LayoutWrapper>
  );
}