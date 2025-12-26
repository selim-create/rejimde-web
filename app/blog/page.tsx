import { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";

// SEO Metadata
export const metadata: Metadata = {
  title: "Sağlıklı Yaşam & Beslenme Rehberi | Rejimde Blog",
  description:  "Uzman diyetisyenler ve spor eğitmenlerinden beslenme, diyet, egzersiz ve sağlıklı yaşam hakkında bilimsel, güncel ve uygulanabilir içerikler.  Kilo verme, kas yapma, sağlıklı tarifler ve motivasyon yazıları.",
  keywords: ["diyet", "beslenme", "sağlıklı yaşam", "egzersiz", "kilo verme", "sağlıklı tarifler", "diyetisyen tavsiyeleri", "spor", "fitness", "motivasyon"],
  openGraph: {
    title: "Sağlıklı Yaşam & Beslenme Rehberi | Rejimde Blog",
    description:  "Uzman diyetisyenler ve spor eğitmenlerinden beslenme, diyet, egzersiz ve sağlıklı yaşam hakkında bilimsel içerikler.",
    type: "website",
    url: "https://rejimde.com/blog",
    siteName: "Rejimde",
    images: [
      {
        url: "https://rejimde.com/og-blog.jpg",
        width:  1200,
        height: 630,
        alt: "Rejimde Blog - Sağlıklı Yaşam Rehberi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sağlıklı Yaşam & Beslenme Rehberi | Rejimde Blog",
    description:  "Uzman diyetisyenlerden beslenme, diyet ve egzersiz tavsiyeleri.",
  },
  alternates: {
    canonical: "https://rejimde.com/blog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow:  true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Rejimde Blog",
  "description": "Sağlıklı yaşam, beslenme ve egzersiz hakkında uzman içerikleri",
  "url":  "https://rejimde.com/blog",
  "publisher": {
    "@type": "Organization",
    "name":  "Rejimde",
    "logo": {
      "@type": "ImageObject",
      "url": "https://rejimde.com/logo.png"
    }
  },
  "inLanguage": "tr-TR"
};

export default function BlogPage() {
  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPageClient />
    </>
  );
}