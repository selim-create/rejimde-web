import { Metadata } from "next";
import ExercisesPageClient from "./ExercisesPageClient";

// SEO Metadata
export const metadata: Metadata = {
  title: "Egzersiz Programları & Antrenman Planları | Rejimde",
  description: "Uzman onaylı egzersiz programları:  HIIT, kardiyo, yoga, pilates, güç antrenmanı ve daha fazlası.  Seviyene uygun programı seç, tamamla, puan kazan! ",
  keywords: ["egzersiz", "antrenman", "fitness", "HIIT", "kardiyo", "yoga", "pilates", "güç antrenmanı", "ev egzersizi", "kilo verme", "kas yapma"],
  openGraph: {
    title: "Egzersiz Programları & Antrenman Planları | Rejimde",
    description: "Uzman onaylı egzersiz programları ile formda kal.  HIIT, kardiyo, yoga ve daha fazlası.",
    type: "website",
    url: "https://rejimde.com/exercises",
    siteName: "Rejimde",
    images: [
      {
        url:  "https://rejimde.com/og-exercises.jpg",
        width:  1200,
        height: 630,
        alt: "Rejimde Egzersiz Programları",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Egzersiz Programları & Antrenman Planları | Rejimde",
    description: "Uzman onaylı egzersiz programları ile formda kal.",
  },
  alternates: {
    canonical: "https://rejimde.com/exercises",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview":  "large",
      "max-snippet":  -1,
    },
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Rejimde Egzersiz Programları",
  "description": "Uzman onaylı egzersiz programları, antrenman planları ve fitness içerikleri",
  "url": "https://rejimde.com/exercises",
  "publisher": {
    "@type": "Organization",
    "name":  "Rejimde",
    "logo": {
      "@type": "ImageObject",
      "url": "https://rejimde.com/logo.png"
    }
  },
  "inLanguage": "tr-TR",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name":  "HIIT Programları"
      },
      {
        "@type": "ListItem",
        "position":  2,
        "name": "Kardiyo Egzersizleri"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Yoga & Pilates"
      },
      {
        "@type": "ListItem",
        "position":  4,
        "name": "Güç Antrenmanı"
      }
    ]
  }
};

export default function ExercisesPage() {
  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExercisesPageClient />
    </>
  );
}