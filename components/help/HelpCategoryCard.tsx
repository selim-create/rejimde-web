import Link from 'next/link';

interface HelpCategoryCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color?: 'green' | 'blue' | 'purple' | 'yellow' | 'red';
  articleCount?: number;
}

const colorClasses = {
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-400',
    hover: 'hover:border-green-500 hover:bg-green-50'
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-400',
    hover: 'hover:border-blue-500 hover:bg-blue-50'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-400',
    hover: 'hover:border-purple-500 hover:bg-purple-50'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-400',
    hover: 'hover:border-yellow-500 hover:bg-yellow-50'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-400',
    hover: 'hover:border-red-500 hover:bg-red-50'
  }
};

export default function HelpCategoryCard({ 
  title, 
  description, 
  icon, 
  href, 
  color = 'blue',
  articleCount 
}: HelpCategoryCardProps) {
  const colors = colorClasses[color];

  return (
    <Link 
      href={href}
      className={`bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card hover:shadow-xl transition-all group ${colors.hover}`}
    >
      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.bg} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
        <i className={`${icon} text-3xl ${colors.text}`}></i>
      </div>

      {/* Title */}
      <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-gray-900">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 font-bold text-sm mb-4 leading-relaxed">
        {description}
      </p>

      {/* Article Count & Arrow */}
      <div className="flex items-center justify-between">
        {articleCount !== undefined && (
          <span className="text-xs font-black text-gray-400 uppercase">
            {articleCount} Makale
          </span>
        )}
        <i className={`fa-solid fa-arrow-right ${colors.text} group-hover:translate-x-1 transition-transform ml-auto`}></i>
      </div>
    </Link>
  );
}
