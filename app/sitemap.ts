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
    // Blog posts - Use standard WordPress endpoint
    const blogRes = await fetch(`${apiUrl}/wp/v2/posts?per_page=100`, { next: { revalidate: 3600 } });
    let blogPosts = [];
    if (blogRes.ok) {
      // Standard WordPress returns array directly
      blogPosts = await blogRes.json();
    }
    
    // Diet plans - Returns { status: "success", data: [...] }
    const dietsRes = await fetch(`${apiUrl}/rejimde/v1/plans?per_page=100`, { next: { revalidate: 3600 } });
    let dietPlans = [];
    if (dietsRes.ok) {
      const dietsData = await dietsRes.json();
      // Handle both response formats
      dietPlans = dietsData.status === 'success' && dietsData.data ? dietsData.data : (Array.isArray(dietsData) ? dietsData : []);
    }
    
    // Exercise plans - Check lib/api.ts for correct endpoint, skip if not working
    let exercisePlans: any[] = [];
    try {
      const exercisesRes = await fetch(`${apiUrl}/rejimde/v1/exercises?per_page=100`, { next: { revalidate: 3600 } });
      if (exercisesRes.ok) {
        const exercisesData = await exercisesRes.json();
        exercisePlans = exercisesData.status === 'success' && exercisesData.data ? exercisesData.data : (Array.isArray(exercisesData) ? exercisesData : []);
      }
    } catch (e) {
      console.warn('Exercise plans endpoint not available, skipping');
    }
    
    // Experts
    const expertsRes = await fetch(`${apiUrl}/rejimde/v1/professionals?per_page=100`, { next: { revalidate: 3600 } });
    let experts = [];
    if (expertsRes.ok) {
      const expertsData = await expertsRes.json();
      experts = expertsData.status === 'success' && expertsData.data ? expertsData.data : (Array.isArray(expertsData) ? expertsData : []);
    }
    
    // Dictionary items
    const dictionaryRes = await fetch(`${apiUrl}/rejimde/v1/dictionary?per_page=100`, { next: { revalidate: 3600 } });
    let dictionaryItems = [];
    if (dictionaryRes.ok) {
      const dictionaryData = await dictionaryRes.json();
      dictionaryItems = dictionaryData.status === 'success' && dictionaryData.data ? dictionaryData.data : (Array.isArray(dictionaryData) ? dictionaryData : []);
    }
    
    // Circles
    const circlesRes = await fetch(`${apiUrl}/rejimde/v1/circles?per_page=100`, { next: { revalidate: 3600 } });
    let circles = [];
    if (circlesRes.ok) {
      const circlesData = await circlesRes.json();
      circles = circlesData.status === 'success' && circlesData.data ? circlesData.data : (Array.isArray(circlesData) ? circlesData : []);
    }

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
