'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { HipostaNewsletterOption } from '@/lib/hiposta-newsletters';

type Props = {
  open: boolean;
  options: HipostaNewsletterOption[];
  selected: string[];
  onClose: () => void;
  onApply: (selected: string[]) => void;
};

export default function HipostaNewsletterModal({ open, options, selected, onClose, onApply }: Props) {
  const [draft, setDraft] = useState<string[]>(selected);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      setDraft(selected);
      setQuery('');
    }
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    return options.filter((option) => !normalized || [option.name, option.publicationName, option.description]
      .some((value) => value.toLocaleLowerCase('tr-TR').includes(normalized)));
  }, [options, query]);

  const groups = useMemo(() => {
    const map = new Map<string, HipostaNewsletterOption[]>();
    filtered.forEach((option) => map.set(option.publicationSlug, [...(map.get(option.publicationSlug) || []), option]));
    return Array.from(map.entries());
  }, [filtered]);

  if (!open || !mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483000] flex items-end justify-center bg-gray-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button className="absolute inset-0" aria-label="Kapat" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-[#f7f7f7] shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b-2 border-gray-200 bg-white px-5 py-5 sm:px-7">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-gray-800">hip<span className="text-[#173bdc]">o</span>sta<span className="text-[#ff6648]">.</span></span>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#173bdc]">Bülten ağı</span>
            </div>
            <p className="mt-1 text-xs font-bold text-gray-400">Diğer Hip Medya yayınlarından istediklerini ayrıca seç.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-gray-200 bg-white font-black text-gray-400 hover:border-gray-300 hover:text-gray-700">×</button>
        </div>

        <div className="border-b-2 border-gray-200 bg-white px-5 pb-5 sm:px-7">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Yayın veya bülten ara" className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-rejimde-blue" />
        </div>

        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map(([publicationSlug, newsletters]) => (
              <div key={publicationSlug} className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm">
                <div className="border-b-2 border-gray-100 px-4 py-3">
                  <p className="font-black text-gray-700">{newsletters[0]?.publicationName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{newsletters.length} aktif bülten</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {newsletters.map((option) => {
                    const checked = draft.includes(option.slug);
                    return (
                      <button key={option.slug} type="button" onClick={() => setDraft((current) => current.includes(option.slug) ? current.filter((slug) => slug !== option.slug) : [...current, option.slug])} className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-gray-50">
                        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-[10px] font-black ${checked ? 'border-[#173bdc] bg-[#173bdc] text-white' : 'border-gray-300 text-transparent'}`}>✓</span>
                        <span className="min-w-0">
                          <span className="block text-sm font-black text-gray-700">{option.name}</span>
                          {option.description && <span className="mt-1 block text-xs font-medium leading-relaxed text-gray-400">{option.description}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {groups.length === 0 && <p className="py-12 text-center text-sm font-bold text-gray-400">Aramana uygun aktif bülten bulunamadı.</p>}
        </div>

        <div className="flex flex-col gap-3 border-t-2 border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs font-bold text-gray-400">{draft.length} ek bülten seçili.</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-xs font-black text-gray-400 hover:bg-gray-100">Vazgeç</button>
            <button type="button" onClick={() => { onApply(draft); onClose(); }} className="rounded-xl bg-[#173bdc] px-6 py-2.5 text-xs font-black text-white shadow-btn shadow-blue-800">Seçimleri uygula</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
