'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MENU_CATEGORIES } from '@/constants/categories';
import {
    deleteBeforeAfterImage,
    getBeforeAfterSetting,
    saveBeforeAfterSetting,
    uploadBeforeAfterImage,
} from '@/lib/settings';
import { type BeforeAfterItem } from '@/types/settings';

const emptyItem = (menuSlug: string): BeforeAfterItem => ({ menuSlug, beforeUrl: '', afterUrl: '' });

type Side = 'beforeUrl' | 'afterUrl';

export default function BeforeAfterPage() {
    const [items, setItems] = useState<BeforeAfterItem[]>([]);
    const [menu, setMenu] = useState<string>(MENU_CATEGORIES[0].slug);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    /** 업로드 중인 칸. '0-beforeUrl' 형태 */
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        getBeforeAfterSetting().then((s) => {
            if (!alive) return;
            const loaded = (s?.items ?? []).map((item) => ({
                ...item,
                menuSlug: item.menuSlug || MENU_CATEGORIES[0].slug,
            }));
            setItems(loaded);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const setItem = (index: number, patch: Partial<BeforeAfterItem>) =>
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

    const visible = items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.menuSlug === menu);

    const addItem = () => setItems((prev) => [...prev, emptyItem(menu)]);

    const removeItem = async (index: number) => {
        if (!confirm('이 세트를 지울까요?')) return;
        const target = items[index];
        if (target.beforeUrl) await deleteBeforeAfterImage(target.beforeUrl);
        if (target.afterUrl) await deleteBeforeAfterImage(target.afterUrl);
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const pickImage = async (index: number, side: Side, file: File | undefined) => {
        if (!file) return;
        const key = `${index}-${side}`;
        setUploading(key);
        try {
            const previous = items[index][side];
            const url = await uploadBeforeAfterImage(file);
            setItem(index, { [side]: url });
            if (previous) await deleteBeforeAfterImage(previous);
        } catch (e) {
            console.error('[before-after] 이미지 업로드 실패', e);
            const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
            alert(
                code === 'storage/unauthorized'
                    ? '이미지 업로드 권한이 없습니다. Firebase Storage 규칙을 확인해주세요.'
                    : '이미지 업로드에 실패했습니다.',
            );
        } finally {
            setUploading(null);
        }
    };

    const submit = async () => {
        const incomplete = items.some((item) => Boolean(item.beforeUrl) !== Boolean(item.afterUrl));
        if (incomplete) {
            return alert('전·후 사진이 모두 있는 세트만 저장됩니다. 비어 있는 쪽을 채워 주세요.');
        }

        const usable = items.filter((item) => item.beforeUrl && item.afterUrl);

        setBusy(true);
        try {
            await saveBeforeAfterSetting({ items: usable });
            setItems(usable);
            alert('저장했습니다.');
        } catch {
            alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div className="w-full max-w-4xl">
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">전후사진 관리</h1>
            <p className="mt-1 text-sm text-neutral-500">
                시술 메뉴와 같은 카테고리로 나눕니다. 한 세트에 Before와 After 두 장을 올리고, 사진이 비어 있는 세트는
                저장할 때 빠집니다.
            </p>

            <div className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
                {MENU_CATEGORIES.map((c) => (
                    <button
                        key={c.slug}
                        type="button"
                        onClick={() => setMenu(c.slug)}
                        className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
                            menu === c.slug ? 'bg-[#3a322c] text-white' : 'border border-black/10 bg-white'
                        }`}
                    >
                        {c.name}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-4">
                {visible.map(({ item, index }, n) => (
                    <div
                        key={`${item.beforeUrl}-${item.afterUrl}-${index}`}
                        className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
                            <span className="text-sm font-semibold text-[#3a322c]">
                                {MENU_CATEGORIES.find((c) => c.slug === item.menuSlug)?.name} · 전후사진 {n + 1}
                            </span>
                            <button type="button" onClick={() => removeItem(index)} className="text-xs text-rose-500">
                                삭제
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <label className="flex max-w-xs flex-col gap-1.5">
                                <span className="text-[13px] font-medium text-neutral-600">대메뉴</span>
                                <select
                                    value={item.menuSlug}
                                    onChange={(e) => setItem(index, { menuSlug: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10"
                                >
                                    {MENU_CATEGORIES.map((c) => (
                                        <option key={c.slug} value={c.slug}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <ImageField
                                    label="Before (시술 전)"
                                    url={item.beforeUrl}
                                    uploading={uploading === `${index}-beforeUrl`}
                                    disabled={uploading !== null}
                                    onPick={(file) => pickImage(index, 'beforeUrl', file)}
                                />
                                <ImageField
                                    label="After (시술 후)"
                                    url={item.afterUrl}
                                    uploading={uploading === `${index}-afterUrl`}
                                    disabled={uploading !== null}
                                    onPick={(file) => pickImage(index, 'afterUrl', file)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {visible.length === 0 && <p className="text-neutral-400">이 메뉴에 전후사진이 없습니다.</p>}
            </div>

            <div className="mt-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={addItem}
                    className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm text-[#3a322c]"
                >
                    세트 추가
                </button>

                <button
                    type="button"
                    onClick={submit}
                    disabled={busy || uploading !== null}
                    className="rounded-xl bg-[#3a322c] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                    {busy ? '저장 중…' : '저장'}
                </button>
            </div>
        </div>
    );
}

function ImageField({
    label,
    url,
    uploading,
    disabled,
    onPick,
}: {
    label: string;
    url: string;
    uploading: boolean;
    disabled: boolean;
    onPick: (file: File | undefined) => void;
}) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-neutral-600">{label}</span>
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                {url ? (
                    <Image src={url} alt="" width={800} height={800} unoptimized className="h-full w-full object-cover" />
                ) : (
                    <span className="text-xs text-neutral-400">이미지 없음</span>
                )}
            </div>
            <input
                type="file"
                accept="image/*"
                disabled={disabled}
                onChange={(e) => {
                    onPick(e.target.files?.[0]);
                    e.target.value = '';
                }}
                className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#3a322c] file:px-4 file:py-2 file:text-sm file:text-white"
            />
            <p className="text-xs text-neutral-400">{uploading ? '업로드 중…' : '정사각(1:1) 이미지를 권장합니다.'}</p>
        </label>
    );
}
