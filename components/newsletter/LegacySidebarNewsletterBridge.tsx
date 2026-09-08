'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import type { NewsletterSourceId } from '@/lib/hiposta-newsletters';

type Props = {
  source: NewsletterSourceId;
  title: string;
  description: string;
};

export default function LegacySidebarNewsletterBridge({ source, title, description }: Props) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="email"]'));
    const legacyInput = inputs.find((input) => input.placeholder?.toLocaleLowerCase('tr-TR').includes('e-posta'));
    if (!legacyInput) return;

    let legacyCard: HTMLElement | null = legacyInput.parentElement;
    while (legacyCard && legacyCard.parentElement && !legacyCard.className.includes('rounded-3xl')) {
      legacyCard = legacyCard.parentElement;
    }

    if (!legacyCard?.parentElement) return;

    const slot = document.createElement('div');
    slot.dataset.newsletterSidebar = source;
    legacyCard.parentElement.insertBefore(slot, legacyCard);
    legacyCard.style.display = 'none';
    setHost(slot);

    return () => {
      setHost(null);
      legacyCard!.style.display = '';
      slot.remove();
    };
  }, [source]);

  if (!host) return null;

  return createPortal(
    <NewsletterForm source={source} title={title} description={description} />,
    host
  );
}
