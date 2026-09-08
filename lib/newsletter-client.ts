import type { HipostaNewsletterOption, NewsletterSourceId } from '@/lib/hiposta-newsletters';

type SubscribePayload = {
  email: string;
  newsletters: string[];
  source: NewsletterSourceId;
  website?: string;
};

type SubscribeResult = {
  success: boolean;
  message: string;
  status?: string;
};

export async function getNewsletterOptions(): Promise<HipostaNewsletterOption[]> {
  try {
    const response = await fetch('/api/newsletters/options', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const payload = await response.json() as { options?: HipostaNewsletterOption[] };
    return Array.isArray(payload.options) ? payload.options : [];
  } catch {
    return [];
  }
}

export async function subscribeNewsletters(payload: SubscribePayload): Promise<SubscribeResult> {
  try {
    const response = await fetch('/api/newsletters/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        newsletters: payload.newsletters,
        source: payload.source,
        website: payload.website || '',
        consent: true,
      }),
    });

    const result = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message = typeof result.message === 'string'
      ? result.message
      : response.ok
        ? 'Seçimin kaydedildi.'
        : 'Bülten aboneliği tamamlanamadı. Lütfen tekrar deneyin.';

    return {
      success: response.ok && result.success === true,
      status: typeof result.status === 'string' ? result.status : undefined,
      message,
    };
  } catch {
    return {
      success: false,
      message: 'Bülten servisine şu anda ulaşılamıyor. Lütfen tekrar deneyin.',
    };
  }
}

export async function subscribeToPrimaryNewsletters(email: string, source: NewsletterSourceId): Promise<SubscribeResult> {
  const options = await getNewsletterOptions();
  const primary = options.filter((option) => option.isPrimary).map((option) => option.slug);
  if (primary.length === 0) {
    return { success: false, message: 'Rejimde bültenleri şu anda aboneliğe açık değil.' };
  }
  return subscribeNewsletters({ email, newsletters: primary, source });
}
