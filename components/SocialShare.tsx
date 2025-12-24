'use client';

import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export default function SocialShare({ url, title, description = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  // Ensure we have a complete URL for sharing
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rejimde.com';
  const shareUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const shareText = description || title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' - ' + shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };

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
