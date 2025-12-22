'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";
import { getMe, getBlogPosts, getPlans, getExercisePlans, getClans, getExperts } from "@/lib/api";

export default function Home() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Data States
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [featuredDiets, setFeaturedDiets] = useState<any[]>([]);
  const [featuredExercises, setFeaturedExercises] = useState<any[]>([]);
  const [topClans, setTopClans] = useState<any[]>([]);
  const [randomExperts, setRandomExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initData() {
      try {
        // 1. Kullanıcı Kontrolü
        const user = await getMe();
        if (user) {
            setIsLoggedIn(true);
            setCurrentUser(user);
        } else {
            setIsLoggedIn(false);
        }

        // 2. İçerikleri Çek (Paralel)
        const [blogs, diets, exercises, clans, experts] = await Promise.all([
            getBlogPosts(),
            getPlans(),
            getExercisePlans(),
            getClans(),
            getExperts()
        ]);

        // Verileri İşle
        setRecentBlogs(blogs.slice(0, 3));
        setFeaturedDiets(diets.slice(0, 3));
        setFeaturedExercises(exercises.slice(0, 3));
        
        // Klanları puana göre sıralayıp ilk 3'ü al
        const sortedClans = Array.isArray(clans) ? clans.sort((a: any, b: any) => (b.total_score || 0) - (a.total_score || 0)).slice(0, 3) : [];
        setTopClans(sortedClans);

        // Rastgele 2 Uzman Seç
        if (Array.isArray(experts) && experts.length > 0) {
            const shuffled = [...experts].sort(() => 0.5 - Math.random());
            setRandomExperts(shuffled.slice(0, 2));
        }

      } catch (error) {
        console.error("Ana sayfa veri hatası:", error);
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
        </div>
      );
  }

  return (
    <div className="font-sans text-gray-800 bg-white">
      
      {/* --- HERO SECTION --- */}
      <section className="py-16 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white to-blue-50/50">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)'}}></div>
        
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Left Content */}
            <div className="text-center lg:text-left">
                {isLoggedIn ? (
                    // LOGGED IN HERO
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-black text-xs uppercase mb-6">
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                            Hoşgeldin Şampiyon
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                            Hazır mısın <br />
                            <span className="text-blue-600">{currentUser?.name?.split(' ')[0]}?</span>
                        </h1>
                        <p className="text-xl text-gray-500 font-bold mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                            Klanın seni bekliyor, hedeflerin çok yakın. Bugün kendin için harika bir şey yap.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/dashboard" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-[0_4px_0_rgb(37,99,235)] hover:bg-blue-700 hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(37,99,235)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3">
                                <i className="fa-solid fa-gauge-high"></i> Panele Git
                            </Link>
                            <Link href="/dashboard/score" className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-extrabold text-lg shadow-[0_4px_0_rgb(229,231,235)] hover:bg-gray-50 hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(229,231,235)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3">
                                <i className="fa-solid fa-chart-pie text-green-500"></i> Durumumu Gör
                            </Link>
                        </div>
                    </div>
                ) : (
                    // GUEST HERO
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="lg:hidden flex justify-center mb-8">
                            <MascotDisplay state="onboarding_welcome" size={180} showBubble={true} />
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                            &quot;Rejimdeyim rejimde, <br />
                            <span className="text-green-500">sağlıklı günler</span> <br />
                            hep benim peşimde!&quot;
                        </h1>
                        <p className="text-lg text-gray-500 font-bold mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                            Yalnız zayıflanmaz, beraber başarılır. Klanını seç, oyunlaştırılmış görevlerle hedefine ulaş.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                            <Link href="/register/user" className="bg-green-500 text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-[0_4px_0_rgb(21,128,61)] hover:bg-green-600 hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(21,128,61)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2">
                                <i className="fa-solid fa-rocket"></i> Hemen Başla
                            </Link>
                            <Link href="/about" className="bg-white text-blue-500 border-2 border-gray-200 px-8 py-4 rounded-2xl font-extrabold text-lg shadow-[0_4px_0_rgb(229,231,235)] hover:bg-gray-50 hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(229,231,235)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2">
                                <i className="fa-solid fa-play"></i> Nasıl Çalışır?
                            </Link>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                            <div className="flex -space-x-4">
                                <img className="w-10 h-10 rounded-xl border-2 border-white bg-gray-200" src="https://api.dicebear.com/9.x/personas/svg?seed=user1" alt="" />
                                <img className="w-10 h-10 rounded-xl border-2 border-white bg-gray-200" src="https://api.dicebear.com/9.x/personas/svg?seed=user2" alt="" />
                                <img className="w-10 h-10 rounded-xl border-2 border-white bg-gray-200" src="https://api.dicebear.com/9.x/personas/svg?seed=user3" alt="" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">
                                <span className="text-gray-800 font-black">2.450+</span> kişi katıldı
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Content: Mascot & Visuals */}
            <div className="hidden lg:flex justify-end relative h-[500px]">
                <div className="absolute right-0 top-10 z-10 hover:scale-105 transition-transform duration-500">
                    <MascotDisplay 
                        state={isLoggedIn ? "success_milestone" : "onboarding_welcome"} 
                        size={400} 
                        showBubble={false}
                        className="drop-shadow-2xl transform -rotate-3"
                    />
                </div>
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-10 w-64 h-64 bg-green-200 rounded-full blur-3xl opacity-30 mix-blend-multiply filter animate-pulse"></div>
                <div className="absolute top-0 right-80 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 mix-blend-multiply filter animate-pulse delay-1000"></div>
            </div>
        </div>
      </section>

      {/* --- CONTENT SHOWCASE --- */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
            
            {/* Header */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 mb-2">Keşfet & Uygula</h2>
                    <p className="text-gray-500 font-bold">Uzmanlar tarafından hazırlanan içerikler.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. DİYET LİSTELERİ */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-green-600 uppercase flex items-center gap-2">
                            <i className="fa-solid fa-carrot"></i> Popüler Diyetler
                        </h3>
                        <Link href="/diets" className="text-xs font-black text-gray-400 hover:text-green-600 transition">TÜMÜ</Link>
                    </div>
                    {featuredDiets.length > 0 ? featuredDiets.map((diet) => (
                        <Link key={diet.id} href={`/diets/${diet.slug}`} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-green-400 hover:bg-green-50 transition group bg-white shadow-sm hover:shadow-md hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
                                <i className="fa-solid fa-leaf"></i>
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-gray-800 truncate group-hover:text-green-700">{diet.title}</h4>
                                <p className="text-xs text-gray-400 font-bold">{diet.meta?.difficulty || 'Orta'} • {diet.meta?.calories || '1500'} kcal</p>
                            </div>
                        </Link>
                    )) : (
                        <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400 font-bold text-xs">Henüz diyet planı yok.</div>
                    )}
                </div>

                {/* 2. EGZERSİZLER */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-red-500 uppercase flex items-center gap-2">
                            <i className="fa-solid fa-dumbbell"></i> Egzersizler
                        </h3>
                        <Link href="/exercises" className="text-xs font-black text-gray-400 hover:text-red-500 transition">TÜMÜ</Link>
                    </div>
                    {featuredExercises.length > 0 ? featuredExercises.map((ex) => (
                        <Link key={ex.id} href={`/exercises/${ex.slug}`} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-red-400 hover:bg-red-50 transition group bg-white shadow-sm hover:shadow-md hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
                                <i className="fa-solid fa-person-running"></i>
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-gray-800 truncate group-hover:text-red-700">{ex.title}</h4>
                                <p className="text-xs text-gray-400 font-bold">{ex.meta?.difficulty || 'Başlangıç'} • {ex.meta?.duration || '15'} dk</p>
                            </div>
                        </Link>
                    )) : (
                        <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400 font-bold text-xs">Henüz egzersiz planı yok.</div>
                    )}
                </div>

                {/* 3. BLOG */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-purple-500 uppercase flex items-center gap-2">
                            <i className="fa-solid fa-newspaper"></i> Son Yazılar
                        </h3>
                        <Link href="/blog" className="text-xs font-black text-gray-400 hover:text-purple-500 transition">TÜMÜ</Link>
                    </div>
                    {recentBlogs.length > 0 ? recentBlogs.map((blog) => (
                        <Link key={blog.id} href={`/blog/${blog.slug}`} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-400 hover:bg-purple-50 transition group bg-white shadow-sm hover:shadow-md hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center text-xl shrink-0 overflow-hidden border border-purple-200">
                                {blog.image ? <img src={blog.image} className="w-full h-full object-cover" alt={blog.title} /> : <i className="fa-solid fa-pen"></i>}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-gray-800 truncate group-hover:text-purple-700">{blog.title}</h4>
                                <p className="text-xs text-gray-400 font-bold">{blog.read_time || '3 dk'} okuma</p>
                            </div>
                        </Link>
                    )) : (
                        <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400 font-bold text-xs">Henüz yazı yok.</div>
                    )}
                </div>

            </div>
        </div>
      </section>

      {/* --- COMMUNITY & EXPERTS --- */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
            
            {/* 1. CLANS & LEAGUES */}
            <div className="mb-16">
                <div className="text-center mb-10">
                    <span className="text-xs font-black text-purple-500 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full border border-purple-200">Topluluk</span>
                    <h2 className="text-3xl font-black text-gray-800 mt-3 mb-2">En İyi Klanlar</h2>
                    <p className="text-gray-500 font-bold">Bu hafta rekabet çok kızışmalı!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topClans.length > 0 ? topClans.map((clan, index) => (
                        <Link key={clan.id} href={`/clans/${clan.slug}`} className="bg-white rounded-3xl p-6 shadow-sm border-b-4 border-gray-200 hover:border-purple-500 hover:-translate-y-1 transition group relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gray-100 text-gray-400 font-black text-4xl px-4 pt-2 rounded-bl-3xl opacity-30">#{index + 1}</div>
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 border-2 border-purple-100 mb-4 flex items-center justify-center overflow-hidden">
                                {clan.logo ? <img src={clan.logo} alt={clan.name} className="w-full h-full object-cover" /> : <i className="fa-solid fa-shield-cat text-3xl text-purple-300"></i>}
                            </div>
                            <h3 className="font-black text-lg text-gray-800 mb-1 group-hover:text-purple-600 transition truncate">{clan.name}</h3>
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-400 mt-3">
                                <span className="flex items-center gap-1"><i className="fa-solid fa-users text-blue-400"></i> {clan.member_count}</span>
                                <span className="flex items-center gap-1"><i className="fa-solid fa-star text-yellow-400"></i> {clan.total_score}</span>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-3 text-center py-10 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                             <p className="text-gray-400 font-bold">Henüz liderlik tablosu oluşmadı.</p>
                        </div>
                    )}
                    
                    {/* Tüm Sıralama Butonu */}
                    <div className="bg-purple-600 rounded-3xl p-6 shadow-[0_4px_0_rgb(88,28,135)] text-white flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] hover:bg-purple-700 transition" onClick={() => window.location.href = '/clans'}>
                        <i className="fa-solid fa-trophy text-4xl mb-3 text-yellow-300 animate-bounce-slow"></i>
                        <h3 className="font-black text-xl mb-1">Tüm Sıralama</h3>
                        <p className="text-purple-200 text-xs font-bold">Kendi klanını bul veya oluştur!</p>
                    </div>
                </div>
            </div>

            {/* 2. FEATURED EXPERTS */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                    <div>
                        <span className="text-xs font-black text-green-600 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full border border-green-200">Uzmanlar</span>
                        <h2 className="text-3xl font-black text-gray-800 mt-3">Haftanın Uzmanları</h2>
                    </div>
                    <Link href="/experts" className="text-blue-600 font-extrabold uppercase text-sm hover:underline mt-4 md:mt-0 flex items-center gap-1">
                        Tümünü Gör <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Uzman Kartları - İstenilen Tasarım */}
                    {randomExperts.map((expert) => {
                        // Eğer expert.image https://placehold.co/150 ise DiceBear kullan
                        const avatarUrl = (!expert.image || expert.image.includes('placehold.co')) 
                            ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${expert.slug}` 
                            : expert.image;

                        return (
                            <div key={expert.id} className="border-2 border-gray-200 rounded-3xl p-0 hover:border-rejimde-green transition group bg-white shadow-card flex flex-col h-full overflow-hidden">
                                 {/* Üst Kısım: Renkli Header */}
                                 <div className="h-24 bg-gradient-to-r from-green-100 to-blue-50 relative">
                                    <div className="absolute -bottom-10 left-6">
                                         <div className="relative">
                                            <img 
                                                src={avatarUrl} 
                                                alt={expert.name} 
                                                className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm bg-white object-cover" 
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                                         </div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-black text-gray-600 uppercase border border-white shadow-sm">
                                        {expert.title || 'UZMAN'}
                                    </div>
                                </div>
                                
                                <div className="pt-12 px-6 pb-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-800 leading-tight group-hover:text-green-600 transition line-clamp-1">{expert.name}</h3>
                                            <p className="text-xs font-bold text-gray-400">{expert.location || 'Online'}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                            <i className="fa-solid fa-star text-rejimde-yellow text-xs"></i>
                                            <span className="font-bold text-yellow-600 text-xs">{expert.rating || '5.0'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase rounded border border-purple-100">BESLENME</span>
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded border border-blue-100">SPORCU</span>
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <Link href={`/experts/${expert.slug}`} className="border-2 border-gray-200 text-gray-500 font-extrabold py-3 rounded-xl uppercase text-xs hover:bg-gray-50 transition text-center flex items-center justify-center">
                                            Profili
                                        </Link>
                                        <button className="bg-rejimde-green text-white font-extrabold py-3 rounded-xl uppercase text-xs shadow-btn shadow-rejimde-greenDark btn-game">
                                            Randevu Al
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* "Uzman Mısın?" Kartı */}
                    <div className="bg-rejimde-purple rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-btn shadow-rejimde-purpleDark btn-game cursor-pointer group relative overflow-hidden h-full min-h-[300px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-10 -mb-10"></div>
                        
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rejimde-purple text-3xl mb-6 shadow-sm relative z-10 group-hover:scale-110 transition">
                            <i className="fa-solid fa-briefcase"></i>
                        </div>
                        <h3 className="text-2xl font-extrabold text-white mb-2 relative z-10">Uzman Mısın?</h3>
                        <p className="text-purple-100 text-sm font-bold mb-8 relative z-10 px-4">
                            Kendi klanını kur, danışanlarını ücretsiz yönet, gelirini artır.
                        </p>
                        <Link href="/register/pro" className="bg-white text-rejimde-purple px-8 py-3 rounded-xl font-extrabold uppercase tracking-wide text-sm relative z-10 group-hover:bg-purple-50 transition shadow-btn shadow-purple-900/20">
                            BAŞVUR
                        </Link>
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* --- CTA / FOOTER PREVIEW --- */}
      {!isLoggedIn && (
          <section className="py-20 bg-gray-900 text-white text-center px-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/stardust.png)'}}></div>
              <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-black mb-6">Mazeret Yok, Rejimde Var!</h2>
                  <p className="text-gray-400 font-bold text-lg mb-8">
                      Hemen ücretsiz hesabını oluştur, binlerce kişiyle birlikte hedefine koş.
                  </p>
                  <Link href="/register/user" className="inline-block bg-rejimde-green text-white px-10 py-4 rounded-2xl font-extrabold text-lg shadow-[0_4px_0_rgb(21,128,61)] hover:bg-green-600 hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(21,128,61)] active:translate-y-[4px] active:shadow-none transition-all">
                      ÜCRETSİZ BAŞLA
                  </Link>
              </div>
          </section>
      )}

    </div>
  );
}