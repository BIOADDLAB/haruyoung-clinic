'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MENU_CATEGORIES } from '@/constants/categories';
import { addProduct, updateProduct } from '@/lib/products';
import type { Product } from '@/types/product';

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
    const [mainCategory, setMainCategory] = useState(initial?.mainCategory ?? '');
    const [subCategory, setSubCategory] = useState(initial?.subCategory ?? '');
    const [customSub, setCustomSub] = useState(false);
    const [name, setName] = useState(initial?.name ?? '');
    const [highlight, setHighlight] = useState(initial?.highlight ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [price, setPrice] = useState(initial?.price?.toString() ?? '');
    const [busy, setBusy] = useState(false);

    const subOptions = Array.from(
        new Set(allProducts.filter((p) => p.menuSlug === menuSlug && p.subCategory).map((p) => p.subCategory)),
    );

    /** 같은 카테고리에 이미 쓰인 대분류. datalist 로 자동완성한다 */
    const mainOptions = Array.from(
        new Set(allProducts.filter((p) => p.menuSlug === menuSlug && p.mainCategory).map((p) => p.mainCategory)),
    );

    const menuName = MENU_CATEGORIES.find((c) => c.slug === menuSlug)!.name;

    const submit = async () => {
        if (!name.trim()) {
            alert('시술명을 입력하세요.');
            return;
        }
        setBusy(true);
        try {
            const data = {
                menuSlug,
                menuCategory: menuName,
                mainCategory,
                subCategory,
                name,
                highlight,
                description,
                price: price === '' ? null : Number(price),
                order: initial?.order ?? Date.now(),
            };
            if (initial) {
                await updateProduct(initial.id, data);
            } else {
                await addProduct(data);
            }
            if (onSaved) {
                onSaved();
            } else {
                router.push('/admin/products');
                router.refresh();
            }
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
            <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="space-y-6 p-6 sm:p-8">
                    {/* 대메뉴 + 중제목 */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                                대분류 <span className="font-normal text-neutral-400">(페이지 섹션 제목)</span>
                            </span>
                            <input
                                value={mainCategory}
                                onChange={(e) => setMainCategory(e.target.value)}
                                placeholder="예: 초음파 리프팅"
                                list="main-options"
                                className={inputBase}
                            />
                            <datalist id="main-options">
                                {mainOptions.map((m) => (
                                    <option key={m} value={m} />
                                ))}
                            </datalist>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                중제목 <span className="font-normal text-neutral-400">(선택)</span>
                            </span>
                            {!customSub ? (
                                <select
                                    value={subCategory}
                                    onChange={(e) => {
                                        if (e.target.value === '__custom__') {
                                            setCustomSub(true);
                                            setSubCategory('');
                                        } else {
                                            setSubCategory(e.target.value);
                                        }
                                    }}
                                    className={inputBase}
                                >
                                    <option value="">(중제목 없음)</option>
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
                                        placeholder="새 중제목 입력"
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

                    {/* 시술명 */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            시술명 <span className="text-rose-500">*</span>
                        </span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 프리미엄 리프팅"
                            className={inputBase}
                        />
                    </label>

                    {/* 주요문장 */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            주요문장 <span className="font-normal text-neutral-400">(볼드, 선택)</span>
                        </span>
                        <input
                            value={highlight}
                            onChange={(e) => setHighlight(e.target.value)}
                            placeholder="강조하고 싶은 한 줄 문장"
                            className={inputBase}
                        />
                    </label>

                    {/* 설명 */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            설명 <span className="font-normal text-neutral-400">(선택)</span>
                        </span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="시술에 대한 간단한 설명을 입력하세요"
                            className={`${inputBase} resize-none`}
                        />
                    </label>

                    {/* 정가 */}
                    <label className="flex w-full max-w-xs flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            정가 <span className="font-normal text-neutral-400">(원, 미정이면 비움)</span>
                        </span>
                        <div className="relative">
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0"
                                className={`${inputBase} pr-10`}
                            />
                            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                                원
                            </span>
                        </div>
                    </label>
                </div>

                {/* 하단 버튼 */}
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
            </div>
        </div>
    );
}
