import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HelpBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function HelpBreadcrumb({ items }: HelpBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm font-bold mb-6">
      <Link href="/help" className="text-rejimde-blue hover:underline flex items-center gap-2">
        <i className="fa-solid fa-house"></i>
        Yardım
      </Link>
      
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <i className="fa-solid fa-chevron-right text-gray-400 text-xs"></i>
          {item.href ? (
            <Link href={item.href} className="text-gray-600 hover:text-rejimde-blue hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-black">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
