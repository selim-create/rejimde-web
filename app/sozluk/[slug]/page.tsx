import { Metadata } from 'next';
import DictionaryClient from './DictionaryClient';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.rejimde.com/wp-json';

async function getDictionaryItem(slug: string) {
  try {
    const res = await fetch(`${API_URL}/rejimde/v1/dictionary/${slug}`, {
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
    console.error('Error fetching dictionary item:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getDictionaryItem(slug);
  
  if (!item) {
    return {
      title: 'Terim Bulunamadı | Rejimde Sözlük',
      description: 'Aradığınız sağlık ve fitness terimi bulunamadı.'
    };
  }
  
  const title = item.title?.rendered || item.title || 'Sözlük Terimi';
  const content = item.content?.rendered?.replace(/<[^>]+>/g, '') || item.content?.replace(/<[^>]+>/g, '') || item.description || '';
  const description = content.substring(0, 160) || `${title} - Sağlık ve fitness sözlüğü`;
  const category = item.category || 'Genel';
  
  return {
    title: `${title} Nedir? | Rejimde Sözlük`,
    description: description,
    keywords: [title, category, 'sağlık sözlüğü', 'fitness sözlüğü', 'beslenme terimleri'],
    openGraph: {
      title: `${title} Nedir? | Rejimde Sözlük`,
      description: description,
      type: 'article',
      url: `https://rejimde.com/sozluk/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${title} Nedir? | Rejimde Sözlük`,
      description: description,
    },
  };
}

export default function DictionaryPage({ params }: { params: Promise<{ slug: string }> }) {
  return <DictionaryClient />;
}
