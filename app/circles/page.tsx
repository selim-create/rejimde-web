import { Metadata } from "next";
import CirclesPageClient from "./CirclesPageClient";

export const metadata: Metadata = {
  title: "Motivasyon Grupları (Circle)",
  description: "Seninle aynı hedefe koşan insanlarla takım ol. Birlikte zayıflamak, tek başına zayıflamaktan %60 daha etkili!",
  keywords: ["motivasyon grubu", "diyet grubu", "fitness topluluğu", "birlikte zayıflama", "spor arkadaşı"],
  openGraph: {
    title: "Motivasyon Grupları (Circle) | Rejimde",
    description: "Circle'ını bul, gücüne güç kat!",
    type: "website",
    url: "https://rejimde.com/circles",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motivasyon Grupları (Circle) | Rejimde",
    description: "Circle'ını bul, gücüne güç kat!",
  },
};

export default function CirclesPage() {
  return <CirclesPageClient />;
}
