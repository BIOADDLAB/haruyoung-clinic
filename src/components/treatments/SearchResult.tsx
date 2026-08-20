'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import CartToggle from '@/components/cart/CartToggle';
import { MENU_CATEGORIES } from '@/constants/categories';
import { getProducts } from '@/lib/products';
import { localized, localizedPrice, type Locale, type Product } from '@/types/product';
import { Link } from '@/i18n/navigation';

type SearchHit = {
    product: Product;
    name: string;
    highlight: string;
    description: string;
    menuCategory: string;
    subCategory: string;
    price: number | null;
};

type MenuCategorySlug = (typeof MENU_CATEGORIES)[number]['slug'];

const MENU_CATEGORY_SLUGS = new Set<string>(MENU_CATEGORIES.map(({ slug }) => slug));

const normalizeSearchText = (value: string) => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();

/** 헤더 바로검색이 /treatments?q= 로 보낸 결과를 보여준다 */
export default function SearchResult({ keyword }: { keyword: string }) {
    const t = useTranslations('search');
    const tt = useTranslations('treatments');
    const tb = useTranslations('banner');
    const locale = useLocale() as Locale;
    const [all, setAll] = useState<Product[] | null>(null);

    useEffect(() => {
        let alive = true;
        getProducts().then((data) => {
            if (alive) setAll(data);
        });
        return () => {
            alive = false;
        };
    }, []);

    const hits = useMemo<SearchHit[]>(() => {
        if (!all || !keyword.trim()) return [];
        const query = normalizeSearchText(keyword);

        return all.flatMap((product) => {
            if (product.locales?.length && !product.locales.includes(locale)) return [];

            const name = localized(product, 'name', locale);
            const highlight = localized(product, 'highlight', locale);
            const description = localized(product, 'description', locale);
            const menuCategory = MENU_CATEGORY_SLUGS.has(product.menuSlug)
                ? tb(product.menuSlug as MenuCategorySlug)
                : product.menuCategory;
            const searchText = normalizeSearchText(
                [menuCategory, product.subCategory, name, highlight, description].filter(Boolean).join(' '),
            );

            if (!searchText.includes(query)) return [];

            return [
                {
                    product,
                    name,
                    highlight,
                    description,
                    menuCategory,
                    subCategory: product.subCategory,
                    price: localizedPrice(product, locale),
                },
            ];
        });
    }, [all, keyword, locale, tb]);

    return (
        <div className="px-6 pb-28 pt-8 lg:pb-24 lg:pl-12 lg:pr-0 lg:pt-16">
            <p className="text-small font-semibold">
                {keyword ? (
                    <>
                        {t('resultFor', { keyword })}
                        {all && (
                            <span className="ml-2 text-caption font-normal text-dark/55">
                                {t('count', { count: hits.length })}
                            </span>
                        )}
                    </>
                ) : (
                    t('title')
                )}
            </p>

            {!keyword ? (
                <p className="pt-16 text-caption text-dark/50">{t('prompt')}</p>
            ) : all === null ? (
                <p className="pt-16 text-caption text-dark/50">{t('loading')}</p>
            ) : hits.length === 0 ? (
                <p className="pt-16 text-caption text-dark/50">{t('empty')}</p>
            ) : (
                <ul className="flex flex-col gap-4 pt-9">
                    {hits.map(({ product, name, highlight, description, menuCategory, subCategory, price }) => (
                        <li key={product.id} className="w-full max-w-[800px] rounded-lg border border-beige p-5 lg:p-6">
                            <Link
                                href={`/treatments/${product.menuSlug}`}
                                className="text-caption-sm text-dark/50 transition-colors duration-500 ease-brand hover:text-brown"
                            >
                                {menuCategory}
                                {subCategory && ` · ${subCategory}`}
                            </Link>
                            <h2 className="mt-2 whitespace-pre-line text-18 font-bold lg:text-20">{name}</h2>

                            {highlight && <p className="mt-2 text-small font-medium text-brown">{highlight}</p>}

                            {description && (
                                <p className="mt-6 whitespace-pre-line text-caption leading-[1.7] text-dark/85">
                                    {description}
                                </p>
                            )}

                            <div className="mt-3 flex justify-end">
                                {price === null ? (
                                    <span className="text-caption text-dark/50">{tt('askPrice')}</span>
                                ) : (
                                    <CartToggle
                                        item={{
                                            key: `product:${product.id}`,
                                            name,
                                            price,
                                            category: menuCategory,
                                            description,
                                        }}
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
