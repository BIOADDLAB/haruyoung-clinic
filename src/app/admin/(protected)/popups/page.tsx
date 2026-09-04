'use client';

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { deletePopupImage, getPopupSetting, savePopupSetting, uploadPopupImage } from '@/lib/settings';
import { POPUP_IMAGE_HEIGHT, POPUP_IMAGE_WIDTH, POPUP_MAX_TABS, type PopupTab } from '@/types/settings';

const inputBase =
    'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10';

type TabDraft = PopupTab & { key: string };

const newKey = () => crypto.randomUUID();
const emptyTab = (): TabDraft => ({
    key: newKey(),
    label: '',
    labelEn: '',
    labelZh: '',
    imageUrl: '',
    linkUrl: '',
});
const toDraft = (tab: PopupTab): TabDraft => ({ ...tab, key: newKey() });
const toSaved = ({ key: _key, ...tab }: TabDraft): PopupTab => tab;

function SortableTab({
    tab,
    index,
    uploading,
    onPatch,
    onRemove,
    onPickImage,
}: {
    tab: TabDraft;
    index: number;
    uploading: boolean;
    onPatch: (patch: Partial<PopupTab>) => void;
    onRemove: () => void;
    onPickImage: (file: File | undefined) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.key });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
                <div className="flex items-center gap-2">
                    <button type="button" {...attributes} {...listeners} className="cursor-grab text-dark/35">
                        ⠿
                    </button>
                    <span className="text-sm font-semibold text-[#3a322c]">탭 {index + 1}</span>
                </div>
                <button type="button" onClick={onRemove} className="text-xs text-rose-500">
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
                            disabled={uploading}
                            onChange={(e) => onPickImage(e.target.files?.[0])}
                            className="mt-1.5 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#3a322c] file:px-4 file:py-2 file:text-sm file:text-white"
                        />
                        <p className="mt-2 text-xs text-neutral-400">
                            {uploading
                                ? '업로드 중…'
                                : `${POPUP_IMAGE_WIDTH}×${POPUP_IMAGE_HEIGHT}px (4:5) 이미지를 올려주세요.`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">탭 이름 (한국어)</span>
                        <textarea
                            value={tab.label}
                            onChange={(e) => onPatch({ label: e.target.value })}
                            placeholder={'예: 8월\n진료일정'}
                            rows={3}
                            className={`${inputBase} min-h-[4.75rem] resize-y`}
                        />
                        <span className="text-xs text-neutral-400">엔터로 줄바꿈하면 팝업 목록에도 그대로 보입니다.</span>
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">English</span>
                        <textarea
                            value={tab.labelEn ?? ''}
                            onChange={(e) => onPatch({ labelEn: e.target.value })}
                            placeholder={'e.g. August\nschedule'}
                            rows={3}
                            className={`${inputBase} min-h-[4.75rem] resize-y`}
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">中文</span>
                        <textarea
                            value={tab.labelZh ?? ''}
                            onChange={(e) => onPatch({ labelZh: e.target.value })}
                            placeholder={'例: 8月\n门诊安排'}
                            rows={3}
                            className={`${inputBase} min-h-[4.75rem] resize-y`}
                        />
                    </label>
                </div>

                <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium text-neutral-600">
                        이미지 클릭 시 이동 주소 <span className="font-normal text-neutral-400">(선택)</span>
                    </span>
                    <input
                        value={tab.linkUrl ?? ''}
                        onChange={(e) => onPatch({ linkUrl: e.target.value })}
                        placeholder="/promotion 또는 /promotion?c=카테고리ID"
                        className={inputBase}
                    />
                    <span className="text-xs text-neutral-400">
                        사이트 안 페이지는 /promotion 처럼 경로만 적으세요. 프로모션 탭을 열려면 관리자 프로모션 관리에
                        있는 카테고리 주소를 그대로 붙입니다. 외부 사이트만 https:// 로 시작합니다.
                    </span>
                </label>
            </div>
        </div>
    );
}

export default function PopupsPage() {
    const [enabled, setEnabled] = useState(false);
    const [tabs, setTabs] = useState<TabDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    /** 업로드 중인 탭. 버튼을 잠그는 용도 */
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        let alive = true;
        getPopupSetting().then((s) => {
            if (!alive) return;
            setEnabled(s?.enabled ?? false);
            setTabs(s?.tabs?.length ? s.tabs.map(toDraft) : [emptyTab()]);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const setTab = (key: string, patch: Partial<PopupTab>) =>
        setTabs((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)));

    const addTab = () => setTabs((prev) => (prev.length >= POPUP_MAX_TABS ? prev : [...prev, emptyTab()]));

    const removeTab = async (key: string) => {
        if (!confirm('이 탭을 지울까요?')) return;
        const target = tabs.find((t) => t.key === key);
        if (target?.imageUrl) await deletePopupImage(target.imageUrl);
        setTabs((prev) => prev.filter((t) => t.key !== key));
    };

    const pickImage = async (key: string, file: File | undefined) => {
        if (!file) return;
        const current = tabs.find((t) => t.key === key);
        if (!current) return;
        setUploadingKey(key);
        try {
            const url = await uploadPopupImage(file);
            setTab(key, { imageUrl: url });
            if (current.imageUrl) await deletePopupImage(current.imageUrl);
        } catch {
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setUploadingKey(null);
        }
    };

    const onDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        setTabs((prev) => {
            const oldIdx = prev.findIndex((t) => t.key === active.id);
            const newIdx = prev.findIndex((t) => t.key === over.id);
            if (oldIdx < 0 || newIdx < 0) return prev;
            return arrayMove(prev, oldIdx, newIdx);
        });
    };

    const submit = async () => {
        const usable = tabs.filter((t) => t.imageUrl).map(toSaved);
        if (enabled && usable.length === 0) return alert('팝업을 켜려면 이미지가 있는 탭이 최소 1개 필요합니다.');

        setBusy(true);
        try {
            await savePopupSetting({ enabled, tabs: usable });
            setTabs(usable.length ? usable.map(toDraft) : [emptyTab()]);
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
                저장할 때 자동으로 빠집니다. 탭이 둘 이상이면 5초마다 자동으로 넘어갑니다. 왼쪽 ⠿ 를 끌어 순서를 바꾼
                뒤 저장하세요.
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

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={tabs.map((t) => t.key)} strategy={verticalListSortingStrategy}>
                    <div className="mt-6 flex flex-col gap-4">
                        {tabs.map((tab, i) => (
                            <SortableTab
                                key={tab.key}
                                tab={tab}
                                index={i}
                                uploading={uploadingKey === tab.key}
                                onPatch={(patch) => setTab(tab.key, patch)}
                                onRemove={() => removeTab(tab.key)}
                                onPickImage={(file) => pickImage(tab.key, file)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

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
                    disabled={busy || uploadingKey !== null}
                    className="rounded-xl bg-[#3a322c] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                    {busy ? '저장 중…' : '저장'}
                </button>
            </div>
        </div>
    );
}
