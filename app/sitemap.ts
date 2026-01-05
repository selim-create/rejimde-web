import { MetadataRoute } from 'next';

// Safe fetch with timeout
async function safeFetch(url: string, timeout = 5000): Promise<any[] | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const res = await fetch(url, { 
      next: { revalidate: 3600 },
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) return null;
    
    const data = await res.json();
    
    // Handle both { status, data } and array formats
    if (data.status === 'success' && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return null;
  } catch (error) {
    console.warn(`Sitemap fetch failed for ${url}:`, error);
    return null;
  }
}

// Safe date parsing
function safeDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rejimde.com';
  
  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/diets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/exercises`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/experts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/sozluk`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/circles`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/calculators`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.rejimde.com/wp-json';
  
  const dynamicPages: MetadataRoute.Sitemap = [];

  // Blog posts
  const blogPosts = await safeFetch(`${apiUrl}/wp/v2/posts?per_page=100`);
  if (blogPosts) {
    blogPosts.forEach((post: any) => {
      if (post?.slug) {
        dynamicPages.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: safeDate(post.modified || post.date),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  }

  // Diet plans
  const dietPlans = await safeFetch(`${apiUrl}/rejimde/v1/plans?per_page=100`);
  if (dietPlans) {
    dietPlans.forEach((plan: any) => {
      if (plan?.slug) {
        dynamicPages.push({
          url: `${baseUrl}/diets/${plan.slug}`,
          lastModified: safeDate(plan.modified || plan.date),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  }

  // Exercise plans
  const exercisePlans = await safeFetch(`${apiUrl}/rejimde/v1/exercises?per_page=100`);
  if (exercisePlans) {
    exercisePlans.forEach((plan: any) => {
      if (plan?.slug) {
        dynamicPages.push({
          url: `${baseUrl}/exercises/${plan.slug}`,
          lastModified: safeDate(plan.modified || plan.date),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  }

  // Experts
  const experts = await safeFetch(`${apiUrl}/rejimde/v1/professionals?per_page=100`);
  if (experts) {
    experts.forEach((expert: any) => {
      if (expert?.slug) {
        dynamicPages.push({
          url: `${baseUrl}/experts/${expert.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  }

  // Dictionary items
  const dictionaryItems = await safeFetch(`${apiUrl}/rejimde/v1/dictionary?per_page=100`);
  if (dictionaryItems) {
    dictionaryItems.forEach((item: any) => {
      if (item?.slug) {
        dynamicPages.push({
          url: `${baseUrl}/sozluk/${item.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    });
  }

  // Circles
  const circles = await safeFetch(`${apiUrl}/rejimde/v1/circles?per_page=100`);
  if (circles) {
    circles.forEach((circle: any) => {
      if (circle?.slug) {
        dynamicPages.push({
          url: `${baseUrl}/circles/${circle.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    });
  }

  return [...staticPages, ...dynamicPages];
}
