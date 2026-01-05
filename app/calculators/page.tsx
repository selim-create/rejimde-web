import { Metadata } from "next";
import CalculatorsPageClient from "./CalculatorsPageClient";

export const metadata: Metadata = {
  title: "Sağlık Hesaplayıcıları | BMI, Kalori, İdeal Kilo",
  description: "Ücretsiz BMI hesaplama, günlük kalori ihtiyacı, ideal kilo, vücut yağ oranı ve daha fazla sağlık hesaplayıcısı.",
  keywords: ["BMI hesaplama", "kalori hesaplama", "ideal kilo hesaplama", "vücut yağ oranı", "günlük kalori ihtiyacı", "bazal metabolizma"],
  openGraph: {
    title: "Sağlık Hesaplayıcıları | Rejimde",
    description: "Ücretsiz sağlık hesaplayıcıları ile kendini tanı.",
    type: "website",
    url: "https://rejimde.com/calculators",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sağlık Hesaplayıcıları | Rejimde",
    description: "Ücretsiz sağlık hesaplayıcıları ile kendini tanı.",
  },
};

export default function CalculatorsPage() {
  return <CalculatorsPageClient />;
}
