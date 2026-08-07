'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import ReservationForm from '@/components/reservation/ReservationForm';

export default function CartView() {
    const { items, remove } = useCart();
    const [picked, setPicked] = useState<string[]>([]);

    const allOn = items.length > 0 && picked.length === items.length;
    const pickedItems = items.filter((i) => picked.includes(i.key));
    const pickedTotal = pickedItems.reduce((sum, i) => sum + i.price, 0);

    const toggle = (key: string) =>
        setPicked((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));

    return (
        <div className="w-full max-w-[800px]">
            <div className="flex items-center justify-between">
                <Check
                    checked={allOn}
                    onChange={() => setPicked(allOn ? [] : items.map((i) => i.key))}
                    label={`전체 선택 (${picked.length}/${items.length})`}
                />
                <button
                    type="button"
                    onClick={() => {
                        remove(picked);
                        setPicked([]);
                    }}
                    disabled={picked.length === 0}
                    className="text-caption text-dark/60 transition-colors duration-500 ease-brand hover:text-dark disabled:opacity-30"
                >
                    선택 삭제
                </button>
            </div>

            {items.length === 0 ? (
                <div className="mt-10 border border-beige px-6 py-16 text-center">
                    <p className="text-caption text-dark/60">장바구니가 비어 있습니다.</p>
                    <Link href="/promotion" className="mt-5 inline-block text-caption font-semibold">
                        <span className="border-b border-dark pb-0.5">시술 둘러보기</span>
                    </Link>
                </div>
            ) : (
                <ul className="mt-5 flex flex-col gap-4">
                    {items.map((i) => (
                        <li key={i.key} className="border border-beige p-6">
                            <p className="text-caption-sm text-dark/50">{i.category}</p>
                            <h2 className="mt-2 text-20 font-bold">{i.name}</h2>
                            <div className="mt-6 flex justify-end">
                                <Check
                                    checked={picked.includes(i.key)}
                                    onChange={() => toggle(i.key)}
                                    label={`${i.price.toLocaleString()}원`}
                                    strong
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <p className="mt-4 text-right text-caption-sm text-dark/55">VAT 별도</p>

            <Link
                href="/promotion"
                className="mt-6 block bg-dark/8 py-3.5 text-center text-caption transition-colors duration-500 ease-brand hover:bg-dark/15"
            >
                다른 상품 추가하기
            </Link>

            <h2 className="mt-12 text-small font-semibold">선택한 상품 정보</h2>
            <dl className="mt-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <dt className="text-caption font-semibold">선택한 시술 개수</dt>
                    <dd className="text-caption">{pickedItems.length} 개</dd>
                </div>
                <div className="flex items-center justify-between">
                    <dt className="text-caption font-semibold">총 결제 예상 금액</dt>
                    <dd className="text-20 font-bold">{pickedTotal.toLocaleString()}원</dd>
                </div>
            </dl>
            <p className="mt-2 text-right text-caption-sm text-dark/55">* 결제는 내원 후 진행해 주세요.</p>

            <div className="mt-12">
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
        <button type="button" onClick={onChange} aria-pressed={checked} className="flex items-center gap-3">
            <span
                aria-hidden="true"
                className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors duration-500 ease-brand ${
                    checked ? 'border-dark bg-dark' : 'border-dark/40'
                }`}
            >
                {checked && (
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
            <span className={strong ? 'text-22 font-bold' : 'text-caption font-semibold'}>{label}</span>
        </button>
    );
}
