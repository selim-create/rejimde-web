"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";
import { earnPoints, getMe, getGamificationStats } from "@/lib/api"; 
import { MascotState } from "@/lib/mascot-config";

export default function DashboardPage() {
  const [score, setScore] = useState(0); 
  const [totalScore, setTotalScore] = useState(0);
  const [mascotState, setMascotState] = useState<MascotState>("idle_dashboard");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [userFirstName, setUserFirstName] = useState("Şampiyon");

  // Veri Çekme
  useEffect(() => {
    async function loadData() {
        const user = await getMe();
        if (user) {
            setUserFirstName(user.name?.split(' ')[0] || "Şampiyon");
        }
        
        const stats = await getGamificationStats();
        if (stats) {
            setScore(stats.daily_score); // Günlük puan
            setTotalScore(stats.total_score); // Toplam puan
        }
    }
    loadData();
  }, []);

  // Puan Kazanma Aksiyonu
  const handleAction = async (action: string, refMascotState: MascotState) => {
    setLoadingAction(action);
    setMascotState(refMascotState);

    const result = await earnPoints(action);

    if (result.success) {
        // API'den dönen güncel puanları set et
        setScore(result.data.daily_score);
        setTotalScore(result.data.total_score);
        
        setTimeout(() => {
            setMascotState("idle_dashboard");
        }, 4000);
    } else {
        alert(result.message || "Bir hata oluştu.");
        setMascotState("cheat_meal_detected");
    }

    setLoadingAction(null);
  };

  return (
    <div className="min-h-screen pb-24 font-sans text-rejimde-text">
      
      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR: Tools & Nav */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-2 sticky top-24">
                  <Link href="/dashboard" className="flex items-center gap-4 p-3 rounded-2xl bg-blue-50 border-2 border-blue-100 text-rejimde-blue mb-2 shadow-sm">
                      <i className="fa-solid fa-house text-xl w-8 text-center"></i>
                      <span className="font-extrabold uppercase text-sm">Panelim</span>
                  </Link>
                  <Link href="/clans" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition group">
                      <i className="fa-solid fa-shield-halved text-xl w-8 text-center group-hover:text-rejimde-yellow"></i>
                      <span className="font-extrabold uppercase text-sm group-hover:text-gray-600">Klanım</span>
                  </Link>
                  <Link href="/dashboard/score" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition group">
                      <i className="fa-solid fa-chart-line text-xl w-8 text-center group-hover:text-rejimde-purple"></i>
                      <span className="font-extrabold uppercase text-sm group-hover:text-gray-600">Analizler</span>
                  </Link>
                  <Link href="/experts" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition group">
                      <i className="fa-solid fa-user-doctor text-xl w-8 text-center group-hover:text-rejimde-green"></i>
                      <span className="font-extrabold uppercase text-sm group-hover:text-gray-600">Diyetisyenim</span>
                  </Link>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <Link href="/settings" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition group">
                      <i className="fa-solid fa-gear text-xl w-8 text-center"></i>
                      <span className="font-extrabold uppercase text-sm group-hover:text-gray-600">Ayarlar</span>
                  </Link>
              </div>

              {/* Ad / Promo Box */}
              <div className="bg-rejimde-text rounded-3xl p-6 text-center shadow-card sticky top-[420px]">
                  <i className="fa-solid fa-crown text-rejimde-yellow text-4xl mb-2 animate-bounce-slow"></i>
                  <h3 className="text-white font-extrabold text-lg mb-1">Rejimde Premium</h3>
                  <p className="text-gray-400 text-xs font-bold mb-4">Sınırsız AI analizi ve reklamsız deneyim.</p>
                  <button className="w-full bg-rejimde-green text-white py-2 rounded-xl font-extrabold text-xs uppercase shadow-btn shadow-rejimde-greenDark btn-game">
                      Yükselt
                  </button>
              </div>
          </div>

          {/* CENTER: Feed & Actions */}
          <div className="lg:col-span-6 space-y-8">
              
              {/* MASCOT HERO (Dynamic) */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                  <div className="shrink-0 transition-all duration-300 transform hover:scale-105">
                      <MascotDisplay 
                        state={mascotState} 
                        size={160} 
                        showBubble={false} 
                        className="drop-shadow-lg"
                      />
                  </div>
                  <div className="bg-white border-2 border-gray-200 p-6 rounded-3xl relative flex-1 shadow-sm transition-all duration-300">
                      {/* Konuşma Balonu Oku */}
                      <div className="hidden sm:block absolute -left-3 top-1/2 w-6 h-6 bg-white border-l-2 border-b-2 border-gray-200 transform -translate-y-1/2 rotate-45"></div>
                      
                      <h2 className="font-extrabold text-gray-700 text-lg mb-1">Selam {userFirstName}! 👋</h2>
                      <p className="text-gray-500 font-bold text-sm">
                        {mascotState === 'idle_dashboard' && '"Bugün hava çok güzel, biraz hareket etmeye ne dersin?"'}
                        {mascotState === 'water_reminder' && '"Ohh! Su gibisi yok. Hücrelerin bayram etti! 💧"'}
                        {mascotState === 'cheat_meal_detected' && '"Hmmm... Bunu kaydettim ama akşamı hafif geçirmen lazım!"'}
                        {mascotState === 'success_milestone' && '"Harikasın! Adım adım hedefe yaklaşıyoruz! 🚀"'}
                      </p>
                  </div>
              </div>

              {/* SCORE CARD (Live Data) */}
              <Link href="/dashboard/score" className="block bg-rejimde-green rounded-3xl p-6 shadow-float relative overflow-hidden text-white group cursor-pointer hover:scale-[1.02] transition duration-300">
                  {/* Pattern */}
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
                  
                  <div className="relative z-10 flex justify-between items-center">
                      <div>
                          <p className="font-black text-green-100 text-xs uppercase mb-1">GÜNLÜK REJİMDE SKORUN</p>
                          <div className="flex items-baseline gap-2">
                             <div className="text-5xl font-black tracking-tighter transition-all duration-500">{score}</div>
                             <div className="text-xl font-bold text-green-100">/ {totalScore} T.</div>
                          </div>
                          
                          <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm mt-1">
                              <i className="fa-solid fa-arrow-trend-up"></i> Yükselişte
                          </div>
                      </div>
                      <div className="w-24 h-24 relative flex items-center justify-center">
                          <i className="fa-solid fa-trophy text-4xl absolute animate-wiggle"></i>
                      </div>
                  </div>
              </Link>
              
              {/* DAILY ACTIONS (Functional Buttons) */}
              <div className="space-y-4">
                  <h3 className="font-extrabold text-gray-400 text-sm uppercase tracking-wider ml-2">Hızlı Eylemler</h3>
                  
                  {/* Action 1: Water */}
                  <div className="bg-white border-2 border-b-4 border-gray-200 rounded-2xl p-4 flex items-center justify-between group hover:border-rejimde-blue transition cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-rejimde-blue text-2xl group-hover:scale-110 transition">
                              <i className="fa-solid fa-glass-water"></i>
                          </div>
                          <div>
                              <h4 className="font-extrabold text-gray-700">Su İçtim (200ml)</h4>
                              <p className="text-xs font-bold text-gray-400">+5 Puan</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => handleAction('log_water', 'water_reminder')}
                        disabled={loadingAction === 'log_water'}
                        className="bg-rejimde-blue text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-btn shadow-blue-600 btn-game hover:bg-blue-500 disabled:opacity-50"
                      >
                         {loadingAction === 'log_water' ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-plus font-black"></i>}
                      </button>
                  </div>

                  {/* Action 2: Meal (AI) */}
                  <div className="bg-white border-2 border-b-4 border-gray-200 rounded-2xl p-4 flex items-center justify-between group hover:border-rejimde-green transition cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-rejimde-green text-2xl group-hover:scale-110 transition">
                              <i className="fa-solid fa-camera"></i>
                          </div>
                          <div>
                              <h4 className="font-extrabold text-gray-700">Öğün Ekle</h4>
                              <p className="text-xs font-bold text-gray-400">+15 Puan</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => handleAction('log_meal', 'cheat_meal_detected')}
                        disabled={loadingAction === 'log_meal'}
                        className="bg-rejimde-green text-white px-4 py-2 rounded-xl shadow-btn shadow-rejimde-greenDark btn-game font-extrabold text-sm uppercase hover:bg-green-500 disabled:opacity-50"
                      >
                          {loadingAction === 'log_meal' ? '...' : 'FOTO ÇEK'}
                      </button>
                  </div>

                  {/* Action 3: Steps / Workout */}
                  <div className="bg-white border-2 border-b-4 border-gray-200 rounded-2xl p-4 flex items-center justify-between group hover:border-rejimde-red transition cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-rejimde-red text-2xl group-hover:scale-110 transition">
                              <i className="fa-solid fa-person-walking"></i>
                          </div>
                          <div>
                              <h4 className="font-extrabold text-gray-700">Antrenman Yaptım</h4>
                              <p className="text-xs font-bold text-gray-400">+50 Puan</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => handleAction('complete_workout', 'success_milestone')}
                        disabled={loadingAction === 'complete_workout'}
                        className="text-right bg-rejimde-red text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-btn shadow-red-700 btn-game disabled:opacity-50"
                      >
                         {loadingAction === 'complete_workout' ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-check font-black"></i>}
                      </button>
                  </div>
              </div>

              {/* AI FEEDBACK */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-extrabold text-gray-700">Diyetisyen Notu</h3>
                      <span className="text-xs font-bold text-gray-400">2 saat önce</span>
                  </div>
                  <div className="flex gap-4">
                      <img src="https://i.pravatar.cc/150?img=44" className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" alt="Diyetisyen" />
                      <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none text-sm font-bold text-gray-600 border border-gray-100">
                          &quot;Harika gidiyorsun! Akşam yemeğinde karbonhidratı biraz daha kısalım, yarın tartıda sürpriz olabilir. 💪&quot;
                      </div>
                  </div>
              </div>

          </div>

          {/* RIGHT SIDEBAR: League & Social */}
          <div className="lg:col-span-3 space-y-6">
              
              {/* LEAGUE CARD */}
              <Link href="/leagues" className="block bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-card group hover:border-rejimde-yellow transition cursor-pointer">
                  <div className="bg-rejimde-yellow p-4 border-b-2 border-rejimde-yellowDark flex justify-between items-center">
                      <h3 className="font-extrabold text-white uppercase text-sm">🏆 Düğün Ligi</h3>
                      <span className="text-white/80 text-xs font-black hover:text-white transition">TÜMÜ</span>
                  </div>
                  <div className="p-2 space-y-1">
                      {/* Rank 1 */}
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-yellow-50 border border-yellow-100">
                          <span className="font-black text-rejimde-yellowDark w-4 text-center">1</span>
                          <img src="https://i.pravatar.cc/150?img=12" className="w-8 h-8 rounded-lg bg-white" alt="Avatar" />
                          <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-gray-700 truncate">FitGörümce</p>
                              <p className="text-[10px] text-gray-400 font-bold">890 P</p>
                          </div>
                      </div>
                      {/* Me */}
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-rejimde-green/10 border border-rejimde-green/20">
                          <span className="font-black text-rejimde-green w-4 text-center">2</span>
                          <img src="https://i.pravatar.cc/150?img=5" className="w-8 h-8 rounded-lg bg-white" alt="Avatar" />
                          <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-rejimde-green truncate">SEN</p>
                              <p className="text-[10px] text-rejimde-green font-bold">{score} P</p>
                          </div>
                          <i className="fa-solid fa-caret-up text-rejimde-green"></i>
                      </div>
                      {/* Rank 3 */}
                      <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50">
                          <span className="font-black text-gray-400 w-4 text-center">3</span>
                          <img src="https://i.pravatar.cc/150?img=32" className="w-8 h-8 rounded-lg bg-white bg-gray-200" alt="Avatar" />
                          <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-gray-700 truncate">DamatBey</p>
                              <p className="text-[10px] text-gray-400 font-bold">820 P</p>
                          </div>
                      </div>
                  </div>
                  <div className="p-3 text-center border-t-2 border-gray-100 bg-gray-50">
                      <p className="text-[10px] text-gray-400 font-bold">Ligi ilk 3&apos;te bitirirsen <span className="text-rejimde-yellowDark">500 Elmas</span> kazanacaksın!</p>
                  </div>
              </Link>

              {/* CLAN CHAT SNIPPET */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-4 shadow-card">
                  <h3 className="font-extrabold text-gray-400 text-xs uppercase mb-3 px-1">Klan Sohbeti</h3>
                  <div className="space-y-3">
                      <div className="flex gap-2">
                          <img src="https://i.pravatar.cc/150?img=12" className="w-6 h-6 rounded-md bg-gray-200" alt="Av" />
                          <div className="bg-gray-100 p-2 rounded-xl rounded-tl-none text-xs font-bold text-gray-600">
                              Bugün sporu aksatmayın kızlar! 🏃‍♀️
                          </div>
                      </div>
                      <div className="flex gap-2 flex-row-reverse">
                          <div className="bg-rejimde-blue/10 p-2 rounded-xl rounded-tr-none text-xs font-bold text-rejimde-blueDark">
                              Ben akşam yürüyüşüne çıkıyorum, gelen?
                          </div>
                      </div>
                  </div>
                  <div className="mt-3 relative">
                      <input type="text" placeholder="Mesaj yaz..." className="w-full bg-gray-100 border-none rounded-xl text-xs font-bold p-3 focus:ring-2 focus:ring-rejimde-blue outline-none" />
                      <button className="absolute right-2 top-2 text-rejimde-blue hover:bg-blue-100 p-1 rounded-lg transition">
                          <i className="fa-solid fa-paper-plane"></i>
                      </button>
                  </div>
              </div>

          </div>

      </div>
    </div>
  );
}