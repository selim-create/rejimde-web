import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rejimde.com';
  
  // Statik sayfalar
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/diets`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/exercises`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/experts`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/sozluk`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/circles`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/calculators`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ];

  // API'den dinamik içerikleri çek
  const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.rejimde.com/wp-json';
  
  try {
    // Blog posts
    const blogRes = await fetch(`${apiUrl}/rejimde/v1/posts?per_page=100`, { next: { revalidate: 3600 } });
    const blogPosts = blogRes.ok ? await blogRes.json() : [];
    
    // Diet plans
    const dietsRes = await fetch(`${apiUrl}/rejimde/v1/plans?per_page=100`, { next: { revalidate: 3600 } });
    const dietPlans = dietsRes.ok ? await dietsRes.json() : [];
    
    // Exercise plans
    const exercisesRes = await fetch(`${apiUrl}/rejimde/v1/exercise-plans?per_page=100`, { next: { revalidate: 3600 } });
    const exercisePlans = exercisesRes.ok ? await exercisesRes.json() : [];
    
    // Experts
    const expertsRes = await fetch(`${apiUrl}/rejimde/v1/professionals?per_page=100`, { next: { revalidate: 3600 } });
    const experts = expertsRes.ok ? await expertsRes.json() : [];
    
    // Dictionary items
    const dictionaryRes = await fetch(`${apiUrl}/rejimde/v1/dictionary?per_page=100`, { next: { revalidate: 3600 } });
    const dictionaryItems = dictionaryRes.ok ? await dictionaryRes.json() : [];
    
    // Circles
    const circlesRes = await fetch(`${apiUrl}/rejimde/v1/circles?per_page=100`, { next: { revalidate: 3600 } });
    const circles = circlesRes.ok ? await circlesRes.json() : [];

    const dynamicPages = [
      ...blogPosts.map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.modified || post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...dietPlans.map((plan: any) => ({
        url: `${baseUrl}/diets/${plan.slug}`,
        lastModified: new Date(plan.modified || plan.date),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...exercisePlans.map((plan: any) => ({
        url: `${baseUrl}/exercises/${plan.slug}`,
        lastModified: new Date(plan.modified || plan.date),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...experts.map((expert: any) => ({
        url: `${baseUrl}/experts/${expert.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...dictionaryItems.map((item: any) => ({
        url: `${baseUrl}/sozluk/${item.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
      ...circles.map((circle: any) => ({
        url: `${baseUrl}/circles/${circle.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ];

    return [...staticPages, ...dynamicPages] as MetadataRoute.Sitemap;
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return staticPages as MetadataRoute.Sitemap;
  }
}
