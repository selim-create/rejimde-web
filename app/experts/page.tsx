import { Metadata } from "next";
import ExpertsPageClient from "./ExpertsPageClient";

export const metadata: Metadata = {
  title: "Diyetisyen & Spor Uzmanları",
  description: "Alanında uzman diyetisyenler, personal trainerlar, sağlık koçları ve fizyoterapistler. Sana uygun uzmanı bul, online veya yüz yüze danışmanlık al.",
  keywords: ["diyetisyen", "personal trainer", "spor koçu", "beslenme uzmanı", "fizyoterapist", "sağlık koçu"],
  openGraph: {
    title: "Diyetisyen & Spor Uzmanları | Rejimde",
    description: "Sana uygun uzmanı bul, hedefine ulaş.",
    type: "website",
    url: "https://rejimde.com/experts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diyetisyen & Spor Uzmanları | Rejimde",
    description: "Sana uygun uzmanı bul, hedefine ulaş.",
  },
};

export default function ExpertsPage() {
  return <ExpertsPageClient />;
}
