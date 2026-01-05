import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
// YENİ: Google Provider Eklendi
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from "@/components/ui/Toast";
import Script from 'next/script';

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
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-ZH1E88R761" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZH1E88R761');
          `}
        </Script>
        
        {/* Tüm uygulamayı Google Provider ile sarmalıyoruz */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ToastProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ToastProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}