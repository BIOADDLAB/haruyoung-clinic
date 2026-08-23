'use client';

import { useEffect, useState } from 'react';
import { formatPriceInput, parsePriceInput } from '@/lib/price';
import { addPromotion, updatePromotion } from '@/lib/promotions';
import { discountRate, type Promotion, type PromotionCategory } from '@/types/promotion';

const inputBase =
    'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10';

export default function PromotionForm({
    initial,
    categories,
    defaultCategoryId,
    onSaved,
    onCancel,
}: {
    initial?: Promotion;
    categories: PromotionCategory[];
    /** 목록 탭에서 고른 카테고리. 새 상품을 그 탭에 바로 넣는다 */
    defaultCategoryId?: string;
    onSaved?: () => void;
    onCancel?: () => void;
}) {
    /**
     * 언어별 입력값을 한 덩어리로 관리한다.
     * 상태를 9개로 흩어 놓으면 탭을 바꿀 때마다 어느 값을 읽는지 놓치기 쉽다.
     */
    const [text, setText] = useState({
        ko: {
            name: initial?.name ?? '',
            highlight: initial?.highlight ?? '',
            description: initial?.description ?? '',
        },
        en: {
            name: initial?.nameEn ?? '',
            highlight: initial?.highlightEn ?? '',
            description: initial?.descriptionEn ?? '',
        },
        zh: {
            name: initial?.nameZh ?? '',
            highlight: initial?.highlightZh ?? '',
            description: initial?.descriptionZh ?? '',
        },
    });

    const [lang, setLang] = useState<'ko' | 'en' | 'zh'>('ko');

    const setField = (field: 'name' | 'highlight' | 'description', v: string) =>
        setText((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: v } }));

    /** 각 언어에 입력된 게 하나라도 있는지. 탭에 점으로 표시한다 */
    const filled = (l: 'ko' | 'en' | 'zh') =>
        Boolean(text[l].name.trim() || text[l].highlight.trim() || text[l].description.trim());
    /** 언어별 가격. 비우면 한국어 가격을 쓴다 */
    const [originBy, setOriginBy] = useState({
        ko: formatPriceInput(initial?.originPrice),
        en: formatPriceInput(initial?.originPriceEn),
        zh: formatPriceInput(initial?.originPriceZh),
    });
    const [priceBy, setPriceBy] = useState({
        ko: formatPriceInput(initial?.price),
        en: formatPriceInput(initial?.priceEn),
        zh: formatPriceInput(initial?.priceZh),
    });
    const [until, setUntil] = useState(initial?.until ?? '');
    const [isOngoing, setIsOngoing] = useState(initial?.isOngoing ?? false);
    const [busy, setBusy] = useState(false);
    /** 노출 언어. 비어 있으면 모든 언어에 노출한다 */
    const [locales, setLocales] = useState<('ko' | 'en' | 'zh')[]>(initial?.locales ?? []);
    const [categoryId, setCategoryId] = useState(initial?.categoryId || defaultCategoryId || '');

    // 목록 탭을 바꾸면 새 상품의 카테고리를 따라간다. 수정 중에는 건드리지 않는다
    useEffect(() => {
        if (!initial) setCategoryId(defaultCategoryId || '');
    }, [defaultCategoryId, initial]);

    const toggleLocale = (l: 'ko' | 'en' | 'zh') =>
        setLocales((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));

    const rate = discountRate({
        originPrice: parsePriceInput(originBy[lang]) ?? 0,
        price: parsePriceInput(priceBy[lang]) ?? 0,
    });

    const submit = async () => {
        if (!text.ko.name.trim()) {
            setLang('ko');
            return alert('한국어 프로모션명을 입력하세요.');
        }
        if (parsePriceInput(priceBy.ko) === null) {
            setLang('ko');
            return alert('한국어 판매가를 입력하세요.');
        }
        if (!isOngoing && !until) return alert('마감일을 입력하거나 상시 진행을 선택하세요.');

        setBusy(true);
        try {
            const koPrice = parsePriceInput(priceBy.ko) ?? 0;
            const data = {
                name: text.ko.name,
                nameEn: text.en.name,
                nameZh: text.zh.name,
                highlight: text.ko.highlight,
                highlightEn: text.en.highlight,
                highlightZh: text.zh.highlight,
                description: text.ko.description,
                descriptionEn: text.en.description,
                descriptionZh: text.zh.description,
                originPrice: parsePriceInput(originBy.ko) ?? koPrice,
                originPriceEn: parsePriceInput(originBy.en),
                originPriceZh: parsePriceInput(originBy.zh),
                priceEn: parsePriceInput(priceBy.en),
                priceZh: parsePriceInput(priceBy.zh),
                price: koPrice,
                until: isOngoing ? '' : until,
                isOngoing,
                locales,
                categoryId,
                order: initial?.order ?? Date.now(),
            };
            if (initial) await updatePromotion(initial.id, data);
            else await addPromotion(data);
            alert(initial ? '수정했습니다.' : '등록했습니다.');
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
                <p className="mt-1 text-sm text-neutral-500">
                    마감일이 지난 프로모션은 자동으로 내려가며, 상시 진행은 계속 노출됩니다.
                </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="space-y-6 p-6 sm:p-8">
                    {/* 언어 탭. 입력한 언어에 점이 붙어 어디를 채웠는지 한눈에 보인다 */}
                    <div className="flex items-center gap-1.5 border-b border-black/[0.06] pb-4">
                        {(['ko', 'en', 'zh'] as const).map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => setLang(l)}
                                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
                                    lang === l
                                        ? 'bg-[#3a322c] text-white'
                                        : 'border border-neutral-200 bg-white text-neutral-600'
                                }`}
                            >
                                {l === 'ko' ? '한국어' : l === 'en' ? 'English' : '中文'}
                                {filled(l) && (
                                    <span
                                        aria-hidden="true"
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            lang === l ? 'bg-white' : 'bg-emerald-500'
                                        }`}
                                    />
                                )}
                            </button>
                        ))}
                        {lang !== 'ko' && (
                            <span className="ml-2 text-xs text-neutral-400">비우면 한국어로 표시됩니다</span>
                        )}
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">카테고리</span>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className={inputBase}
                        >
                            <option value="">미분류</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <span className="text-xs text-neutral-400">위에서 카테고리를 먼저 추가하면 선택할 수 있습니다.</span>
                        )}
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            프로모션명 {lang === 'ko' && <span className="text-rose-500">*</span>}
                        </span>
                        <input
                            value={text[lang].name}
                            onChange={(e) => setField('name', e.target.value)}
                            placeholder={
                                lang === 'ko'
                                    ? '예: 울쎄라 300샷 + 써마지 300샷'
                                    : lang === 'en'
                                      ? 'e.g. Ulthera 300 + Thermage 300'
                                      : '例: Ulthera 300 发 + Thermage 300 发'
                            }
                            className={inputBase}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            부제 <span className="font-normal text-neutral-400">(선택)</span>
                        </span>
                        <input
                            value={text[lang].highlight}
                            onChange={(e) => setField('highlight', e.target.value)}
                            placeholder={
                                lang === 'ko'
                                    ? '예: 선 - 페이스라인 탄력케어'
                                    : lang === 'en'
                                      ? 'e.g. Face line firming care'
                                      : '例: 面部轮廓紧致护理'
                            }
                            className={inputBase}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            설명 <span className="font-normal text-neutral-400">(선택)</span>
                        </span>
                        <textarea
                            value={text[lang].description}
                            onChange={(e) => setField('description', e.target.value)}
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
                                type="text"
                                inputMode="numeric"
                                value={originBy[lang]}
                                onChange={(e) =>
                                    setOriginBy((prev) => ({ ...prev, [lang]: formatPriceInput(e.target.value) }))
                                }
                                placeholder="2,700,000"
                                className={inputBase}
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                판매가 <span className="text-rose-500">*</span>
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={priceBy[lang]}
                                onChange={(e) =>
                                    setPriceBy((prev) => ({ ...prev, [lang]: formatPriceInput(e.target.value) }))
                                }
                                placeholder="2,200,000"
                                className={inputBase}
                            />
                        </label>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                마감일 {!isOngoing && <span className="text-rose-500">*</span>}
                            </span>
                            <input
                                type="date"
                                value={until}
                                onChange={(e) => setUntil(e.target.value)}
                                disabled={isOngoing}
                                className={inputBase}
                            />
                            <label className="flex items-center gap-2 text-sm text-neutral-600">
                                <input
                                    type="checkbox"
                                    checked={isOngoing}
                                    onChange={(e) => setIsOngoing(e.target.checked)}
                                />
                                상시 진행 (마감일 없이 계속 노출)
                            </label>
                        </div>
                    </div>

                    {rate > 0 && <p className="text-sm text-neutral-500">화면에 {rate}% 할인으로 표시됩니다.</p>}
                </div>

                <div className="border-t border-black/[0.04] px-6 py-5 sm:px-8">
                    <p className="text-[13px] font-medium text-neutral-600">노출 언어</p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                        {(['ko', 'en', 'zh'] as const).map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => toggleLocale(l)}
                                aria-pressed={locales.includes(l)}
                                className={`rounded-full px-3.5 py-1.5 text-xs ${
                                    locales.includes(l)
                                        ? 'bg-[#3a322c] text-white'
                                        : 'border border-neutral-200 bg-white text-neutral-600'
                                }`}
                            >
                                {l === 'ko' ? '한국어' : l === 'en' ? 'English' : '中文'}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-neutral-400">하나도 고르지 않으면 모든 언어에 노출됩니다.</p>
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

                {/* 저장 중에는 폼 전체를 덮는다. 두 번 누르는 걸 막고 진행 상태가 확실히 보인다 */}
                {busy && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <span className="rounded-full bg-[#3a322c] px-5 py-2 text-sm text-white">저장 중…</span>
                    </div>
                )}
            </div>
        </div>
    );
}
