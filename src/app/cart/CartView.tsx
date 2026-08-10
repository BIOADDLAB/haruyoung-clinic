'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import ReservationForm from '@/components/reservation/ReservationForm';
import { useMounted } from '@/lib/useMounted';

export default function CartView() {
    const { items, remove } = useCart();
    const mounted = useMounted();
    const [picked, setPicked] = useState<string[]>([]);

    const allOn = items.length > 0 && picked.length === items.length;
    const pickedItems = items.filter((i) => picked.includes(i.key));
    const pickedTotal = pickedItems.reduce((sum, i) => sum + i.price, 0);

    // 담은 시점의 정가 합계. 아낀 금액을 보여주는 데 쓴다
    const pickedOrigin = pickedItems.reduce((sum, i) => sum + (i.originPrice ?? i.price), 0);
    const saved = pickedOrigin - pickedTotal;

    const toggle = (key: string) =>
        setPicked((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));

    if (!mounted) return <div className="w-full max-w-[800px]" />;

    return (
        <div className="w-full max-w-[800px]">
            {/* 상단 컨트롤 */}
            <div className="flex items-center justify-between border-b border-beige pb-5">
                <Check
                    checked={allOn}
                    onChange={() => setPicked(allOn ? [] : items.map((i) => i.key))}
                    label={`전체 선택  ${picked.length}/${items.length}`}
                />
                <button
                    type="button"
                    onClick={() => {
                        remove(picked);
                        setPicked([]);
                    }}
                    disabled={picked.length === 0}
                    className="text-caption text-dark/50 transition-colors duration-500 ease-brand hover:text-dark disabled:opacity-30"
                >
                    선택 삭제
                </button>
            </div>

            {/* 장바구니 목록 */}
            {items.length === 0 ? (
                <div className="mt-8 rounded-xl border border-beige bg-dark/[0.02] px-6 py-20 text-center">
                    <p className="text-caption text-dark/55">장바구니가 비어 있습니다.</p>
                    <Link href="/promotion" className="mt-6 inline-block text-caption font-semibold tracking-wide">
                        <span className="border-b border-dark/70 pb-0.5 transition-colors duration-500 ease-brand hover:border-dark">
                            시술 둘러보기
                        </span>
                    </Link>
                </div>
            ) : (
                <ul className="mt-6 flex flex-col gap-3">
                    {items.map((i) => {
                        const isPicked = picked.includes(i.key);
                        // 프로모션은 담을 때 정가를 함께 넣는다. 할인율은 저장하지 않고 매번 계산한다
                        const origin = i.originPrice ?? 0;
                        const rate = origin > i.price ? Math.round((1 - i.price / origin) * 100) : 0;

                        return (
                            <li
                                key={i.key}
                                className={`rounded-xl border p-6 transition-all duration-500 ease-brand ${
                                    isPicked
                                        ? 'border-dark/25 bg-dark/[0.03]'
                                        : 'border-beige bg-transparent hover:border-dark/15'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-caption-sm tracking-wide text-dark/45">{i.category}</p>
                                        <h2 className="mt-1.5 text-18 font-semibold leading-snug sm:text-20">
                                            {i.name}
                                        </h2>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                                        {rate > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-6 items-center rounded-full bg-dark px-3 text-caption-sm font-semibold text-cream">
                                                    {rate}%
                                                </span>
                                                <span className="text-caption text-dark/45 line-through">
                                                    {origin.toLocaleString()}원
                                                </span>
                                            </div>
                                        )}

                                        <Check
                                            checked={isPicked}
                                            onChange={() => toggle(i.key)}
                                            label={`${i.price.toLocaleString()}원`}
                                            strong
                                        />
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <p className="mt-5 text-right text-caption-sm text-dark/45">VAT 별도</p>

            {/* 다른 상품 추가 */}
            <Link
                href="/promotion"
                className="mt-6 block rounded-xl border border-beige bg-dark/[0.03] py-4 text-center text-caption tracking-wide transition-colors duration-500 ease-brand hover:bg-dark/[0.06]"
            >
                다른 상품 추가하기
            </Link>

            {/* 선택 요약 */}
            <section className="mt-14">
                <h2 className="text-small font-semibold tracking-wide">선택한 상품 정보</h2>

                <div className="mt-5 rounded-xl border border-beige bg-dark/[0.02] px-6 py-6">
                    <dl className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <dt className="text-caption text-dark/60">선택한 시술 개수</dt>
                            <dd className="text-caption font-medium">{pickedItems.length}개</dd>
                        </div>

                        {saved > 0 && (
                            <div className="flex items-center justify-between">
                                <dt className="text-caption text-dark/60">할인 금액</dt>
                                <dd className="text-caption font-medium text-brown">-{saved.toLocaleString()}원</dd>
                            </div>
                        )}

                        <div className="flex items-end justify-between border-t border-beige pt-4">
                            <dt className="text-caption font-semibold">총 결제 예상 금액</dt>
                            <dd className="text-22 font-bold tracking-tight">
                                {pickedTotal.toLocaleString()}
                                <span className="ml-0.5 text-16 font-semibold">원</span>
                            </dd>
                        </div>
                    </dl>
                    <p className="mt-4 text-right text-caption-sm text-dark/45">* 결제는 내원 후 진행해 주세요.</p>
                </div>
            </section>

            {/* 예약 폼 */}
            <div className="mt-14">
                <ReservationForm />
            </div>
        </div>
    );
}

function Check({
    checked,
    onChange,
    label,
    strong,
}: {
    checked: boolean;
    onChange: () => void;
    label: string;
    strong?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            aria-pressed={checked}
            className="group flex shrink-0 items-center gap-3"
        >
            <span
                aria-hidden="true"
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-all duration-500 ease-brand ${
                    checked ? 'border-dark bg-dark' : 'border-dark/35 group-hover:border-dark/60'
                }`}
            >
                {checked && (
                    <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-2.5 w-2.5 text-cream"
                    >
                        <path d="M1.5 6l3.2 3.2L10.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>
            <span
                className={
                    strong ? 'text-18 font-bold tracking-tight sm:text-20' : 'text-caption font-medium tracking-wide'
                }
            >
                {label}
            </span>
        </button>
    );
}
