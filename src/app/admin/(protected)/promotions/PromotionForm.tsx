'use client';

import { useState } from 'react';
import { addPromotion, updatePromotion } from '@/lib/promotions';
import { discountRate, type Promotion } from '@/types/promotion';

const inputBase =
    'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10';

export default function PromotionForm({
    initial,
    onSaved,
    onCancel,
}: {
    initial?: Promotion;
    onSaved?: () => void;
    onCancel?: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [highlight, setHighlight] = useState(initial?.highlight ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [originPrice, setOriginPrice] = useState(initial?.originPrice?.toString() ?? '');
    const [price, setPrice] = useState(initial?.price?.toString() ?? '');
    const [until, setUntil] = useState(initial?.until ?? '');
    const [busy, setBusy] = useState(false);

    const rate = discountRate({ originPrice: Number(originPrice) || 0, price: Number(price) || 0 });

    const submit = async () => {
        if (!name.trim()) return alert('시술명을 입력하세요.');
        if (!price) return alert('판매가를 입력하세요.');
        if (!until) return alert('마감일을 입력하세요.');

        setBusy(true);
        try {
            const data = {
                name,
                highlight,
                description,
                originPrice: Number(originPrice) || Number(price),
                price: Number(price),
                until,
                order: initial?.order ?? Date.now(),
            };
            if (initial) await updatePromotion(initial.id, data);
            else await addPromotion(data);
            onSaved?.();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-[#3a322c] sm:text-2xl">
                    {initial ? '프로모션 수정' : '프로모션 추가'}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">마감일이 지나면 사이트에서 자동으로 내려갑니다.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="space-y-6 p-6 sm:p-8">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            시술명 <span className="text-rose-500">*</span>
                        </span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 울쎄라 300샷 + 써마지 300샷"
                            className={inputBase}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            부제 <span className="font-normal text-neutral-400">(선택)</span>
                        </span>
                        <input
                            value={highlight}
                            onChange={(e) => setHighlight(e.target.value)}
                            placeholder="예: 선 - 페이스라인 탄력케어"
                            className={inputBase}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            설명 <span className="font-normal text-neutral-400">(선택)</span>
                        </span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className={`${inputBase} resize-none`}
                        />
                    </label>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                정가 <span className="font-normal text-neutral-400">(할인 없으면 비움)</span>
                            </span>
                            <input
                                type="number"
                                value={originPrice}
                                onChange={(e) => setOriginPrice(e.target.value)}
                                placeholder="2700000"
                                className={inputBase}
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                판매가 <span className="text-rose-500">*</span>
                            </span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="2200000"
                                className={inputBase}
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                마감일 <span className="text-rose-500">*</span>
                            </span>
                            <input
                                type="date"
                                value={until}
                                onChange={(e) => setUntil(e.target.value)}
                                className={inputBase}
                            />
                        </label>
                    </div>

                    {rate > 0 && <p className="text-sm text-neutral-500">화면에 {rate}% 할인으로 표시됩니다.</p>}
                </div>

                <div className="flex flex-col-reverse gap-2.5 border-t border-black/[0.04] bg-neutral-50/50 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                    <button
                        type="button"
                        onClick={() => onCancel?.()}
                        className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy}
                        className="rounded-xl bg-[#3a322c] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#2d2621] disabled:opacity-50"
                    >
                        {busy ? '저장 중…' : initial ? '수정 저장' : '추가하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}
