"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/api";
import MascotDisplay from "@/components/MascotDisplay";

// Kategori Temaları
const CATEGORY_THEMES: Record<string, { cardBorder: string, badge: string }> = {
  'Beslenme': { cardBorder: 'hover:border-rejimde-green', badge: 'text-rejimde-green border-rejimde-green bg-green-50' },
  'Egzersiz': { cardBorder: 'hover:border-rejimde-red', badge: 'text-rejimde-red border-rejimde-red bg-red-50' },
  'Motivasyon': { cardBorder: 'hover:border-rejimde-purple', badge: 'text-rejimde-purple border-rejimde-purple bg-purple-50' },
  'Tarif': { cardBorder: 'hover:border-rejimde-yellow', badge: 'text-rejimde-yellowDark border-rejimde-yellow bg-yellow-50' },
  'Tarifler': { cardBorder: 'hover:border-rejimde-yellow', badge: 'text-rejimde-yellowDark border-rejimde-yellow bg-yellow-50' },
  'Genel': { cardBorder: 'hover:border-gray-400', badge: 'text-gray-500 border-gray-300 bg-gray-50' },
  'Bilim & Mitler': { cardBorder: 'hover:border-blue-400', badge: 'text-blue-500 border-blue-400 bg-blue-50' },
  'Gerçek Hikayeler': { cardBorder: 'hover:border-orange-400', badge: 'text-orange-500 border-orange-400 bg-orange-50' },
  'Pratik Hayat': { cardBorder: 'hover:border-teal-400', badge: 'text-teal-600 border-teal-400 bg-teal-50' },
  'Psikoloji': { cardBorder: 'hover:border-indigo-400', badge: 'text-indigo-600 border-indigo-400 bg-indigo-50' },
};

