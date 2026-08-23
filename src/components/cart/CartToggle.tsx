'use client';

import { useTranslations } from 'next-intl';
import { useCart } from './CartProvider';
import type { CartItem } from '@/types/reservation';

/** 시술·프로모션 카드 우하단의 체크박스 + 가격 */
export default function CartToggle({
    item,
    origin,
    caption,
}: {
    item: CartItem;
    origin?: number;
    /** 회차처럼 가격 앞에 붙일 짧은 라벨. 예: 1회 50,000원 */
    caption?: string;
}) {
    const t = useTranslations('cart');
    const { has, toggle } = useCart();
    const on = has(item.key);
    const rate = origin && origin > item.price ? Math.round((1 - item.price / origin) * 100) : 0;

    return (
        <button
            type="button"
            onClick={() => toggle(item)}
            aria-pressed={on}
            aria-label={`${item.name} ${on ? t('remove') : t('add')}`}
            className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 transition-opacity duration-500 ease-brand hover:opacity-70"
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

            {rate > 0 && <span className="text-caption font-bold text-brown">{rate}%</span>}
            {origin && origin > item.price && (
                <span className="text-caption text-dark/40 line-through">{origin.toLocaleString()}원</span>
            )}
            <span className="text-lead font-bold">
                {caption ? `${caption} ` : ''}
                {item.price.toLocaleString()}원
            </span>
        </button>
    );
}
