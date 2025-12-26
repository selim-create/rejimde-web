import { Metadata } from "next";
import Link from "next/link";
import { getPostBySlug, getBlogPosts } from "@/lib/api";
import MascotDisplay from "@/components/MascotDisplay";
import ClientBlogPost from "./ClientBlogPost";

// --- SEO METADATA (Server Side) ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; 
  const post = await getPostBySlug(slug);
  
  if (!post) return { title: "Yazı Bulunamadı - Rejimde" };

  return {
    title: `${post.title} - Rejimde Blog`,
    description: post.excerpt ?  post.excerpt. slice(0, 160) : "Rejimde Blog",
    openGraph:  {
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }:  { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  // Yan menü için rastgele 3 yazı çek
  const allPosts = await getBlogPosts();
  const relatedPosts = allPosts.filter((p: any) => p.slug !== slug).slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20 text-center px-4">
          <MascotDisplay state="cheat_meal_detected" size={200} showBubble={false} />
          <h1 className="text-2xl font-black text-gray-700 mt-6 mb-2">Yazı Bulunamadı</h1>
          <p className="text-gray-500 font-bold mb-6">Aradığın içerik silinmiş veya taşınmış olabilir.</p>
          <Link href="/blog" className="bg-rejimde-blue text-white px-6 py-3 rounded-xl font-extrabold shadow-btn btn-game">Blog&apos;a Dön</Link>
      </div>
    );
  }

  // Başlık Formatlayıcı (Kelime Vurgulama)
  const formatTitle = () => {
    const title = post.title;
    const highlighted = title.replace(
      /(\d+|".*?")/g, 
      '<span class="text-rejimde-green underline decoration-4 decoration-rejimde-yellow underline-offset-4">$1</span>'
    );
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="min-h-screen pb-20 relative font-sans text-rejimde-text">
       {/* Client Component (State, Interactivity, Progress Bar) */}
       <ClientBlogPost post={post} relatedPosts={relatedPosts} formattedTitle={formatTitle()} />
    </div>
  );
}