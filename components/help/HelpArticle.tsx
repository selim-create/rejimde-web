'use client';

import { ReactNode, useState, useEffect } from 'react';

interface HelpArticleProps {
  children: ReactNode;
  title: string;
  description?: string;
  lastUpdated?: string;
  articleSlug?: string;
}

export default function HelpArticle({ children, title, description, lastUpdated, articleSlug }: HelpArticleProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  // Generate slug from title if not provided
  const slug = articleSlug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  useEffect(() => {
    // Check if user already gave feedback
    if (typeof window !== 'undefined') {
      const storedFeedback = localStorage.getItem(`help_feedback_${slug}`);
      if (storedFeedback) {
        setFeedback(storedFeedback as 'helpful' | 'not-helpful');
        setShowThankYou(true);
      }
    }
  }, [slug]);

  const handleFeedback = (isHelpful: boolean) => {
    const feedbackValue = isHelpful ? 'helpful' : 'not-helpful';
    setFeedback(feedbackValue);
    setShowThankYou(true);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`help_feedback_${slug}`, feedbackValue);
    }

    // Hide thank you message after 3 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
  };

  return (
    <article className="bg-white border-2 border-gray-200 rounded-3xl p-8 lg:p-10 shadow-card">
      {/* Article Header */}
      <header className="mb-8 pb-6 border-b-2 border-gray-100">
        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-gray-600 font-bold leading-relaxed">
            {description}
          </p>
        )}
        {lastUpdated && (
          <p className="text-xs font-bold text-gray-400 mt-4 flex items-center gap-2">
            <i className="fa-solid fa-clock"></i>
            Son güncelleme: {lastUpdated}
          </p>
        )}
      </header>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none help-article-content">
        {children}
      </div>

      {/* Article Footer */}
      <footer className="mt-10 pt-6 border-t-2 border-gray-100">
        <p className="text-sm font-bold text-gray-600 mb-4">Bu makale yardımcı oldu mu?</p>
        {showThankYou ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
            <i className="fa-solid fa-check-circle text-green-600 text-2xl mb-2"></i>
            <p className="font-black text-green-700">Teşekkürler! Geri bildiriminiz kaydedildi.</p>
          </div>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => handleFeedback(true)}
              disabled={feedback !== null}
              className={`px-6 py-2.5 rounded-xl font-extrabold transition ${
                feedback === 'helpful' 
                  ? 'bg-green-200 text-green-800' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <i className="fa-solid fa-thumbs-up mr-2"></i>
              Evet
            </button>
            <button 
              onClick={() => handleFeedback(false)}
              disabled={feedback !== null}
              className={`px-6 py-2.5 rounded-xl font-extrabold transition ${
                feedback === 'not-helpful' 
                  ? 'bg-red-200 text-red-800' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <i className="fa-solid fa-thumbs-down mr-2"></i>
              Hayır
            </button>
          </div>
        )}
      </footer>
    </article>
  );
}
