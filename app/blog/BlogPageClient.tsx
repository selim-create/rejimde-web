"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";
import { getSafeAvatarUrl, getUserProfileUrl, isUserExpert } from "@/lib/helpers";

// Okuyucu tipi
interface ReaderInfo {
  id: number;
  name: string;
  avatar: string;
  slug: string;
  is_expert?: boolean;
}

// Blog post tipi
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author_name: string;
  author_slug: string;
  author_avatar: string;
  author_is_expert: boolean;
  category: string;
  read_time: string;
  sticky: boolean;
  comment_count: number;
  readers: ReaderInfo[];
  readers_count: number;
  is_sticky: boolean;
  score_reward: number;
}

// Kategori Temaları
const CATEGORY_THEMES: Record<string, { cardBorder: string; badge: string }> = {
  Beslenme: {
    cardBorder: "hover:border-green-400",
    badge: "text-green-700 bg-green-50 border-green-200",
  },
  Egzersiz: {
    cardBorder: "hover:border-red-400",
    badge: "text-red-700 bg-red-50 border-red-200",
  },
  Motivasyon: {
    cardBorder: "hover:border-purple-400",
    badge: "text-purple-700 bg-purple-50 border-purple-200",
  },
  Tarif: {
    cardBorder: "hover:border-yellow-400",
    badge: "text-yellow-700 bg-yellow-50 border-yellow-200",
  },
  Tarifler: {
    cardBorder: "hover:border-yellow-400",
    badge: "text-yellow-700 bg-yellow-50 border-yellow-200",
  },
  Genel: {
    cardBorder: "hover:border-gray-400",
    badge: "text-gray-600 bg-gray-50 border-gray-200",
  },
  "Bilim & Mitler": {
    cardBorder: "hover:border-blue-400",
    badge: "text-blue-700 bg-blue-50 border-blue-200",
  },
  "Gerçek Hikayeler": {
    cardBorder: "hover:border-orange-400",
    badge: "text-orange-700 bg-orange-50 border-orange-200",
  },
  "Pratik Hayat": {
    cardBorder: "hover:border-teal-400",
    badge: "text-teal-700 bg-teal-50 border-teal-200",
  },
  Psikoloji: {
    cardBorder: "hover:border-indigo-400",
    badge: "text-indigo-700 bg-indigo-50 border-indigo-200",
  },
};

