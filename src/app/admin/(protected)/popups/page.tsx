'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { deletePopupImage, getPopupSetting, savePopupSetting, uploadPopupImage } from '@/lib/settings';
import { POPUP_IMAGE_HEIGHT, POPUP_IMAGE_WIDTH, POPUP_MAX_TABS, type PopupTab } from '@/types/settings';

const inputBase =
    'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10';

const emptyTab = (): PopupTab => ({ label: '', labelEn: '', labelZh: '', imageUrl: '', linkUrl: '' });

export default function PopupsPage() {
    const [enabled, setEnabled] = useState(false);
    const [tabs, setTabs] = useState<PopupTab[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    /** 업로드 중인 탭 번호. 버튼을 잠그는 용도 */
    const [uploading, setUploading] = useState<number | null>(null);

    useEffect(() => {
        let alive = true;
        getPopupSetting().then((s) => {
            if (!alive) return;
            setEnabled(s?.enabled ?? false);
            setTabs(s?.tabs?.length ? s.tabs : [emptyTab()]);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const setTab = (index: number, patch: Partial<PopupTab>) =>
        setTabs((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));

    const addTab = () => setTabs((prev) => (prev.length >= POPUP_MAX_TABS ? prev : [...prev, emptyTab()]));

    const removeTab = async (index: number) => {
        if (!confirm('이 탭을 지울까요?')) return;
        const target = tabs[index];
        if (target.imageUrl) await deletePopupImage(target.imageUrl);
        setTabs((prev) => prev.filter((_, i) => i !== index));
    };

    const pickImage = async (index: number, file: File | undefined) => {
        if (!file) return;
        setUploading(index);
        try {
            const previous = tabs[index].imageUrl;
            const url = await uploadPopupImage(file);
            setTab(index, { imageUrl: url });
            if (previous) await deletePopupImage(previous);
        } catch {
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setUploading(null);
        }
    };

    const submit = async () => {
        const usable = tabs.filter((t) => t.imageUrl);
        if (enabled && usable.length === 0) return alert('팝업을 켜려면 이미지가 있는 탭이 최소 1개 필요합니다.');

        setBusy(true);
        try {
            await savePopupSetting({ enabled, tabs: usable });
            setTabs(usable.length ? usable : [emptyTab()]);
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
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">팝업 관리</h1>
            <p className="mt-1 text-sm text-neutral-500">
                홈 화면 진입 시 뜨는 팝업입니다. 탭은 최대 {POPUP_MAX_TABS}개까지 등록할 수 있고, 이미지가 없는 탭은
                저장할 때 자동으로 빠집니다. 탭이 둘 이상이면 5초마다 자동으로 넘어갑니다.
                <br />
                이미지는 <b>
                    {POPUP_IMAGE_WIDTH}×{POPUP_IMAGE_HEIGHT}px (4:5, 인스타 세로 게시물)
                </b>
                을 권장합니다. 다른 비율도 잘리지 않고 통째로 보입니다.
            </p>

            <label className="mt-6 flex w-fit items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3">
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                <span className="text-sm font-medium text-[#3a322c]">팝업 노출하기</span>
            </label>

            <div className="mt-6 flex flex-col gap-4">
                {tabs.map((tab, i) => (
                    <div
                        key={i}
                        className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
                            <span className="text-sm font-semibold text-[#3a322c]">탭 {i + 1}</span>
                            <button type="button" onClick={() => removeTab(i)} className="text-xs text-rose-500">
                                삭제
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                <div className="flex aspect-[4/5] w-[112px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                                    {tab.imageUrl ? (
                                        <Image
                                            src={tab.imageUrl}
                                            alt=""
                                            width={POPUP_IMAGE_WIDTH}
                                            height={POPUP_IMAGE_HEIGHT}
                                            unoptimized
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-xs text-neutral-400">이미지 없음</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <span className="text-[13px] font-medium text-neutral-600">팝업 이미지</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={uploading === i}
                                        onChange={(e) => pickImage(i, e.target.files?.[0])}
                                        className="mt-1.5 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#3a322c] file:px-4 file:py-2 file:text-sm file:text-white"
                                    />
                                    <p className="mt-2 text-xs text-neutral-400">
                                        {uploading === i
                                            ? '업로드 중…'
                                            : `${POPUP_IMAGE_WIDTH}×${POPUP_IMAGE_HEIGHT}px (4:5) 이미지를 올려주세요.`}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-[13px] font-medium text-neutral-600">탭 이름 (한국어)</span>
                                    <input
                                        value={tab.label}
                                        onChange={(e) => setTab(i, { label: e.target.value })}
                                        placeholder="예: 8월 진료일정"
                                        className={inputBase}
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-[13px] font-medium text-neutral-600">English</span>
                                    <input
                                        value={tab.labelEn ?? ''}
                                        onChange={(e) => setTab(i, { labelEn: e.target.value })}
                                        placeholder="e.g. August schedule"
                                        className={inputBase}
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-[13px] font-medium text-neutral-600">中文</span>
                                    <input
                                        value={tab.labelZh ?? ''}
                                        onChange={(e) => setTab(i, { labelZh: e.target.value })}
                                        placeholder="例: 8月门诊安排"
                                        className={inputBase}
                                    />
                                </label>
                            </div>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-[13px] font-medium text-neutral-600">
                                    이미지 클릭 시 이동 주소 <span className="font-normal text-neutral-400">(선택)</span>
                                </span>
                                <input
                                    value={tab.linkUrl ?? ''}
                                    onChange={(e) => setTab(i, { linkUrl: e.target.value })}
                                    placeholder="https://"
                                    className={inputBase}
                                />
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={addTab}
                    disabled={tabs.length >= POPUP_MAX_TABS}
                    className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm text-[#3a322c] disabled:opacity-40"
                >
                    탭 추가 ({tabs.length}/{POPUP_MAX_TABS})
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
