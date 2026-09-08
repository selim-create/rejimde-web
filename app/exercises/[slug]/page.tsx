import { Metadata } from 'next';
import ExerciseDetailClient from './ExerciseDetailClient';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.rejimde.com/wp-json';

async function getExercisePlanBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/exercises?slug=${slug}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status === 'success' && data.data) {
      return Array.isArray(data.data) ? data.data[0] : data.data;
    }
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('Error fetching exercise plan:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plan = await getExercisePlanBySlug(slug);

  if (!plan) {
    return {
      title: 'Egzersiz Bulunamadı | Rejimde',
      description: 'Aradığınız egzersiz planı bulunamadı.'
    };
  }

  const title = plan.title?.rendered || plan.title || 'Egzersiz Planı';
  const description = plan.excerpt?.rendered?.replace(/<[^>]+>/g, '') || plan.excerpt?.replace(/<[^>]+>/g, '') || 'Uzman onaylı egzersiz planı ile hedefe ulaş.';
  const image = plan.image || plan.featured_image || '/og-exercises.png';

  return {
    title: `${title} | Rejimde`,
    description: description.substring(0, 160),
    openGraph: {
      title: `${title} | Rejimde`,
      description: description.substring(0, 160),
      type: 'article',
      url: `https://rejimde.com/exercises/${slug}`,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Rejimde`,
      description: description.substring(0, 160),
      images: [image],
    },
  };
}

export default function ExerciseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ExerciseDetailClient params={params} />;
}
