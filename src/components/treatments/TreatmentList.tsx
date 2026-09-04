'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import Banner from '@/components/ui/Banner';
import { TREATMENT_BANNER } from '@/data/site';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import TreatmentPrice from '@/components/treatments/TreatmentPrice';
import { fadeUp } from '@/lib/motion';
import { getProducts } from '@/lib/products';
import { isProductVisible, localized, type Locale, type Product } from '@/types/product';

export default function TreatmentList({ slug, categoryName }: { slug: string; categoryName: string }) {
    const t = useTranslations('treatments');
    const locale = useLocale() as Locale;
    const tb = useTranslations('banner');
    const [list, setList] = useState<Product[] | null>(null);

    useEffect(() => {
        let alive = true;
        getProducts().then((all) => {
            if (alive) {
                // locales 가 비어 있으면 모든 언어에 노출한다
                setList(
                    all.filter(
                        (p) =>
                            isProductVisible(p) &&
                            p.menuSlug === slug &&
                            (!p.locales?.length || p.locales.includes(locale)),
                    ),
                );
            }
        });
        return () => {
            alive = false;
        };
    }, [slug, locale]);

    /** 섹션 제목(subCategory) 한국어 값으로만 묶는다. 번역은 표시에만 쓴다 */
    const groups = useMemo(() => {
        if (!list) return [];
        const bySub = new Map<string, Product[]>();
        list.forEach((p) => {
            const sub = p.subCategory || '';
            if (!bySub.has(sub)) bySub.set(sub, []);
            bySub.get(sub)!.push(p);
        });
        return Array.from(bySub, ([sub, items]) => ({
            sub,
            label: items.map((p) => localized(p, 'subCategory', locale)).find(Boolean) || sub,
            items,
        }));
    }, [list, locale]);

    const bannerEn = TREATMENT_BANNER[slug]?.en ?? categoryName;
    const bannerKo = tb(slug);
    const jumps = groups.filter((g) => g.sub);

    const goTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="pb-28 lg:pb-24">
            <Banner
                file={TREATMENT_BANNER[slug]?.file ?? 'bg-tre-01'}
                en={bannerEn}
                // Zero Aging Project 처럼 영문·한글 표기가 같은 카테고리는 한 줄만 보여준다
                ko={bannerKo === bannerEn ? undefined : bannerKo}
            />

            {list === null ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">{t('loading')}</p>
            ) : list.length === 0 ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">{t('empty')}</p>
            ) : (
                <div className="px-6 lg:pl-12 lg:pr-0">
                    {jumps.length > 1 && (
                        <nav
                            aria-label={t('sections')}
                            className="-mx-6 mt-8 flex gap-x-0 overflow-x-auto px-6 [scrollbar-width:none] lg:mx-0 lg:mt-10 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden"
                        >
                            {jumps.map((g, i) => (
                                <span key={g.sub} className="flex shrink-0 items-center">
                                    {i > 0 && (
                                        <span aria-hidden="true" className="px-2.5 text-caption text-dark/25">
                                            |
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => goTo(`section-${i}`)}
                                        className="whitespace-nowrap text-caption text-dark/70 transition-colors duration-500 ease-brand hover:text-dark"
                                    >
                                        {g.label}
                                    </button>
                                </span>
                            ))}
                        </nav>
                    )}

                    {groups.map((g) => {
                        const jumpIndex = jumps.findIndex((j) => j.sub === g.sub);
                        return (
                        <section
                            key={g.sub || 'none'}
                            id={jumpIndex >= 0 ? `section-${jumpIndex}` : undefined}
                            className="scroll-mt-32 pt-14 lg:scroll-mt-10"
                        >
                            {g.sub && (
                                <h2 className="w-full max-w-[800px] border-b border-dark/15 pb-3 text-20 font-bold lg:text-22">
                                    {g.label}
                                </h2>
                            )}

                            <RevealGroup as="ul" className="mt-6 flex flex-col gap-4">
                                {g.items.map((p) => (
                                    <RevealItem
                                        as="li"
                                        key={p.id}
                                        variants={fadeUp}
                                        className="w-full max-w-[800px] rounded-lg border border-beige p-5 lg:p-6"
                                    >
                                        <h4 className="whitespace-pre-line text-18 font-bold lg:text-20">
                                            {localized(p, 'name', locale)}
                                        </h4>

                                        {localized(p, 'highlight', locale) && (
                                            <p className="mt-2 text-small font-medium text-brown">
                                                {localized(p, 'highlight', locale)}
                                            </p>
                                        )}

                                        {localized(p, 'description', locale) && (
                                            <p className="mt-6 whitespace-pre-line text-caption leading-[1.7] text-dark/85">
                                                {localized(p, 'description', locale)}
                                            </p>
                                        )}

                                        <div className="mt-3 flex justify-end">
                                            <TreatmentPrice product={p} locale={locale} />
                                        </div>
                                    </RevealItem>
                                ))}
                            </RevealGroup>
                        </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