// HTML Decode
const decodeHtml = (html: string) => {
  if (typeof window === "undefined" || !html) return html; 
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [topReaders, setTopReaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function initData() {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';

            // 1. Kategoriler
            let catsData: any[] = [];
            const catRes = await fetch(`${apiUrl}/wp/v2/categories?per_page=20`);
            if (catRes.ok) {
                catsData = await catRes.json();
                setCategories(catsData);
            }

            // 2. Yazıları Çek (Embed ile yazar ve görsel dahil)
            const postsRes = await fetch(`${apiUrl}/wp/v2/posts?_embed&per_page=100`);
            let realPosts = [];
            
            if (postsRes.ok) {
                const postsJson = await postsRes.json();
                realPosts = postsJson.map((p: any) => {
                    // Kategori
                    const catId = p.categories && p.categories.length > 0 ? p.categories[0] : null;
                    const catObj = catsData.find((c: any) => c.id === catId);
                    const catName = catObj ? decodeHtml(catObj.name) : "Genel";
                    
                    // Yazar Bilgisi
                    const author = p._embedded?.author?.[0];
                    
                    // DÜZELTME: Avatar Mantığı - Profil Sayfası ile Eşitlendi
                    // Öncelik: Özel Avatar (avatar_url) > DiceBear (Slug'a göre)
                    // Gravatar (avatar_urls) tamamen devre dışı bırakıldı.
                    let authorAvatar = author?.avatar_url;
                    
                    if (!authorAvatar || authorAvatar.includes('gravatar')) {
                        authorAvatar = `https://api.dicebear.com/9.x/personas/svg?seed=${author?.name || 'admin'}`;
                    }
                    
                    const isExpert = author?.roles?.includes('rejimde_pro') || false;

                    return {
                        id: p.id,
                        title: p.title.rendered,
                        slug: p.slug,
                        excerpt: p.excerpt.rendered.replace(/<[^>]+>/g, ''),
                        content: p.content.rendered,
                        image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://placehold.co/600x400',
                        date: new Date(p.date).toLocaleDateString('tr-TR'),
                        author_name: author?.name || 'Rejimde Editör',
                        author_slug: author?.slug || 'admin',
                        author_avatar: authorAvatar,
                        author_is_expert: isExpert,
                        category: catName,
                        read_time: '5 dk', 
                        sticky: p.sticky 
                    };
                });
                setPosts(realPosts);
            }

            // 3. Etiketleri Çek
            const tagRes = await fetch(`${apiUrl}/wp/v2/tags?orderby=count&order=desc&per_page=10`);
            if (tagRes.ok) setTags(await tagRes.json());

            // 4. Haftanın Okurları
            const leaderRes = await fetch(`${apiUrl}/rejimde/v1/gamification/leaderboard`);
            if (leaderRes.ok) {
                const leaderData = await leaderRes.json();
                if (leaderData.status === 'success' && Array.isArray(leaderData.data) && leaderData.data.length > 0) {
                    const enrichedReaders = leaderData.data.slice(0, 3).map((reader: any) => {
                        // Okuyucular için de aynı avatar mantığı
                        const readerAvatar = reader.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${reader.name}`;
                        return {
                            ...reader,
                            avatar: readerAvatar,
                            slug: reader.slug || reader.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                        };
                    });
                    setTopReaders(enrichedReaders);
                } else {
                    setTopReaders([
                         { id: 991, name: 'GelinAdayı_99', score: 1250, avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=GelinAdayı', slug: 'gelinadayi_99' },
                         { id: 992, name: 'DamatBey', score: 980, avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=DamatBey', slug: 'damatbey' },
                         { id: 993, name: 'FitGörümce', score: 850, avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=FitGörümce', slug: 'fitgorumce' },
                    ]);
                }
            } else {
                 setTopReaders([
                     { id: 991, name: 'GelinAdayı_99', score: 1250, avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=GelinAdayı', slug: 'gelinadayi_99' },
                     { id: 992, name: 'DamatBey', score: 980, avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=DamatBey', slug: 'damatbey' },
                     { id: 993, name: 'FitGörümce', score: 850, avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=FitGörümce', slug: 'fitgorumce' },
                 ]);
            }

        } catch (error) {
            console.error("Veri yükleme hatası:", error);
        } finally {
            setLoading(false);
        }
    }

    initData();
  }, []);

  const featuredPost = posts.find(p => p.sticky) || (posts.length > 0 ? posts[0] : null);
  
  let filteredPosts = posts.filter(p => p.id !== featuredPost?.id);
  if (selectedCategory !== "Tümü") {
      filteredPosts = filteredPosts.filter(p => decodeHtml(p.category) === decodeHtml(selectedCategory));
  }

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
          window.scrollTo({ top: 600, behavior: 'smooth' });
      }
  };

  const getTheme = (catName: string) => {
      const cleanName = decodeHtml(catName);
      const key = Object.keys(CATEGORY_THEMES).find(k => cleanName.includes(k)) || 'Genel';
      return CATEGORY_THEMES[key];
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      
      {/* HERO: Featured Article */}
      {loading ? (
          <div className="py-20 text-center"><i className="fa-solid fa-circle-notch animate-spin text-4xl text-rejimde-green"></i></div>
      ) : featuredPost ? (
        <div className="bg-rejimde-text text-white py-12 relative overflow-hidden mb-8 shadow-md">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
            
            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="inline-flex items-center gap-2 bg-rejimde-yellow text-rejimde-text px-3 py-1 rounded-lg text-xs font-black uppercase mb-6 shadow-sm border border-white/20 animate-bounce">
                    <i className="fa-solid fa-star"></i> Haftanın Yazısı
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: featuredPost.title }}></h1>
                        <p className="text-gray-400 font-bold text-lg mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: featuredPost.excerpt.slice(0, 150) + "..." }}></p>
                        
                        <div className="flex items-center gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={featuredPost.author_avatar} 
                                    className="w-12 h-12 rounded-xl border-2 border-rejimde-green object-cover bg-white" 
                                    alt="Author"
                                />
                                <div>
                                    {/* Profil Linki: Profil sayfası otomatik redirect yaptığı için burayı /profile/slug olarak bırakmak güvenlidir */}
                                    <Link href={`/profile/${featuredPost.author_slug}`} className="font-extrabold text-white hover:underline">
                                        {featuredPost.author_name}
                                    </Link>
                                    <div className="text-xs font-bold text-gray-400 uppercase">Yazar</div>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div className="text-center">
                                <div className="font-black text-rejimde-yellow">+50 Puan</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Okuma Ödülü</div>
                            </div>
                        </div>

                        <Link href={`/blog/${featuredPost.slug}`} className="inline-flex bg-rejimde-green text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase items-center gap-3 hover:bg-green-500 transition">
                            Yazıyı Oku <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>

                    <Link href={`/blog/${featuredPost.slug}`} className="relative group cursor-pointer hidden lg:block">
                        <div className="absolute inset-0 bg-rejimde-green rounded-3xl transform rotate-6 opacity-20 group-hover:rotate-12 transition duration-500"></div>
                        <div className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl aspect-video">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={featuredPost.image} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" alt="Featured" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white uppercase border border-white/10">
                                    <i className="fa-regular fa-clock mr-1"></i> {featuredPost.read_time}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
      ) : (
          <div className="text-center py-20 font-bold text-gray-400">Henüz yazı bulunamadı.</div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4">

          {/* FILTERS */}
          <div className="flex flex-wrap gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
              <button 
                onClick={() => { setSelectedCategory("Tümü"); setCurrentPage(1); }}
                className={`px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game whitespace-nowrap transition ${selectedCategory === "Tümü" ? 'bg-rejimde-text text-white shadow-gray-800' : 'bg-white border-2 border-gray-200 text-gray-500 shadow-gray-200'}`}
              >
                  Tümü
              </button>
              {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setSelectedCategory(decodeHtml(cat.name)); setCurrentPage(1); }}
                    className={`px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game whitespace-nowrap transition ${decodeHtml(selectedCategory) === decodeHtml(cat.name) ? 'bg-rejimde-blue text-white shadow-blue-800' : 'bg-white border-2 border-gray-200 text-gray-500 shadow-gray-200 hover:text-rejimde-blue hover:border-rejimde-blue'}`}
                  >
                      {decodeHtml(cat.name)}
                  </button>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* LEFT: Articles Grid */}
              <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {paginatedPosts.length > 0 ? paginatedPosts.map(post => {
                          const categoryName = decodeHtml(post.category);
                          const theme = getTheme(categoryName);

                          return (
                            <Link 
                                key={post.id} 
                                href={`/blog/${post.slug}`} 
                                // DÜZELTME: Dinamik Border Rengi
                                className={`bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card ${theme.cardBorder} group flex flex-col h-full hover:-translate-y-1 duration-200`}
                            >
                                <div className="h-48 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={post.title} />
                                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm border ${theme.badge} bg-opacity-90`}>
                                        {categoryName}
                                    </span>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="font-extrabold text-xl text-gray-800 mb-3 leading-tight transition" dangerouslySetInnerHTML={{ __html: post.title }}></h3>
                                    <p className="text-sm font-bold text-gray-400 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: post.excerpt }}></p>
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t-2 border-gray-50">
                                        <div className="flex items-center gap-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                                src={post.author_avatar} 
                                                className="w-6 h-6 rounded-lg bg-gray-200 object-cover" 
                                                alt="Yazar"
                                            />
                                            <span className="text-xs font-black text-gray-500">{post.author_name}</span>
                                        </div>
                                        <span className="text-xs font-black text-rejimde-green bg-green-50 px-2 py-1 rounded">+10 Puan</span>
                                    </div>
                                </div>
                            </Link>
                          );
                      }) : (
                          <div className="col-span-2 text-center py-10 text-gray-400 font-bold bg-gray-50 rounded-3xl">
                              Bu kategoride henüz yazı yok.
                          </div>
                      )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-12">
                          <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold hover:border-rejimde-blue hover:text-rejimde-blue transition disabled:opacity-50"
                          >
                              <i className="fa-solid fa-chevron-left"></i>
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button 
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 rounded-xl font-black flex items-center justify-center transition ${currentPage === page ? 'bg-rejimde-blue text-white shadow-btn shadow-blue-600 btn-game' : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                              >
                                  {page}
                              </button>
                          ))}

                          <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold hover:border-rejimde-blue hover:text-rejimde-blue transition disabled:opacity-50"
                          >
                              <i className="fa-solid fa-chevron-right"></i>
                          </button>
                      </div>
                  )}
              </div>

              {/* RIGHT: Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                  
                  {/* Popular Tags */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
                      <h3 className="font-extrabold text-gray-700 uppercase text-sm mb-4">Popüler Etiketler</h3>
                      <div className="flex flex-wrap gap-2">
                          {tags.length > 0 ? tags.map((tag: any) => (
                              <span key={tag.id} className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-rejimde-green hover:text-white cursor-pointer transition">
                                  #{decodeHtml(tag.name)}
                              </span>
                          )) : <p className="text-xs text-gray-400">Yükleniyor...</p>}
                      </div>
                  </div>

                  {/* Newsletter */}
                  <div className="bg-rejimde-purple text-white rounded-3xl p-6 text-center shadow-float relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                      
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30 group-hover:scale-110 transition">
                          <i className="fa-solid fa-envelope-open-text text-3xl"></i>
                      </div>
                      <h3 className="font-extrabold text-lg mb-2">Tüyoları Kaçırma!</h3>
                      <p className="text-purple-100 text-xs font-bold mb-4 px-2">
                          Haftalık en iyi yazılar ve özel indirimler e-postana gelsin.
                      </p>
                      <div className="bg-white p-1 rounded-xl flex">
                          <input type="email" placeholder="E-posta adresin" className="flex-1 bg-transparent border-none text-gray-700 text-xs font-bold px-3 focus:outline-none" />
                          <button className="bg-rejimde-purpleDark text-white px-3 py-2 rounded-lg font-black text-xs uppercase hover:bg-purple-900 transition">
                              <i className="fa-solid fa-paper-plane"></i>
                          </button>
                      </div>
                  </div>

                  {/* Top Readers (Community) */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
                      <h3 className="font-extrabold text-gray-700 uppercase text-sm mb-4">Haftanın Okurları</h3>
                      <div className="space-y-3">
                          {topReaders.length > 0 ? topReaders.map((reader: any, index: number) => (
                              <div key={reader.id} className="flex items-center gap-3">
                                  <span className={`font-black w-4 text-center ${index === 0 ? 'text-rejimde-yellowDark' : 'text-gray-400'}`}>{index + 1}</span>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={reader.avatar} 
                                    className="w-8 h-8 rounded-lg bg-gray-200 object-cover" 
                                    alt="Reader" 
                                    onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/9.x/personas/svg?seed=${reader.name}` }}
                                  />
                                  <div className="flex-1">
                                      <Link href={`/profile/${reader.slug || '#'}`} className="text-xs font-bold text-gray-700 hover:underline hover:text-rejimde-blue block">
                                          {reader.name}
                                      </Link>
                                      <p className="text-[10px] font-bold text-gray-400">Puan Lideri</p>
                                  </div>
                                  <span className="text-xs font-black text-rejimde-green">{reader.score} P</span>
                              </div>
                          )) : (
                              <div className="text-center py-4">
                                  <MascotDisplay state="idle_dashboard" size={80} showBubble={false} />
                                  <p className="text-xs text-gray-400 font-bold mt-2">Henüz veri yok.</p>
                              </div>
                          )}
                      </div>
                  </div>

              </div>

          </div>
      </div>
    </div>
  );
}