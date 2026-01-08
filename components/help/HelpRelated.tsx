import Link from 'next/link';

interface RelatedArticle {
  title: string;
  href: string;
  icon?: string;
}

interface HelpRelatedProps {
  articles: RelatedArticle[];
  title?: string;
}

export default function HelpRelated({ articles, title = 'İlgili Makaleler' }: HelpRelatedProps) {
  if (articles.length === 0) return null;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card sticky top-6">
      <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-link text-rejimde-purple"></i>
        {title}
      </h3>
      
      <ul className="space-y-3">
        {articles.map((article, index) => (
          <li key={index}>
            <Link
              href={article.href}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
            >
              {article.icon && (
                <i className={`${article.icon} text-rejimde-blue mt-0.5 group-hover:scale-110 transition`}></i>
              )}
              <span className="font-bold text-sm text-gray-700 group-hover:text-rejimde-blue leading-snug">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Help CTA */}
      <div className="mt-6 pt-6 border-t-2 border-gray-100">
        <p className="text-xs font-bold text-gray-500 mb-3">Hala yardıma mı ihtiyacın var?</p>
        <Link
          href="/contact"
          className="block text-center bg-rejimde-green text-white px-4 py-2.5 rounded-xl font-extrabold text-sm shadow-btn shadow-rejimde-greenDark btn-game hover:bg-rejimde-greenDark transition"
        >
          <i className="fa-solid fa-headset mr-2"></i>
          Bize Ulaş
        </Link>
      </div>
    </div>
  );
}