// HTML Decode
const decodeHtml = (html: string): string => {
  if (typeof window === "undefined" || !html) return html;
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// Okuma süresi hesaplama
const calculateReadTime = (content: string): string => {
  if (!content) return "1 dk";
  const text = content.replace(/<[^>]+>/g, "");
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${Math.max(1, minutes)} dk`;
};

// Okuyucu profil URL'i
const getReaderProfileUrl = (reader: ReaderInfo): string => {
  if (reader.is_expert) return `/experts/${reader.slug}`;
  return `/profile/${reader.slug}`;
};

export default function BlogPageClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [topReaders, setTopReaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock Okuyucu Üretici (Fallback)
  const generateMockReaders = () => [
    { id: 901, name: "GelinAdayı_99", score: 1250, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Gelin", slug: "gelin" },
    { id: 902, name: "DamatBey", score: 1180, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Damat", slug: "damat" },
    { id: 903, name: "FitGörümce", score: 950, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Gorumce", slug: "gorumce" },
    { id: 904, name: "KoşuDelisi", score: 820, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Kosu", slug: "kosu" },
    { id: 905, name: "DiyetBüken", score: 760, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Diyet", slug: "diyet" },
    { id: 906, name: "SağlıkOlsun", score: 650, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Saglik", slug: "saglik" },
    { id: 907, name: "ProteinCanavarı", score: 540, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Protein", slug: "protein" },
    { id: 908, name: "YogaSever", score: 430, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Yoga", slug: "yoga" },
    { id: 909, name: "Avokado", score: 320, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Avokado", slug: "avokado" },
    { id: 910, name: "SonÜye", score: 110, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Son", slug: "son" },
  ];

  useEffect(() => {
    async function initData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || "https://api.rejimde.com/wp-json";

        // 1) Kategoriler
        let catsData: any[] = [];
        try {
          const catRes = await fetch(`${apiUrl}/wp/v2/categories?per_page=20`, {
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
          });
          if (catRes.ok) {
            catsData = await catRes.json();
            setCategories(catsData);
          }
        } catch (error) {
          console.error("Kategori fetch hatası:", error);
          setCategories([]);
        }

        // 2) Yazıları çek + enrich
        try {
          const postsRes = await fetch(`${apiUrl}/wp/v2/posts?_embed&per_page=100`, {
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
          });

          if (postsRes.ok) {
            const postsJson = await postsRes.json();

            const enrichedPosts: BlogPost[] = await Promise.all(
              postsJson.map(async (p: any) => {
                const catId = p.categories && p.categories.length > 0 ? p.categories[0] : null;
                const catObj = catsData.find((c: any) => c.id === catId);
                const catName = catObj ? decodeHtml(catObj.name) : "Genel";

                const author = p._embedded?.author?.[0];
                const authorAvatar = getSafeAvatarUrl(author?.avatar_url, author?.slug || "admin");
                const authorIsExpert = isUserExpert(author?.roles);

                const content = p.content?.rendered || "";
                const readTime = calculateReadTime(content);

                let readers: ReaderInfo[] = [];
                let readersCount = 0;
                let isSticky = !!p.sticky;

                try {
                  const rejimdeRes = await fetch(`${apiUrl}/rejimde/v1/blog/${p.slug}`, {
                    cache: "no-store",
                  });

                  if (rejimdeRes.ok) {
                    const rejimdeData = await rejimdeRes.json();
                    const blogData = rejimdeData?.data || rejimdeData;

                    if (Array.isArray(blogData?.readers)) {
                      readers = blogData.readers;
                      readersCount = blogData.readers_count ?? blogData.readers.length;
                    }

                    if (typeof blogData?.is_sticky === "boolean") {
                      isSticky = blogData.is_sticky;
                    }
                  }
                } catch {
                  // Sessizce geç
                }

                return {
                  id: p.id,
                  title: p.title?.rendered || "",
                  slug: p.slug,
                  excerpt: (p.excerpt?.rendered || "").replace(/<[^>]+>/g, ""),
                  content,
                  image: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "https://placehold.co/600x400",
                  author_name: author?.name || "Rejimde Editör",
                  author_slug: author?.slug || "admin",
                  author_avatar: authorAvatar,
                  author_is_expert: authorIsExpert,
                  category: catName,
                  read_time: readTime,
                  sticky: isSticky,
                  is_sticky: isSticky,
                  score_reward: isSticky ? 50 : 10,
                  comment_count: p._embedded?.replies?.[0]?.length || 0,
                  readers,
                  readers_count: readersCount,
                };
              })
            );

            setPosts(enrichedPosts);
          }
        } catch (error) {
          console.error("Yazılar fetch hatası:", error);
          setPosts([]);
        }

        // 3) Etiketleri çek
        try {
          const tagRes = await fetch(`${apiUrl}/wp/v2/tags?orderby=count&order=desc&per_page=10`, {
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
          });
          if (tagRes.ok) setTags(await tagRes.json());
        } catch (error) {
          console.error("Etiket fetch hatası:", error);
          setTags([]);
        }

        // 4) Haftanın okurları
        try {
          const leaderRes = await fetch(`${apiUrl}/rejimde/v1/gamification/leaderboard`, {
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
          });

          if (leaderRes.ok) {
            const leaderData = await leaderRes.json();
            if (leaderData?.status === "success" && Array.isArray(leaderData?.data) && leaderData.data.length > 0) {
              const enrichedReaders = leaderData.data.slice(0, 10).map((reader: any) => {
                const readerAvatar = getSafeAvatarUrl(reader.avatar, reader.name);
                const readerSlug =
                  reader.slug ||
                  String(reader.name || "")
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]+/g, "");
                return { ...reader, avatar: readerAvatar, slug: readerSlug };
              });
              setTopReaders(enrichedReaders);
            } else {
              setTopReaders(generateMockReaders());
            }
          } else {
            setTopReaders(generateMockReaders());
          }
        } catch (error) {
          console.error("Leaderboard fetch hatası:", error);
          setTopReaders(generateMockReaders());
        }
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    }

    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredPost = posts.find((p) => p.sticky) || (posts.length > 0 ? posts[0] : null);

  let filteredPosts = posts.filter((p) => p.id !== featuredPost?.id);
  if (selectedCategory !== "Tümü") {
    filteredPosts = filteredPosts.filter((p) => decodeHtml(p.category) === decodeHtml(selectedCategory));
  }

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 600, behavior: "smooth" });
    }
  };

  const getTheme = (catName: string) => {
    const cleanName = decodeHtml(catName);
    const key = Object.keys(CATEGORY_THEMES).find((k) => cleanName.includes(k)) || "Genel";
    return CATEGORY_THEMES[key];
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      {/* HERO: Featured Article */}
      {loading ? (
        <div className="py-20 text-center">
          <i className="fa-solid fa-circle-notch animate-spin text-4xl text-rejimde-green"></i>
        </div>
      ) : featuredPost ? (
        <div className="bg-rejimde-text text-white py-12 relative overflow-hidden mb-8 shadow-md">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(#fff 2px, transparent 2px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-rejimde-yellow text-rejimde-text px-3 py-1 rounded-lg text-xs font-black uppercase mb-6 shadow-sm border border-white/20">
              <i className="fa-solid fa-star"></i> Haftanın Yazısı
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                  {decodeHtml(featuredPost.title)}
                </h1>

                <p className="text-gray-400 font-bold text-lg mb-8 leading-relaxed">
                  {featuredPost.excerpt.slice(0, 150)}...
                </p>

                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredPost.author_avatar}
                      className="w-12 h-12 rounded-xl border-2 border-rejimde-green object-cover bg-white"
                      alt="Author"
                    />
                    <div>
                      <Link
                        href={getUserProfileUrl(featuredPost.author_slug, featuredPost.author_is_expert)}
                        className="font-extrabold text-white hover:underline"
                      >
                        {featuredPost.author_name}
                      </Link>
                      <div className="text-xs font-bold text-gray-400 uppercase">Yazar</div>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-white/10"></div>

                  <div className="text-center">
                    <div className="font-black text-rejimde-yellow">+{featuredPost.score_reward} Puan</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Okuma Ödülü</div>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex bg-rejimde-green text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-btn btn-game items-center gap-2 hover:scale-105 transition"
                >
                  Yazıyı Oku <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>

              <Link href={`/blog/${featuredPost.slug}`} className="relative group cursor-pointer hidden lg:block">
                <div className="absolute inset-0 bg-rejimde-green rounded-3xl transform rotate-6 opacity-20 group-hover:rotate-12 transition duration-500"></div>
                <div className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredPost.image}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                    alt="Featured"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-md text-yellow-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-yellow-100 shadow-sm flex items-center gap-1">
                      <i className="fa-solid fa-star"></i> +{featuredPost.score_reward}p
                    </span>
                  </div>

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
            onClick={() => {
              setSelectedCategory("Tümü");
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game whitespace-nowrap transition ${
              selectedCategory === "Tümü"
                ? "bg-rejimde-text text-white"
                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300"
            }`}
          >
            Tümü
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(decodeHtml(cat.name));
                setCurrentPage(1);
              }}
              className={`px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn btn-game whitespace-nowrap transition ${
                decodeHtml(selectedCategory) === decodeHtml(cat.name)
                  ? "bg-rejimde-text text-white"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              {decodeHtml(cat.name)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Articles Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedPosts.length > 0 ? (
                paginatedPosts.map((post) => {
                  const categoryName = decodeHtml(post.category);
                  const theme = getTheme(categoryName);

                  return (
                    // ✅ OUTER LINK KALDIRILDI (nested <a> hatası bitti)
                    <article
                      key={post.id}
                      className={`bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card ${theme.cardBorder} group flex flex-col h-full hover:-translate-y-1`}
                    >
                      {/* Görsel: tıklanabilir */}
                      <Link href={`/blog/${post.slug}`} className="block">
                        <div className="h-48 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.image}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            alt={decodeHtml(post.title)}
                          />

                          {/* Puan badge - sağ üst */}
                          <div
                            className={`absolute top-3 right-3 ${
                              post.is_sticky ? "bg-yellow-500" : "bg-green-500"
                            } text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md`}
                          >
                            +{post.score_reward}p
                          </div>

                          {/* Kategori badge - sol üst */}
                          <span
                            className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm border ${theme.badge} bg-opacity-90`}
                          >
                            {categoryName}
                          </span>
                        </div>
                      </Link>

                      <div className="p-6 flex flex-col flex-1">
                        {/* Başlık: tıklanabilir */}
                        <Link href={`/blog/${post.slug}`} className="block">
                          <h3 className="font-extrabold text-xl text-gray-800 mb-3 leading-tight transition">
                            {decodeHtml(post.title)}
                          </h3>
                        </Link>

                        {/* Özet: tıklanabilir */}
                        <Link href={`/blog/${post.slug}`} className="block">
                          <p className="text-sm font-bold text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
                        </Link>

                        <div className="mt-auto pt-4 border-t-2 border-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            {/* Yazar */}
                            <div className="flex items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.author_avatar}
                                className="w-6 h-6 rounded-lg bg-gray-200 object-cover"
                                alt="Yazar"
                              />
                              <span className="text-xs font-black text-gray-500 truncate max-w-[120px]">
                                {post.author_name}
                              </span>
                            </div>

                            {/* Okuma Süresi & Yorum */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-gray-400">
                                <i className="fa-regular fa-clock text-xs"></i>
                                <span className="text-xs font-bold">{post.read_time}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <i className="fa-regular fa-comment text-xs"></i>
                                <span className="text-xs font-bold">{post.comment_count}</span>
                              </div>
                            </div>
                          </div>

                            {/* Okuyan avatarlar + Yazıyı oku (aynı satır) */}
                            <div className="flex items-center justify-between gap-3 mt-3">
                            {/* Sol: Okuyanlar */}
                            {post.readers && post.readers.length > 0 ? (
                                <div className="flex items-center gap-2 min-w-0">
                                <div className="flex -space-x-2">
                                    {post.readers.slice(0, 3).map((reader: ReaderInfo) => (
                                    <Link
                                        key={reader.id}
                                        href={getReaderProfileUrl(reader)}
                                        className="relative hover:z-10"
                                        title={reader.name}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                        src={
                                            reader.avatar ||
                                            `https://api.dicebear.com/9.x/personas/svg?seed=${reader.name}`
                                        }
                                        className="w-6 h-6 rounded-full border-2 border-white hover:scale-110 transition"
                                        alt={reader.name}
                                        />
                                    </Link>
                                    ))}
                                </div>

                                {post.readers_count > 3 && (
                                    <span className="text-xs text-gray-400 font-bold truncate">
                                    +{post.readers_count - 3} kişi
                                    </span>
                                )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <i className="fa-solid fa-user-plus text-[8px] text-gray-400"></i>
                                </div>
                                <span className="text-xs text-gray-400 font-bold truncate">
                                    İlk okuyan sen ol!
                                </span>
                                </div>
                            )}

                            {/* Sağ: Yazıyı oku butonu */}
                            <Link
                                href={`/blog/${post.slug}`}
                                className="shrink-0 inline-flex items-center gap-2 text-xs font-black text-rejimde-blue hover:underline"
                            >
                                Yazıyı oku <i className="fa-solid fa-arrow-right text-[10px]"></i>
                            </Link>
                            </div>

                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl font-black flex items-center justify-center transition ${
                      currentPage === page
                        ? "bg-rejimde-blue text-white shadow-btn"
                        : "bg-white border-2 border-gray-200 text-gray-600 hover:border-rejimde-blue"
                    }`}
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
                {tags.length > 0 ? (
                  tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-rejimde-green hover:text-white cursor-pointer transition"
                    >
                      #{decodeHtml(tag.name)}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Yükleniyor...</p>
                )}
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
                <input
                  type="email"
                  placeholder="E-posta adresin"
                  className="flex-1 bg-transparent border-none text-gray-700 text-xs font-bold px-3 focus:outline-none"
                />
                <button className="bg-rejimde-purpleDark text-white px-3 py-2 rounded-lg font-black text-xs uppercase hover:bg-purple-900 transition">
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>

            {/* Top Readers */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-gray-700 uppercase text-sm">Haftanın Okurları</h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Top 10</span>
              </div>

              <div className="space-y-3">
                {topReaders.length > 0 ? (
                  topReaders.map((reader: any, index: number) => {
                    let rankColor = "text-gray-400";
                    let rankBg = "bg-gray-100";

                    if (index === 0) {
                      rankColor = "text-yellow-600";
                      rankBg = "bg-yellow-100 border-yellow-200";
                    } else if (index === 1) {
                      rankColor = "text-gray-600";
                      rankBg = "bg-gray-200 border-gray-300";
                    } else if (index === 2) {
                      rankColor = "text-orange-600";
                      rankBg = "bg-orange-100 border-orange-200";
                    }

                    return (
                      <div key={reader.id} className="flex items-center gap-3 group">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border ${rankBg} ${rankColor}`}>
                          {index + 1}
                        </div>

                        <Link href={getUserProfileUrl(reader.slug || "user", false)} className="relative hover:scale-110 transition-transform">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={reader.avatar}
                            className="w-9 h-9 rounded-xl bg-gray-100 object-cover border-2 border-white shadow-sm"
                            alt="Reader"
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/9.x/personas/svg?seed=${reader.name}`;
                            }}
                          />
                          {index < 3 && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                              <i className="fa-solid fa-crown text-[6px] text-white"></i>
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={getUserProfileUrl(reader.slug || "user", false)}
                            className="text-xs font-bold text-gray-700 hover:text-rejimde-blue truncate block transition"
                          >
                            {reader.name}
                          </Link>

                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rejimde-green rounded-full"
                                style={{ width: `${Math.min((reader.score / 2000) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-gray-700 block">{reader.score}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Puan</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <MascotDisplay state="idle_dashboard" size={60} showBubble={false} />
                    <p className="text-xs text-gray-400 font-bold mt-2">Henüz veri yok.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link href="/leagues" className="text-xs font-bold text-rejimde-blue hover:underline">
                  Tüm Sıralamayı Gör
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
