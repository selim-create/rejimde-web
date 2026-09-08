'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import HipostaNewsletterModal from '@/components/newsletter/HipostaNewsletterModal';
import { getNewsletterOptions, subscribeNewsletters } from '@/lib/newsletter-client';
import type { HipostaNewsletterOption, NewsletterSourceId } from '@/lib/hiposta-newsletters';

type Props = {
  source: NewsletterSourceId;
  variant?: 'card' | 'horizontal';
  title?: string;
  description?: string;
  className?: string;
};

export default function NewsletterForm({
  source,
  variant = 'card',
  title = 'İyi Yaşam Notları',
  description = 'Beslenme, hareket ve iyi yaşam için işe yarayan seçkiler e-postana gelsin.',
  className = '',
}: Props) {
  const horizontal = variant === 'horizontal';
  const [options, setOptions] = useState<HipostaNewsletterOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    getNewsletterOptions().then((rows) => {
      if (!mounted) return;
      setOptions(rows);
      setSelected(rows.filter((option) => option.isPrimary).map((option) => option.slug));
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const primary = useMemo(() => options.filter((option) => option.isPrimary), [options]);
  const network = useMemo(() => options.filter((option) => !option.isPrimary), [options]);
  const selectedNetwork = useMemo(() => selected.filter((slug) => network.some((option) => option.slug === slug)), [selected, network]);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const togglePrimary = (slug: string) => {
    setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  };

  const applyNetwork = (networkSlugs: string[]) => {
    const primarySlugs = primary.filter((option) => selected.includes(option.slug)).map((option) => option.slug);
    setSelected([...new Set([...primarySlugs, ...networkSlugs])]);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('idle');
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setMessage('Geçerli bir e-posta adresi gir.');
      return;
    }
    if (selected.length === 0) {
      setStatus('error');
      setMessage('En az bir bülten seçmelisin.');
      return;
    }
    if (!consent) {
      setStatus('error');
      setMessage('Bülten aboneliği için onay vermelisin.');
      return;
    }

    setSubmitting(true);
    const result = await subscribeNewsletters({ email, newsletters: selected, source, website });
    setSubmitting(false);
    setStatus(result.success ? 'success' : 'error');
    setMessage(result.message);
    if (result.success) {
      setEmail('');
      setConsent(false);
      setWebsite('');
      setSelected(primary.map((option) => option.slug));
    }
  };

  if (status === 'success') {
    return (
      <div className={`${horizontal ? 'rounded-3xl px-6 py-6' : 'rounded-2xl p-5'} border-2 border-green-200 bg-green-50 ${className}`}>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rejimde-green text-white font-black shadow-btn shadow-rejimde-greenDark">✓</span>
          <div><p className="font-black text-green-800">Seçimin kaydedildi</p><p className="mt-1 text-xs font-bold leading-relaxed text-green-600">{message}</p></div>
        </div>
      </div>
    );
  }

  if (horizontal) {
    return (
      <section className={`overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-card ${className}`}>
        <div className="grid lg:grid-cols-2">
          <div className="relative flex items-center overflow-hidden border-b-2 border-gray-100 bg-gradient-to-br from-green-50 via-white to-blue-50 px-6 py-7 lg:border-b-0 lg:border-r-2 lg:px-8">
            <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-rejimde-yellow/20" />
            <div className="relative flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rejimde-green text-xl text-white shadow-btn shadow-rejimde-greenDark">✉</span>
              <div>
                <span className="inline-flex rounded-lg bg-rejimde-green/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rejimde-greenDark">Rejimde seçkileri</span>
                <h3 className="mt-3 text-xl font-black leading-snug text-gray-800 md:text-2xl">{title}</h3>
                <p className="mt-2 max-w-lg text-sm font-bold leading-relaxed text-gray-400">{description}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 py-7 lg:px-8">
            {loading ? <p className="mb-3 text-xs font-bold text-gray-400">Bültenler hazırlanıyor...</p> : (
              <div className="mb-3 flex flex-wrap gap-2">
                {primary.map((option) => {
                  const checked = selected.includes(option.slug);
                  return (
                    <label key={option.slug} className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-xs font-black transition ${checked ? 'border-rejimde-green bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-400'}`}>
                      <input className="sr-only" type="checkbox" checked={checked} onChange={() => togglePrimary(option.slug)} />
                      <span className="mr-1">{checked ? '✓' : '○'}</span>{option.name}
                    </label>
                  );
                })}
                {network.length > 0 && (
                  <button type="button" onClick={() => setModalOpen(true)} className="rounded-xl border-2 border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-[#173bdc] hover:border-blue-200">
                    hiposta. keşfet {selectedNetwork.length > 0 ? `+${selectedNetwork.length}` : ''}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={submit}>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-posta adresin" className="min-w-0 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-rejimde-blue focus:bg-white" required />
                <button type="submit" disabled={submitting || loading || selected.length === 0 || !consent} className="rounded-xl bg-rejimde-blue px-5 py-3 text-sm font-black text-white shadow-btn shadow-rejimde-blueDark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none">{submitting ? 'Kaydediliyor...' : 'Bültene Katıl'}</button>
              </div>
              <input type="text" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-px w-px opacity-0" />
            </form>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-[10px] font-bold leading-relaxed text-gray-400">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#58cc02]" />
              <span>Seçtiğim bültenleri e-posta ile almak istiyorum. <Link href="/privacy" className="text-rejimde-blue underline">KVKK ve Gizlilik</Link></span>
            </label>
            {status === 'error' && <p className="mt-2 text-xs font-bold text-red-500">{message}</p>}
          </div>
        </div>
        <HipostaNewsletterModal open={modalOpen} options={network} selected={selectedNetwork} onClose={closeModal} onApply={applyNetwork} />
      </section>
    );
  }

  return (
    <div className={`rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rejimde-green text-white shadow-btn shadow-rejimde-greenDark">✉</span>
        <div><h4 className="font-black text-gray-700">{title}</h4><p className="mt-1 text-xs font-bold leading-relaxed text-gray-400">{description}</p></div>
      </div>
      {!loading && primary.length > 0 && (
        <div className="mb-3 space-y-2">
          {primary.map((option) => {
            const checked = selected.includes(option.slug);
            return (
              <label key={option.slug} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-black ${checked ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
                <input className="sr-only" type="checkbox" checked={checked} onChange={() => togglePrimary(option.slug)} />
                <span>{checked ? '✓' : '○'}</span><span>{option.name}</span>
              </label>
            );
          })}
        </div>
      )}
      {network.length > 0 && <button type="button" onClick={() => setModalOpen(true)} className="mb-3 w-full rounded-xl border-2 border-blue-100 bg-blue-50 px-3 py-2.5 text-xs font-black text-[#173bdc]">hiposta. ile daha fazlasını keşfet {selectedNetwork.length > 0 ? `+${selectedNetwork.length}` : ''}</button>}
      <form onSubmit={submit} className="space-y-2">
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-posta adresin" className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-rejimde-blue" required />
        <button type="submit" disabled={submitting || loading || selected.length === 0 || !consent} className="w-full rounded-xl bg-rejimde-blue py-3 text-sm font-black text-white shadow-btn shadow-rejimde-blueDark disabled:bg-gray-300 disabled:shadow-none">{submitting ? 'Kaydediliyor...' : 'Abone Ol'}</button>
        <input type="text" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-px w-px opacity-0" />
      </form>
      <label className="mt-3 flex cursor-pointer items-start gap-2 text-[10px] font-bold leading-relaxed text-gray-400">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#58cc02]" />
        <span>Bültenleri e-posta ile almak istiyorum. <Link href="/privacy" className="text-rejimde-blue underline">KVKK ve Gizlilik</Link></span>
      </label>
      {status === 'error' && <p className="mt-2 text-xs font-bold text-red-500">{message}</p>}
      <HipostaNewsletterModal open={modalOpen} options={network} selected={selectedNetwork} onClose={closeModal} onApply={applyNetwork} />
    </div>
  );
}
