import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
// YENİ: Google Provider Eklendi
import { GoogleOAuthProvider } from '@react-oauth/google';

const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: "Rejimde - Sağlık Oyunu Başlasın!",
  description: "Türkiye'nin en eğlenceli diyet ve spor platformu.",
};

// YENİ: Müşteri tarafından sağlanan Client ID
const GOOGLE_CLIENT_ID = "629392742338-aguglif2l3qt9p6oqe6qfoiafqj7a8e9.apps.googleusercontent.com";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${nunito.variable} font-sans bg-[#f7f7f7] text-[#4b4b4b] flex flex-col min-h-screen`}>
        {/* Tüm uygulamayı Google Provider ile sarmalıyoruz */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}