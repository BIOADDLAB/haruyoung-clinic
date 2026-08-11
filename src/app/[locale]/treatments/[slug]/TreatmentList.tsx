'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import Banner from '@/components/ui/Banner';
import CartToggle from '@/components/cart/CartToggle';
import { TREATMENT_BANNER } from '@/data/site';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { fadeUp } from '@/lib/motion';
import { getProducts } from '@/lib/products';
import type { Product } from '@/types/product';

export default function TreatmentList({ slug, categoryName }: { slug: string; categoryName: string }) {
    const t = useTranslations('treatments');
    const tb = useTranslations('banner');
    const [list, setList] = useState<Product[] | null>(null);

    useEffect(() => {
        let alive = true;
        getProducts().then((all) => {
            if (alive) setList(all.filter((p) => p.menuSlug === slug));
        });
        return () => {
            alive = false;
        };
    }, [slug]);

    const sections = useMemo(() => {
        if (!list) return [];
        const byMain = new Map<string, Map<string, Product[]>>();
        list.forEach((p) => {
            const main = p.mainCategory || categoryName;
            const sub = p.subCategory || '';
            if (!byMain.has(main)) byMain.set(main, new Map());
            const bySub = byMain.get(main)!;
            if (!bySub.has(sub)) bySub.set(sub, []);
            bySub.get(sub)!.push(p);
        });
        return Array.from(byMain, ([main, bySub]) => ({
            main,
            groups: Array.from(bySub, ([sub, items]) => ({ sub, items })),
        }));
    }, [list, categoryName]);

    return (
        <div className="pb-28 lg:pb-24">
            <Banner
                file={TREATMENT_BANNER[slug]?.file ?? 'bg-tre-01'}
                en={TREATMENT_BANNER[slug]?.en ?? categoryName}
                ko={tb(slug)}
            />

            {list === null ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">{t('loading')}</p>
            ) : list.length === 0 ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">{t('empty')}</p>
            ) : (
                <div className="px-6 lg:pl-12 lg:pr-0">
                    {sections.map((section) => (
                        <section key={section.main} className="pt-14">
                            {sections.length > 1 && (
                                <h2 className="w-full max-w-[800px] border-b border-dark/15 pb-3 text-20 font-bold lg:text-22">
                                    {section.main}
                                </h2>
                            )}

                            {section.groups.map((g) => (
                                <div key={g.sub || 'none'} className="pt-9">
                                    {g.sub && <h3 className="text-small font-semibold text-brown">{g.sub}</h3>}

                                    <RevealGroup as="ul" className="mt-4 flex flex-col gap-4">
                                        {g.items.map((p) => (
                                            <RevealItem
                                                as="li"
                                                key={p.id}
                                                variants={fadeUp}
                                                className="w-full max-w-[800px] rounded-lg border border-beige p-5 lg:p-6"
                                            >
                                                <h4 className="whitespace-pre-line text-18 font-bold lg:text-20">
                                                    {p.name}
                                                </h4>

                                                {p.highlight && (
                                                    <p className="mt-2 text-small font-medium text-brown">
                                                        {p.highlight}
                                                    </p>
                                                )}

                                                {p.description && (
                                                    <p className="mt-6 whitespace-pre-line text-caption leading-[1.7] text-dark/85">
                                                        {p.description}
                                                    </p>
                                                )}

                                                <div className="mt-3 flex justify-end">
                                                    {p.price === null ? (
                                                        <span className="text-caption text-dark/50">
                                                            {t('askPrice')}
                                                        </span>
                                                    ) : (
                                                        <CartToggle
                                                            item={{
                                                                key: `product:${p.id}`,
                                                                name: p.name,
                                                                price: p.price,
                                                                category: p.menuCategory,
                                                                description: p.description,
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </RevealItem>
                                        ))}
                                    </RevealGroup>
                                </div>
                            ))}
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
