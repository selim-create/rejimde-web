import { Metadata } from 'next';
import ExpertProfileClient from './ExpertProfileClient';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.rejimde.com/wp-json';

async function getExpertBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/professionals/${slug}`, {
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
    console.error('Error fetching expert:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const expert = await getExpertBySlug(slug);
  
  if (!expert) {
    return {
      title: 'Uzman Bulunamadı | Rejimde',
      description: 'Aradığınız uzman bulunamadı.'
    };
  }
  
  const name = expert.name || 'Uzman';
  const title = expert.title || '';
  const bio = expert.bio?.replace(/<[^>]+>/g, '').substring(0, 160) || `${title} ${name} - Rejimde'de uzman diyetisyen ve antrenör hizmetleri.`;
  const image = expert.image || expert.avatar_url || `https://api.dicebear.com/9.x/personas/svg?seed=${slug}`;
  const profession = expert.profession || 'dietitian';
  
  const professionMap: Record<string, string> = {
    dietitian: 'Diyetisyen',
    trainer: 'Personal Trainer',
    nutritionist: 'Beslenme Uzmanı',
    physio: 'Fizyoterapist',
    doctor: 'Doktor',
    coach: 'Sağlık Koçu'
  };
  
  const professionLabel = professionMap[profession] || 'Uzman';
  const fullTitle = title ? `${title} ${name}` : name;
  
  return {
    title: `${fullTitle} - ${professionLabel} | Rejimde`,
    description: bio,
    openGraph: {
      title: `${fullTitle} - ${professionLabel} | Rejimde`,
      description: bio,
      type: 'profile',
      url: `https://rejimde.com/experts/${slug}`,
      images: [
        {
          url: image,
          width: 400,
          height: 400,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${fullTitle} - ${professionLabel} | Rejimde`,
      description: bio,
      images: [image],
    },
  };
}

export default function ExpertProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  return <ExpertProfileClient />;
}
