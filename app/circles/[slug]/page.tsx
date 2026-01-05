import { Metadata } from 'next';
import CircleDetailClient from './CircleDetailClient';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.rejimde.com/wp-json';

async function getCircleBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/circles/${slug}`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    
    // Handle different response formats
    if (data.status === 'success' && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching circle:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const circle = await getCircleBySlug(slug);
  
  if (!circle) {
    return {
      title: 'Circle Bulunamadı | Rejimde',
      description: 'Aradığınız motivasyon grubu bulunamadı.'
    };
  }
  
  const name = circle.name || 'Circle';
  const description = circle.description?.replace(/<[^>]+>/g, '').substring(0, 160) || `${name} - Birlikte başarmak için motivasyon grubu`;
  const memberCount = circle.member_count || circle.members?.length || 0;
  const image = circle.logo || circle.image || '/og-circles.png';
  
  return {
    title: `${name} - Circle | Rejimde`,
    description: description,
    openGraph: {
      title: `${name} - Circle | Rejimde`,
      description: `${description} • ${memberCount} üye`,
      type: 'website',
      url: `https://rejimde.com/circles/${slug}`,
      images: [
        {
          url: image,
          width: 400,
          height: 400,
          alt: name,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${name} - Circle | Rejimde`,
      description: `${description} • ${memberCount} üye`,
      images: [image],
    },
  };
}

export default function CircleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CircleDetailClient />;
}
