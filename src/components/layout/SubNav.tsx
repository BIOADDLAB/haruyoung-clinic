'use client';

import { Suspense, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { PROMOTION_SUB_NAV, TREATMENT_SUB_NAV } from '@/data/site';
import { getPromotionCategories } from '@/lib/promotionCategories';
import { localizedCategory, type PromotionCategory } from '@/types/promotion';

type NavHref = string | { pathname: '/promotion'; query?: { c: string } };

type NavItem = { key: string; href: NavHref; label: string };

function hrefKey(href: NavHref) {
    if (typeof href === 'string') return href;
    return href.query?.c ? `/promotion?c=${href.query.c}` : '/promotion';
}

/** 한국어는 prefix 가 없고, 영·중은 /en /zh 가 붙는다 */
function localizedHref(href: NavHref, locale: string) {
    const path = hrefKey(href);
    return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

function NavLists({ items, currentHref }: { items: NavItem[]; currentHref: string }) {
    const t = useTranslations('nav');
    const locale = useLocale() as Locale;
    const router = useRouter();
    const go = (href: NavHref) => router.push(localizedHref(href, locale));

    return (
        <>
            <nav
                aria-label={t('treatmentMenu')}
                className="fixed left-rail top-0 z-40 hidden h-dvh w-[277px] border-r border-dark/15 bg-cream lg:block"
            >
                <ul className="flex flex-col gap-[13px] pl-14 pt-[91px]">
                    {items.map((item) => {
                        const current = currentHref === hrefKey(item.href);
                        return (
                            <li key={hrefKey(item.href)}>
                                <NextLink
                                    href={localizedHref(item.href, locale)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        go(item.href);
                                    }}
                                    aria-current={current ? 'page' : undefined}
                                    className={`group relative inline-block pb-1.5 text-small transition-colors duration-500 ease-brand hover:text-dark ${
                                        current ? 'font-semibold text-dark' : 'text-dark/70'
                                    }`}
                                >
                                    {item.label}
                                    <span
                                        className={`absolute inset-x-0 bottom-0 h-px origin-left bg-dark transition-transform duration-500 ease-brand group-hover:scale-x-100 ${
                                            current ? 'scale-x-100' : 'scale-x-0'
                                        }`}
                                    />
                                </NextLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <nav
                aria-label={t('treatmentMenu')}
                className="fixed inset-x-0 top-16 z-40 h-12 border-b border-dark/10 bg-cream lg:hidden"
            >
                <ul className="flex h-full items-center gap-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {items.map((item) => {
                        const current = currentHref === hrefKey(item.href);
                        return (
                            <li key={hrefKey(item.href)} className="shrink-0">
                                <NextLink
                                    href={localizedHref(item.href, locale)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        go(item.href);
                                    }}
                                    aria-current={current ? 'page' : undefined}
                                    className={`whitespace-nowrap text-caption ${
                                        current ? 'border-b border-dark pb-1 font-semibold text-dark' : 'text-dark/60'
                                    }`}
                                >
                                    {item.label}
                                </NextLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
}

function TreatmentNav() {
    const t = useTranslations('nav');
    const pathname = usePathname();
    const items = TREATMENT_SUB_NAV.map((item) => ({
        key: item.key,
        href: item.href,
        label: t(item.key),
    }));

    return <NavLists items={items} currentHref={pathname} />;
}

function PromotionNav() {
    const t = useTranslations('nav');
    const locale = useLocale();
    const searchParams = useSearchParams();
    const selected = searchParams.get('c');
    const [categories, setCategories] = useState<PromotionCategory[]>([]);

    useEffect(() => {
        let alive = true;
        getPromotionCategories().then((cats) => {
            if (alive) setCategories(cats);
        });
        return () => {
            alive = false;
        };
    }, []);

    const items: NavItem[] = [
        { key: 'subPromotion', href: '/promotion', label: t('subPromotion') },
        ...categories.map((c) => ({
            key: c.id,
            href: { pathname: '/promotion' as const, query: { c: c.id } },
            label: localizedCategory(c, locale),
        })),
    ];
    const currentHref = selected ? `/promotion?c=${selected}` : '/promotion';

    return <NavLists items={items} currentHref={currentHref} />;
}

function BeforeAfterNav() {
    const t = useTranslations('nav');
    const tb = useTranslations('beforeAfter');
    const searchParams = useSearchParams();
    const selected = searchParams.get('c');

    const items: NavItem[] = [
        { key: 'all', href: '/before-after', label: tb('all') },
        ...TREATMENT_SUB_NAV.map((item) => ({
            key: item.key,
            href: `/before-after?c=${item.key}`,
            label: t(item.key),
        })),
    ];
    const currentHref = selected ? `/before-after?c=${selected}` : '/before-after';

    return <NavLists items={items} currentHref={currentHref} />;
}

export default function SubNav() {
    const pathname = usePathname();
    const t = useTranslations('nav');

    if (pathname === '/promotion') {
        return (
            <Suspense
                fallback={
                    <NavLists
                        items={PROMOTION_SUB_NAV.map((item) => ({
                            key: item.key,
                            href: item.href,
                            label: t(item.key),
                        }))}
                        currentHref="/promotion"
                    />
                }
            >
                <PromotionNav />
            </Suspense>
        );
    }

    if (pathname === '/before-after') {
        return (
            <Suspense
                fallback={
                    <NavLists
                        items={[{ key: 'all', href: '/before-after', label: t('beforeAfter') }]}
                        currentHref="/before-after"
                    />
                }
            >
                <BeforeAfterNav />
            </Suspense>
        );
    }

    return <TreatmentNav />;
}
