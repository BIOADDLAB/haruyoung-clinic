'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MENU_CATEGORIES, SECTION_PRESETS } from '@/constants/categories';
import { formatPriceInput, parsePriceInput } from '@/lib/price';
import { addProduct, updateProduct } from '@/lib/products';
import { tierCaption, type PriceTier, type Product } from '@/types/product';

type TierDraft = {
    label: string;
    price: { ko: string; en: string; zh: string };
};

const emptyTierPrice = () => ({ ko: '', en: '', zh: '' });

function nextLabel(rows: TierDraft[]) {
    const last = rows[rows.length - 1]?.label.trim() ?? '';
    const m = last.match(/^([\d.]+)(.*)$/);
    if (m) {
        const n = Number(m[1]);
        if (Number.isFinite(n) && n > 0) return `${n + 1}${m[2]}`;
    }
    return '1회';
}

function parseAmount(raw: string) {
    const m = raw.match(/[\d.]+/);
    const n = m ? Number(m[0]) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function ProductForm({
    initial,
    allProducts,
    onSaved,
    onCancel,
}: {
    initial?: Product;
    allProducts: Product[];
    /** 목록 페이지에 인라인으로 박혀 있을 때만 넘어온다. 없으면 단독 페이지처럼 이동 */
    onSaved?: () => void;
    onCancel?: () => void;
}) {
    const router = useRouter();
    const [menuSlug, setMenuSlug] = useState(initial?.menuSlug ?? MENU_CATEGORIES[0].slug);
    const [subCategory, setSubCategory] = useState(initial?.subCategory ?? '');
    const [customSub, setCustomSub] = useState(false);
    /**
     * 언어별 입력값을 한 덩어리로 관리한다.
     * 상태를 9개로 흩어 놓으면 탭을 바꿀 때마다 어느 값을 읽는지 놓치기 쉽다.
     */
    const [text, setText] = useState({
        ko: {
            name: initial?.name ?? '',
            highlight: initial?.highlight ?? '',
            description: initial?.description ?? '',
            subCategory: initial?.subCategory ?? '',
        },
        en: {
            name: initial?.nameEn ?? '',
            highlight: initial?.highlightEn ?? '',
            description: initial?.descriptionEn ?? '',
            subCategory: initial?.subCategoryEn ?? '',
        },
        zh: {
            name: initial?.nameZh ?? '',
            highlight: initial?.highlightZh ?? '',
            description: initial?.descriptionZh ?? '',
            subCategory: initial?.subCategoryZh ?? '',
        },
    });

    /** 언어 탭. 한 화면에 3배로 늘어놓으면 못 쓴다 */
    const [lang, setLang] = useState<'ko' | 'en' | 'zh'>('ko');

    const setField = (field: 'name' | 'highlight' | 'description' | 'subCategory', v: string) =>
        setText((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: v } }));

    /** 각 언어에 입력된 게 하나라도 있는지. 탭에 점으로 표시한다 */
    const filled = (l: 'ko' | 'en' | 'zh') =>
        Boolean(
            text[l].name.trim() ||
                text[l].highlight.trim() ||
                text[l].description.trim() ||
                (l !== 'ko' && text[l].subCategory.trim()),
        );
    /** 노출 언어. 비어 있으면 모든 언어에 노출한다 */
    const [locales, setLocales] = useState<('ko' | 'en' | 'zh')[]>(initial?.locales ?? []);
    const [hidden, setHidden] = useState(initial?.hidden === true);

    const toggleLocale = (l: 'ko' | 'en' | 'zh') =>
        setLocales((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
    /** 언어별 가격. 비우면 한국어 가격을 쓴다 */
    const [priceBy, setPriceBy] = useState({
        ko: formatPriceInput(initial?.price),
        en: formatPriceInput(initial?.priceEn),
        zh: formatPriceInput(initial?.priceZh),
    });
    /** 제모처럼 1회/5회, 필러처럼 2cc/4cc 로 나눠 팔 때 켠다 */
    const [useTiers, setUseTiers] = useState((initial?.priceTiers?.length ?? 0) > 0);
    const [tiers, setTiers] = useState<TierDraft[]>(() => {
        if (initial?.priceTiers?.length) {
            return initial.priceTiers.map((tier) => ({
                label: tierCaption(tier),
                price: {
                    ko: formatPriceInput(tier.price),
                    en: formatPriceInput(tier.priceEn),
                    zh: formatPriceInput(tier.priceZh),
                },
            }));
        }
        return [{ label: '1회', price: emptyTierPrice() }];
    });
    const [busy, setBusy] = useState(false);

    /** 기본 섹션 목록을 먼저 깔고, 이미 등록된 값을 뒤에 붙인다 */
    const subOptions = Array.from(
        new Set([
            ...(SECTION_PRESETS[menuSlug] ?? []),
            ...allProducts.filter((p) => p.menuSlug === menuSlug && p.subCategory).map((p) => p.subCategory),
        ]),
    );

    const menuName = MENU_CATEGORIES.find((c) => c.slug === menuSlug)!.name;

    const pickSubCategory = (next: string) => {
        setSubCategory(next);
        const peer = allProducts.find(
            (p) => p.menuSlug === menuSlug && p.subCategory === next && (p.subCategoryEn || p.subCategoryZh),
        );
        if (!peer || !next) return;
        setText((prev) => ({
            ...prev,
            en: { ...prev.en, subCategory: prev.en.subCategory.trim() || peer.subCategoryEn || '' },
            zh: { ...prev.zh, subCategory: prev.zh.subCategory.trim() || peer.subCategoryZh || '' },
        }));
    };

    const submit = async () => {
        if (!text.ko.name.trim()) {
            alert('한국어 시술명을 입력하세요.');
            setLang('ko');
            return;
        }
        const parsedTiers = useTiers
            ? tiers
                  .map((row) => {
                      const label = row.label.trim();
                      return {
                          label,
                          sessions: parseAmount(label),
                          price: parsePriceInput(row.price.ko),
                          priceEn: parsePriceInput(row.price.en),
                          priceZh: parsePriceInput(row.price.zh),
                      };
                  })
                  .filter((tier) => tier.label.length > 0)
            : [];

        if (useTiers) {
            if (parsedTiers.length === 0) {
                alert('표기와 가격을 하나 이상 입력하세요. 예: 1회, 2cc');
                return;
            }
            const labels = parsedTiers.map((tier) => tier.label);
            if (new Set(labels).size !== labels.length) {
                alert('같은 표기가 두 번 들어가 있습니다.');
                return;
            }
        }

        setBusy(true);
        try {
            const first = parsedTiers[0];
            const priceTiers: PriceTier[] = parsedTiers.map((tier) => {
                const row: PriceTier = { sessions: tier.sessions || 0, label: tier.label, price: tier.price };
                if (tier.priceEn != null) row.priceEn = tier.priceEn;
                if (tier.priceZh != null) row.priceZh = tier.priceZh;
                return row;
            });
            const data = {
                menuSlug,
                menuCategory: menuName,
                subCategory,
                subCategoryEn: text.en.subCategory,
                subCategoryZh: text.zh.subCategory,
                name: text.ko.name,
                nameEn: text.en.name,
                nameZh: text.zh.name,
                highlight: text.ko.highlight,
                highlightEn: text.en.highlight,
                highlightZh: text.zh.highlight,
                description: text.ko.description,
                descriptionEn: text.en.description,
                descriptionZh: text.zh.description,
                price: useTiers ? (first?.price ?? null) : parsePriceInput(priceBy.ko),
                priceEn: useTiers ? (first?.priceEn ?? null) : parsePriceInput(priceBy.en),
                priceZh: useTiers ? (first?.priceZh ?? null) : parsePriceInput(priceBy.zh),
                priceTiers,
                locales,
                hidden,
                order: initial?.order ?? Date.now(),
            };
            if (initial) {
                await updateProduct(initial.id, data);
            } else {
                await addProduct(data);
            }
            alert(initial ? '수정했습니다.' : '등록했습니다.');
            if (onSaved) {
                onSaved();
            } else {
                router.push('/admin/products');
                router.refresh();
            }
        } catch {
            alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setBusy(false);
        }
    };

    const inputBase =
        'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10';

    return (
        <div className="w-full max-w-4xl">
            {/* 페이지 타이틀 */}
            <div className="mb-8">
                <h1 className="text-xl font-bold tracking-tight text-[#3a322c] sm:text-2xl">
                    {initial ? '시술 수정' : '시술 추가'}
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    {initial ? '기존 시술 정보를 수정합니다.' : '새로운 시술을 메뉴에 등록합니다.'}
                </p>
            </div>

            {/* 카드 */}
            <div className="relative overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="space-y-6 p-6 sm:p-8">
                    {/* 대메뉴 + 중제목 */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">대메뉴</span>
                            <select
                                value={menuSlug}
                                onChange={(e) => {
                                    setMenuSlug(e.target.value);
                                    setSubCategory('');
                                    setCustomSub(false);
                                }}
                                className={inputBase}
                            >
                                {MENU_CATEGORIES.map((c) => (
                                    <option key={c.slug} value={c.slug}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                섹션 제목 <span className="font-normal text-neutral-400">(선택)</span>
                            </span>
                            {!customSub ? (
                                <select
                                    value={subCategory}
                                    onChange={(e) => {
                                        if (e.target.value === '__custom__') {
                                            setCustomSub(true);
                                            setSubCategory('');
                                        } else {
                                            pickSubCategory(e.target.value);
                                        }
                                    }}
                                    className={inputBase}
                                >
                                    <option value="">(섹션 없음)</option>
                                    {subOptions.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                    <option value="__custom__">+ 직접 입력</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        value={subCategory}
                                        onChange={(e) => setSubCategory(e.target.value)}
                                        placeholder="새 섹션 제목 입력"
                                        className={`${inputBase} flex-1`}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCustomSub(false)}
                                        className="shrink-0 rounded-xl border border-neutral-200 px-3.5 text-sm text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-700"
                                    >
                                        목록
                                    </button>
                                </div>
                            )}
                        </label>
                    </div>

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

                    {/* 영문·중문 섹션 제목. 묶는 키는 한국어 섹션명이라 여기가 비어도 구성이 안 깨진다 */}
                    {lang !== 'ko' && (
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                섹션 제목 <span className="font-normal text-neutral-400">(선택)</span>
                            </span>
                            <input
                                value={text[lang].subCategory}
                                onChange={(e) => setField('subCategory', e.target.value)}
                                placeholder={
                                    subCategory
                                        ? lang === 'en'
                                            ? `한국어: ${subCategory}`
                                            : `韩语: ${subCategory}`
                                        : lang === 'en'
                                          ? 'Leave empty to use the Korean section title'
                                          : '留空则显示韩语分区名'
                                }
                                className={inputBase}
                            />
                        </label>
                    )}

                    {/* 시술명 */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            시술명 {lang === 'ko' && <span className="text-rose-500">*</span>}
                        </span>
                        <input
                            value={text[lang].name}
                            onChange={(e) => setField('name', e.target.value)}
                            placeholder={
                                lang === 'ko'
                                    ? '예: 프리미엄 리프팅'
                                    : lang === 'en'
                                      ? 'e.g. Premium Lifting'
                                      : '例: 高级提升'
                            }
                            className={inputBase}
                        />
                    </label>

                    {/* 주요문장 */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            주요문장 <span className="font-normal text-neutral-400">(볼드, 선택)</span>
                        </span>
                        <input
                            value={text[lang].highlight}
                            onChange={(e) => setField('highlight', e.target.value)}
                            placeholder={
                                lang === 'ko'
                                    ? '강조하고 싶은 한 줄 문장'
                                    : lang === 'en'
                                      ? 'One line to highlight'
                                      : '想要强调的一句话'
                            }
                            className={inputBase}
                        />
                    </label>

                    {/* 설명 */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            설명 <span className="font-normal text-neutral-400">(선택)</span>
                        </span>
                        <textarea
                            value={text[lang].description}
                            onChange={(e) => setField('description', e.target.value)}
                            rows={4}
                            placeholder={
                                lang === 'ko'
                                    ? '시술에 대한 간단한 설명을 입력하세요'
                                    : lang === 'en'
                                      ? 'Short description in English'
                                      : '简短说明'
                            }
                            className={`${inputBase} resize-none`}
                        />
                    </label>

                    {/* 정가. 구간으로 나누면 아래 표가 대신한다 */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[13px] font-medium text-neutral-600">가격</span>
                            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-neutral-600">
                                <input
                                    type="checkbox"
                                    checked={useTiers}
                                    onChange={(e) => {
                                        const on = e.target.checked;
                                        setUseTiers(on);
                                        if (on && tiers.length === 1 && !tiers[0].price.ko) {
                                            setTiers([
                                                {
                                                    label: '1회',
                                                    price: { ...priceBy },
                                                },
                                            ]);
                                        }
                                    }}
                                    className="h-3.5 w-3.5 accent-[#3a322c]"
                                />
                                회차별 가격
                            </label>
                        </div>

                        {useTiers ? (
                            <div className="space-y-2.5">
                                <p className="text-xs text-neutral-400">
                                    {lang === 'ko'
                                        ? '1회, 2cc처럼 표기를 그대로 적습니다. 미정이면 가격을 비워 두세요.'
                                        : '비우면 한국어 가격으로 표시됩니다.'}
                                </p>
                                {tiers.map((row, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={row.label}
                                            onChange={(e) => {
                                                const label = e.target.value.slice(0, 16);
                                                setTiers((prev) =>
                                                    prev.map((item, idx) => (idx === i ? { ...item, label } : item)),
                                                );
                                            }}
                                            placeholder="1회"
                                            className="w-24 shrink-0 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10"
                                        />
                                        <div className="relative min-w-0 max-w-xs flex-1">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={row.price[lang]}
                                                onChange={(e) => {
                                                    const value = formatPriceInput(e.target.value);
                                                    setTiers((prev) =>
                                                        prev.map((item, idx) =>
                                                            idx === i
                                                                ? {
                                                                      ...item,
                                                                      price: { ...item.price, [lang]: value },
                                                                  }
                                                                : item,
                                                        ),
                                                    );
                                                }}
                                                placeholder="0"
                                                className={`${inputBase} pr-10`}
                                            />
                                            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                                                {lang === 'ko' ? '원' : lang === 'en' ? 'KRW' : '韩元'}
                                            </span>
                                        </div>
                                        {tiers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setTiers((prev) => prev.filter((_, idx) => idx !== i))}
                                                className="shrink-0 text-[13px] text-neutral-400 transition hover:text-rose-500"
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTiers((prev) => [
                                            ...prev,
                                            { label: nextLabel(prev), price: emptyTierPrice() },
                                        ])
                                    }
                                    className="text-[13px] font-medium text-[#3a322c] transition hover:opacity-70"
                                >
                                    + 추가
                                </button>
                            </div>
                        ) : (
                            <label className="flex w-full max-w-xs flex-col gap-1.5">
                                <span className="text-[13px] font-medium text-neutral-600">
                                    정가{' '}
                                    <span className="font-normal text-neutral-400">
                                        {lang === 'ko' ? '(원, 미정이면 비움)' : '(비우면 한국어 가격으로 표시)'}
                                    </span>
                                </span>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={priceBy[lang]}
                                        onChange={(e) =>
                                            setPriceBy((prev) => ({
                                                ...prev,
                                                [lang]: formatPriceInput(e.target.value),
                                            }))
                                        }
                                        placeholder="0"
                                        className={`${inputBase} pr-10`}
                                    />
                                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                                        {lang === 'ko' ? '원' : lang === 'en' ? 'KRW' : '韩元'}
                                    </span>
                                </div>
                            </label>
                        )}
                    </div>
                </div>

                {/* 하단 버튼 */}
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
                    <label className="mt-5 flex w-fit cursor-pointer items-center gap-2 text-[13px] text-neutral-600">
                        <input
                            type="checkbox"
                            checked={hidden}
                            onChange={(e) => setHidden(e.target.checked)}
                            className="h-3.5 w-3.5 accent-[#3a322c]"
                        />
                        사이트에서 숨기기
                    </label>
                    <p className="mt-1.5 text-xs text-neutral-400">켜면 수가표·검색에서 빠지고, 관리자 목록에만 남습니다.</p>
                </div>

                <div className="flex flex-col-reverse gap-2.5 border-t border-black/[0.04] bg-neutral-50/50 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                    <button
                        type="button"
                        onClick={() => (onCancel ? onCancel() : router.back())}
                        className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-800"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy}
                        className="rounded-xl bg-[#3a322c] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#2d2621] disabled:cursor-not-allowed disabled:opacity-50"
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
