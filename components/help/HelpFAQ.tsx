'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpFAQProps {
  faqs: FAQItem[];
  defaultOpen?: number;
}

export default function HelpFAQ({ faqs, defaultOpen }: HelpFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen !== undefined ? defaultOpen : null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-rejimde-blue"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left font-bold hover:bg-gray-50 transition"
          >
            <span className="text-gray-800 font-black pr-4">{faq.question}</span>
            <i
              className={`fa-solid fa-chevron-down text-rejimde-blue transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            ></i>
          </button>
          
          {openIndex === index && (
            <div className="px-6 pb-4 pt-2 text-gray-600 font-bold leading-relaxed border-t border-gray-100">
              {/* Note: dangerouslySetInnerHTML is used here for FAQ content with HTML links.
                  This is safe as FAQ content is developer-controlled and not user-generated.
                  Only use this component with trusted, sanitized content. */}
              <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
