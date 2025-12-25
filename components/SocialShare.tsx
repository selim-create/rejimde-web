'use client';

import { useState, useEffect } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export default function SocialShare({ url, title, description = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [shareLinks, setShareLinks] = useState<{
    whatsapp: string;
    twitter: string;
    facebook: string;
    copy: string;
  } | null>(null);

  useEffect(() => {
    // Client-side'da URL oluştur
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);

    setShareLinks({
      whatsapp: `https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      copy: fullUrl
    });
  }, [url, title]);

  const handleCopyLink = async () => {
    if (!shareLinks) return;
    try {
      await navigator.clipboard.writeText(shareLinks.copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Links hazır olana kadar skeleton göster
  if (!shareLinks) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Paylaş:</span>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600">Paylaş:</span>
      
      {/* WhatsApp */}
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
        aria-label="WhatsApp'ta paylaş"
      >
        <i className="fab fa-whatsapp text-lg"></i>
      </a>

      {/* Twitter */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
        aria-label="Twitter'da paylaş"
      >
        <i className="fab fa-twitter text-lg"></i>
      </a>

      {/* Facebook */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
        aria-label="Facebook'ta paylaş"
      >
        <i className="fab fa-facebook-f text-lg"></i>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors relative"
        aria-label="Linki kopyala"
      >
        {copied ? (
          <i className="fas fa-check text-lg text-green-600"></i>
        ) : (
          <i className="fas fa-link text-lg"></i>
        )}
        
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Kopyalandı!
          </span>
        )}
      </button>
    </div>
  );
}
