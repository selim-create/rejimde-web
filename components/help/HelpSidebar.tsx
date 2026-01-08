'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarSection {
  title: string;
  icon: string;
  items: {
    label: string;
    href: string;
  }[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Başlangıç',
    icon: 'fa-solid fa-rocket',
    items: [
      { label: 'Başlangıç Rehberi', href: '/help/getting-started' },
      { label: 'Sıkça Sorulan Sorular', href: '/help/faq' }
    ]
  },
  {
    title: 'Platform Özellikleri',
    icon: 'fa-solid fa-star',
    items: [
      { label: 'Diyet Takibi', href: '/help/diets' },
      { label: 'Egzersiz Takibi', href: '/help/exercises' },
      { label: 'Puan Sistemi', href: '/help/score-system' },
      { label: 'Seviye Sistemi', href: '/help/levels' },
      { label: 'Günlük Seri (Streak)', href: '/help/streak' },
      { label: 'Circle Rehberi', href: '/help/circles' },
      { label: 'Uzmanlarla Çalışma', href: '/help/experts' }
    ]
  },
  {
    title: 'Uzmanlar İçin',
    icon: 'fa-solid fa-briefcase',
    items: [
      { label: 'Uzman Paneli', href: '/help/pro' },
      { label: 'Uzman RejiScore', href: '/help/pro/reji-score' },
      { label: 'Danışan Yönetimi', href: '/help/pro/clients' },
      { label: 'Plan Oluşturma', href: '/help/pro/plans' },
      { label: 'Takvim Yönetimi', href: '/help/pro/calendar' },
      { label: 'Değerlendirmeler', href: '/help/pro/reviews' },
      { label: 'Hizmet/Paket Yönetimi', href: '/help/pro/services' },
      { label: 'Mesajlaşma (Inbox)', href: '/help/pro/inbox' },
      { label: 'Duyurular', href: '/help/pro/announcements' },
      { label: 'Medya Kütüphanesi', href: '/help/pro/media' },
      { label: 'SSS Yönetimi', href: '/help/pro/faq-management' },
      { label: 'Gelir Yönetimi', href: '/help/pro/earnings' },
      { label: 'Onaylı Uzman Olma', href: '/help/pro/verification' }
    ]
  }
];

export default function HelpSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-rejimde-blue text-white w-14 h-14 rounded-full shadow-float flex items-center justify-center btn-game shadow-btn shadow-rejimde-blueDark"
      >
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto
          w-80 lg:w-full bg-white border-r-2 lg:border-r-0 lg:border-2 border-gray-200 
          rounded-none lg:rounded-3xl p-6 overflow-y-auto
          transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="mb-6 pb-4 border-b-2 border-gray-100">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-book text-rejimde-blue"></i>
            İçindekiler
          </h2>
        </div>

        {/* Sections */}
        <nav className="space-y-6">
          {sidebarSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
                <i className={section.icon}></i>
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        block px-4 py-2.5 rounded-xl font-bold text-sm transition-all
                        ${isActive(item.href)
                          ? 'bg-rejimde-blue text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer CTA */}
        <div className="mt-8 pt-6 border-t-2 border-gray-100">
          <Link
            href="/contact"
            className="block text-center bg-gradient-to-r from-rejimde-green to-rejimde-blue text-white px-4 py-3 rounded-2xl font-extrabold text-sm shadow-btn shadow-gray-400 btn-game hover:opacity-90 transition"
          >
            <i className="fa-solid fa-headset mr-2"></i>
            Bize Ulaş
          </Link>
        </div>
      </aside>
    </>
  );
}
