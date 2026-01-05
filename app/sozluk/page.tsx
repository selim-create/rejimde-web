import { Metadata } from "next";
import DictionaryPageClient from "./DictionaryPageClient";

export const metadata: Metadata = {
  title: "Fitness & Beslenme Sözlüğü | Rejimde Wiki",
  description: "Fitness terimleri, egzersiz hareketleri, beslenme kavramları ve daha fazlası. Bilgi olmadan disiplin olmaz!",
  keywords: ["fitness sözlüğü", "egzersiz terimleri", "beslenme sözlüğü", "spor terimleri", "makro nedir", "squat nedir"],
  openGraph: {
    title: "Fitness & Beslenme Sözlüğü | Rejimde Wiki",
    description: "Hareketi doğrusunu öğren, terimleri keşfet.",
    type: "website",
    url: "https://rejimde.com/sozluk",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fitness & Beslenme Sözlüğü | Rejimde Wiki",
    description: "Hareketi doğrusunu öğren, terimleri keşfet.",
  },
};

export default function DictionaryPage() {
  return <DictionaryPageClient />;
}
