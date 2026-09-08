'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import type { NewsletterSourceId } from '@/lib/hiposta-newsletters';

type Props = {
  source: NewsletterSourceId;
  selector: string;
  title: string;
  description: string;
  className?: string;
};

export default function ContentEndNewsletterPlacement({ source, selector, title, description, className = '' }: Props) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(selector);
    if (!target?.parentElement) return;

    const slot = document.createElement('div');
    slot.dataset.newsletterContentEnd = source;
    slot.className = className;
    target.insertAdjacentElement('afterend', slot);
    setHost(slot);

    return () => {
      setHost(null);
      slot.remove();
    };
  }, [source, selector, className]);

  if (!host) return null;

  return createPortal(
    <NewsletterForm source={source} variant="horizontal" title={title} description={description} />,
    host
  );
}
