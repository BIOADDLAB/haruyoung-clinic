'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Banner from '@/components/ui/Banner';
import { MENU_CATEGORIES } from '@/constants/categories';
import { TREATMENT_BANNER } from '@/data/site';
import { DUR, EASE } from '@/lib/motion';
import { getBeforeAfterSetting } from '@/lib/settings';
import { useMounted } from '@/lib/useMounted';
import { type BeforeAfterItem } from '@/types/settings';

export default function BeforeAfterGallery() {
    const t = useTranslations('beforeAfter');
    const tn = useTranslations('nav');
    const tb = useTranslations('banner');
    const searchParams = useSearchParams();
    const selected = searchParams.get('c') ?? '';
    const reduced = useReducedMotion();
    const mounted = useMounted();
    const [items, setItems] = useState<BeforeAfterItem[] | null>(null);
    const [open, setOpen] = useState<BeforeAfterItem | null>(null);

    useEffect(() => {
        let alive = true;
        getBeforeAfterSetting().then((s) => {
            if (alive) setItems((s?.items ?? []).filter((item) => item.beforeUrl && item.afterUrl));
        });
        return () => {
            alive = false;
        };
    }, []);

    const visible = useMemo(() => {
        if (!items) return [];
        if (!selected) return items;
        return items.filter((item) => item.menuSlug === selected);
    }, [items, selected]);

    const groups = useMemo(() => {
        if (selected) {
            const cat = MENU_CATEGORIES.find((c) => c.slug === selected);
            return cat ? [{ slug: cat.slug, name: tn(cat.slug), items: visible }] : [];
        }
        return MENU_CATEGORIES.map((c) => ({
            slug: c.slug,
            name: tn(c.slug),
            items: visible.filter((item) => item.menuSlug === c.slug),
        })).filter((g) => g.items.length > 0);
    }, [selected, visible, tn]);

    useEffect(() => {
        if (!open) return;
        document.body.classList.add('overflow-hidden');
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.classList.remove('overflow-hidden');
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const headingEn = selected ? (TREATMENT_BANNER[selected]?.en ?? tn(selected)) : t('bannerEn');
    const headingKo = selected ? tb(selected) : tn('beforeAfter');

    return (
        <div className="pb-28 lg:pb-24">
            <Banner
                file={selected ? (TREATMENT_BANNER[selected]?.file ?? 'bg-tre-01') : 'bg-tre-01'}
                en={headingEn}
                ko={headingKo === headingEn ? undefined : headingKo}
            />

            {items === null ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">{t('loading')}</p>
            ) : visible.length === 0 ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">{t('empty')}</p>
            ) : (
                <div className="px-6 pt-12 lg:pl-12 lg:pr-0">
                    {groups.map((g) => (
                        <section key={g.slug} className="mt-12 first:mt-0">
                            {!selected && <h2 className="text-20 font-bold lg:text-22">{g.name}</h2>}
                            <ul className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-[800px] ${selected ? '' : 'mt-6'}`}>
                                {g.items.map((item) => (
                                    <li key={`${item.menuSlug}-${item.beforeUrl}`}>
                                        <button
                                            type="button"
                                            onClick={() => setOpen(item)}
                                            className="group w-full text-left"
                                        >
                                            <div className="grid grid-cols-2 gap-1.5 overflow-hidden">
                                                <PairShot src={item.beforeUrl} label={t('before')} />
                                                <PairShot src={item.afterUrl} label={t('after')} />
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}

            {mounted &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-label={t('bannerEn')}
                                initial={reduced ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: DUR.fast, ease: EASE }}
                                onClick={() => setOpen(null)}
                                className="fixed inset-0 z-70 flex items-center justify-center bg-dark/80 px-4 py-10 backdrop-blur-sm"
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="grid w-full max-w-[960px] grid-cols-1 gap-3 sm:grid-cols-2"
                                >
                                    <PairShot src={open.beforeUrl} label={t('before')} />
                                    <PairShot src={open.afterUrl} label={t('after')} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    );
}

function PairShot({ src, label }: { src: string; label: string }) {
    return (
        <span className="relative block overflow-hidden bg-sand">
            <span className="relative block aspect-square">
                <Image src={src} alt="" fill unoptimized sizes="(min-width:1024px) 400px, 50vw" className="object-cover" />
            </span>
            <span className="absolute bottom-2 left-2 font-display text-caption-sm tracking-[0.08em] text-cream [text-shadow:0_1px_8px_rgba(59,43,30,0.55)]">
                {label}
            </span>
        </span>
    );
}
