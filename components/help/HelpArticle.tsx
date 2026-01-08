import { ReactNode } from 'react';

interface HelpArticleProps {
  children: ReactNode;
  title: string;
  description?: string;
  lastUpdated?: string;
}

export default function HelpArticle({ children, title, description, lastUpdated }: HelpArticleProps) {
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
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-green-100 text-green-700 rounded-xl font-extrabold hover:bg-green-200 transition">
            <i className="fa-solid fa-thumbs-up mr-2"></i>
            Evet
          </button>
          <button className="px-6 py-2.5 bg-red-100 text-red-700 rounded-xl font-extrabold hover:bg-red-200 transition">
            <i className="fa-solid fa-thumbs-down mr-2"></i>
            Hayır
          </button>
        </div>
      </footer>
    </article>
  );
}
