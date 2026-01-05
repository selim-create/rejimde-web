import { Metadata } from "next";
import DietsPageClient from "./DietsPageClient";

export const metadata: Metadata = {
  title: "Diyet Listeleri & Beslenme Programları",
  description: "Uzman onaylı diyet listeleri: keto, vegan, akdeniz, detoks, aralıklı oruç ve daha fazlası. Plan seç, tamamla, puan kazan!",
  keywords: ["diyet", "diyet listesi", "keto diyet", "vegan diyet", "akdeniz diyeti", "detoks", "aralıklı oruç", "beslenme programı"],
  openGraph: {
    title: "Diyet Listeleri & Beslenme Programları | Rejimde",
    description: "Uzman onaylı diyet listeleri ile hedefe ulaş.",
    type: "website",
    url: "https://rejimde.com/diets",
    images: ["/og-diets.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diyet Listeleri & Beslenme Programları | Rejimde",
    description: "Uzman onaylı diyet listeleri ile hedefe ulaş.",
    images: ["/og-diets.png"],
  },
};

export default function DietsPage() {
  return <DietsPageClient />;
}
