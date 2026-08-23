'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Banner from '@/components/ui/Banner';
import { useCart } from '@/components/cart/CartProvider';
import { PROMOTION_BANNER } from '@/data/site';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { fadeUp } from '@/lib/motion';
import { getPromotionCategories } from '@/lib/promotionCategories';
import { getPromotions } from '@/lib/promotions';
import { getPromotionBannerSetting } from '@/lib/settings';
import { localizedSetting, type PromotionBannerSetting } from '@/types/settings';
import {
    daysLeft,
    discountRate,
    localizedCategory,
    localizedOriginPrice,
    localizedPromo,
    localizedPromoPrice,
    type Promotion,
    type PromotionCategory,
} from '@/types/promotion';

export default function PromotionList() {
    return (
        <Suspense fallback={null}>
            <PromotionListInner />
        </Suspense>
    );
}

function PromotionListInner() {
    const t = useTranslations('promotion');
    const tn = useTranslations('nav');
    const tt = useTranslations('treatments');
    const ta = useTranslations('a11y');
    const [list, setList] = useState<Promotion[] | null>(null);
    const [categories, setCategories] = useState<PromotionCategory[]>([]);
    const [banner, setBanner] = useState<PromotionBannerSetting | null>(null);
    const locale = useLocale() as 'ko' | 'en' | 'zh';
    const searchParams = useSearchParams();
    const menu = searchParams.get('c') ?? '';

    // 배너 문구는 관리자 > 프로모션 배너 설정 값이 있으면 그걸 쓰고, 없으면 site.ts 기본값이다
    useEffect(() => {
        let alive = true;
        getPromotionBannerSetting().then((s) => {
            if (alive) setBanner(s);
        });
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        let alive = true;
        Promise.all([getPromotions(), getPromotionCategories()]).then(([all, cats]) => {
            // 마감일이 지난 항목은 감춘다. 관리자가 지우지 않아도 알아서 내려간다
            if (!alive) return;
            setList(
                all.filter(
                    (p) =>
                        (p.isOngoing || daysLeft(p.until) >= 0) &&
                        (!p.locales?.length || p.locales.includes(locale)),
                ),
            );
            setCategories(cats);
        });
        return () => {
            alive = false;
        };
    }, [locale]);

    const selected = categories.find((c) => c.id === menu);
    const visible = useMemo(() => {
        if (!list) return [];
        if (!menu) return list;
        return list.filter((p) => p.categoryId === menu);
    }, [list, menu]);

    const from = visible.length > 0 ? Math.min(...visible.map((p) => localizedPromoPrice(p, locale))) : 0;
    const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
    const heading = selected ? localizedCategory(selected, locale) : tn('subPromotion');

    return (
        <div className="pb-28 lg:pb-24">
            <Banner
                file={PROMOTION_BANNER.file}
                logo={PROMOTION_BANNER.logo}
                logoAlt={ta('logo')}
                en={banner ? localizedSetting(banner, 'title', locale) : PROMOTION_BANNER.title}
                ko={banner ? localizedSetting(banner, 'subtitle', locale) : PROMOTION_BANNER.subtitle}
                tall
            />

            <div className="px-6 lg:pl-12 lg:pr-0">
                <div className="w-full max-w-[800px]">
                    <h2 className="pt-12 text-20 font-bold lg:pt-16 lg:text-22">{heading}</h2>

                    {/* 최저가는 저장하지 않고 목록에서 계산한다 */}
                    <p className="pt-10 text-right lg:pt-20">
                        <span className="text-20 font-bold lg:text-24">{from.toLocaleString()}원</span>
                        <span className="ml-1 text-small">{t('from')}</span>
                    </p>
                    <p className="mt-2 text-right text-caption text-dark/55">{tt('vat')}</p>
                </div>
            </div>

            {list === null ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">{tt('loading')}</p>
            ) : visible.length === 0 ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">{t('empty')}</p>
            ) : (
                <RevealGroup as="ul" className="flex flex-col gap-4 px-6 pt-9 lg:pl-12 lg:pr-0">
                    {visible.map((p) => {
                        const category = p.categoryId ? categoryById.get(p.categoryId) : undefined;
                        return (
                            <PromotionCard
                                key={p.id}
                                p={p}
                                categoryName={category ? localizedCategory(category, locale) : t('uncategorized')}
                            />
                        );
                    })}
                </RevealGroup>
            )}
        </div>
    );
}

function PromotionCard({ p, categoryName }: { p: Promotion; categoryName: string }) {
    const locale = useLocale() as 'ko' | 'en' | 'zh';
    const { has, toggle } = useCart();
    const t = useTranslations('promotion');
    const tc = useTranslations('cart');
    const key = `promotion:${p.id}`;
    const on = has(key);
    // 언어별 가격이 있으면 그 값으로 할인율을 다시 계산한다
    const rate = discountRate({
        originPrice: localizedOriginPrice(p, locale),
        price: localizedPromoPrice(p, locale),
    });
    const left = p.isOngoing ? null : daysLeft(p.until);

    return (
        <RevealItem
            as="li"
            variants={fadeUp}
            className="w-full max-w-[800px] rounded-lg border border-beige p-5 lg:p-6"
        >
            <h3 className="text-18 font-bold lg:text-20">{localizedPromo(p, 'name', locale)}</h3>

            {p.highlight && (
                <p className="mt-4 text-small font-medium text-brown">{localizedPromo(p, 'highlight', locale)}</p>
            )}

            {p.description && (
                <p className="mt-6 whitespace-pre-line text-caption leading-[1.7] text-dark/85">
                    {localizedPromo(p, 'description', locale)}
                </p>
            )}

            <div className="mt-4 flex flex-col items-end lg:mt-3">
                <p className="mb-1.5 text-caption text-dark/60">
                    {left === null
                        ? t('ongoing')
                        : `~${p.until} (${left === 0 ? t('today') : t('daysLeft', { days: left })})`}
                </p>
                <button
                    type="button"
                    onClick={() =>
                        toggle({
                            key,
                            name: localizedPromo(p, 'name', locale),
                            price: localizedPromoPrice(p, locale),
                            category: categoryName,
                            originPrice: localizedOriginPrice(p, locale),
                            description: localizedPromo(p, 'description', locale),
                        })
                    }
                    aria-pressed={on}
                    aria-label={`${localizedPromo(p, 'name', locale)} ${on ? tc('remove') : tc('add')}`}
                    className="flex flex-wrap items-center justify-end gap-y-1 transition-opacity duration-500 ease-brand hover:opacity-70"
                >
                    <span
                        aria-hidden="true"
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border transition-colors duration-500 ease-brand ${
                            on ? 'border-dark bg-dark' : 'border-dark/40'
                        }`}
                    >
                        {on && (
                            <svg
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-2 w-2 text-cream"
                            >
                                <path d="M1 6l3.5 3.5L11 2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </span>

                    {rate > 0 && (
                        <span className="ml-[15px] flex h-6 items-center rounded-full bg-dark px-3 text-caption-sm font-semibold text-cream">
                            {rate}%
                        </span>
                    )}

                    {localizedOriginPrice(p, locale) > localizedPromoPrice(p, locale) && (
                        <span className="ml-3 text-caption text-dark/45 line-through">
                            {localizedOriginPrice(p, locale).toLocaleString()}원
                        </span>
                    )}

                    <span className="ml-2 text-20 font-bold lg:text-24">
                        {localizedPromoPrice(p, locale).toLocaleString()}원
                    </span>
                </button>
            </div>
        </RevealItem>
    );
}
