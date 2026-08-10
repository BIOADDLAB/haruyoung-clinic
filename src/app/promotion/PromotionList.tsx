'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { fadeUp } from '@/lib/motion';
import { getPromotions } from '@/lib/promotions';
import { daysLeft, discountRate, type Promotion } from '@/types/promotion';

export default function PromotionList() {
    const [list, setList] = useState<Promotion[] | null>(null);
    const month = new Date().getMonth() + 1;

    useEffect(() => {
        let alive = true;
        getPromotions().then((all) => {
            // 마감일이 지난 항목은 감춘다. 관리자가 지우지 않아도 알아서 내려간다
            if (alive) setList(all.filter((p) => daysLeft(p.until) >= 0));
        });
        return () => {
            alive = false;
        };
    }, []);

    const from = list && list.length > 0 ? Math.min(...list.map((p) => p.price)) : 0;

    return (
        <div className="pb-28 lg:pb-24">
            <p className="px-6 pt-8 text-small font-semibold lg:pl-12 lg:pt-16">{month}월 promotion</p>

            {/* TODO: 프로모션 대표 이미지 확보 시 next/image 로 교체 */}
            <div
                role="img"
                aria-label="하루영의원 프로모션 대표 이미지"
                className="mt-9 flex aspect-[895/421] w-full max-w-[895px] items-center justify-center bg-[#d9d9d9] text-caption text-dark/50"
            >
                사진영역
            </div>

            <div className="px-6 lg:pl-12 lg:pr-0">
                <div className="w-full max-w-[800px]">
                    <h2 className="pt-16 text-22 font-bold">{month}월 promotion</h2>

                    {/* 최저가는 저장하지 않고 목록에서 계산한다 */}
                    <p className="pt-20 text-right">
                        <span className="text-24 font-bold">{from.toLocaleString()}원</span>
                        <span className="ml-1 text-small"> 부터~</span>
                    </p>
                    <p className="mt-2 text-right text-caption text-dark/55">VAT 별도</p>
                </div>
            </div>

            {list === null ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">불러오는 중…</p>
            ) : list.length === 0 ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">진행 중인 프로모션이 없습니다.</p>
            ) : (
                <RevealGroup as="ul" className="flex flex-col gap-4 px-6 pt-9 lg:pl-12 lg:pr-0">
                    {list.map((p) => (
                        <PromotionCard key={p.id} p={p} />
                    ))}
                </RevealGroup>
            )}
        </div>
    );
}

function PromotionCard({ p }: { p: Promotion }) {
    const { has, toggle } = useCart();
    const key = `promotion:${p.id}`;
    const on = has(key);
    const rate = discountRate(p);
    const left = daysLeft(p.until);

    return (
        <RevealItem as="li" variants={fadeUp} className="w-full max-w-[800px] rounded-lg border border-beige p-6">
            <h3 className="text-20 font-bold">{p.name}</h3>

            <div className="mt-4 flex items-baseline justify-between gap-6">
                <p className="text-small font-medium text-brown">{p.highlight}</p>
                <p className="shrink-0 text-caption text-dark/60">
                    ~{p.until} ({left === 0 ? '오늘 마감' : `${left}일 남음`})
                </p>
            </div>

            {p.description && (
                <p className="mt-6 whitespace-pre-line text-caption leading-[1.7] text-dark/85">{p.description}</p>
            )}

            <div className="mt-3 flex justify-end">
                <button
                    type="button"
                    onClick={() => toggle({ key, name: p.name, price: p.price, category: '프로모션' })}
                    aria-pressed={on}
                    aria-label={`${p.name} ${on ? '장바구니에서 빼기' : '장바구니에 담기'}`}
                    className="flex items-center transition-opacity duration-500 ease-brand hover:opacity-70"
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

                    {p.originPrice > p.price && (
                        <span className="ml-3 text-caption text-dark/45 line-through">
                            {p.originPrice.toLocaleString()}원
                        </span>
                    )}

                    <span className="ml-2 text-24 font-bold">{p.price.toLocaleString()}원</span>
                </button>
            </div>
        </RevealItem>
    );
}
