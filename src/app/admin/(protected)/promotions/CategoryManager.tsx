'use client';

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import {
    addPromotionCategory,
    deletePromotionCategory,
    reorderPromotionCategories,
    updatePromotionCategory,
} from '@/lib/promotionCategories';
import type { PromotionCategory } from '@/types/promotion';

const inputBase =
    'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10';

function SortableRow({
    category,
    editing,
    onEdit,
    onDelete,
}: {
    category: PromotionCategory;
    editing: boolean;
    onEdit: (c: PromotionCategory) => void;
    onDelete: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                editing ? 'border-dark ring-1 ring-dark' : 'border-neutral-200 bg-white'
            }`}
        >
            <button type="button" {...attributes} {...listeners} className="cursor-grab text-dark/35">
                ⠿
            </button>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#3a322c]">{category.name}</p>
            {(category.nameEn || category.nameZh) && (
                <p className="hidden truncate text-xs text-neutral-400 sm:block">
                    {[category.nameEn, category.nameZh].filter(Boolean).join(' · ')}
                </p>
            )}
            <button type="button" onClick={() => onEdit(category)} className="text-caption text-dark/55 hover:text-dark">
                수정
            </button>
            <button type="button" onClick={() => onDelete(category.id)} className="text-caption text-red-500">
                삭제
            </button>
        </div>
    );
}

export default function CategoryManager({
    categories,
    onChanged,
}: {
    categories: PromotionCategory[];
    onChanged: () => void;
}) {
    const [name, setName] = useState({ ko: '', en: '', zh: '' });
    const [editing, setEditing] = useState<PromotionCategory | null>(null);
    const [busy, setBusy] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    const reset = () => {
        setName({ ko: '', en: '', zh: '' });
        setEditing(null);
    };

    const startEdit = (c: PromotionCategory) => {
        setEditing(c);
        setName({ ko: c.name, en: c.nameEn ?? '', zh: c.nameZh ?? '' });
    };

    const submit = async () => {
        if (!name.ko.trim()) return alert('한국어 카테고리명을 입력하세요.');
        setBusy(true);
        try {
            const data = {
                name: name.ko.trim(),
                nameEn: name.en.trim(),
                nameZh: name.zh.trim(),
                order: editing?.order ?? Date.now(),
            };
            if (editing) await updatePromotionCategory(editing.id, data);
            else await addPromotionCategory(data);
            reset();
            onChanged();
        } catch {
            alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setBusy(false);
        }
    };

    const onDelete = async (id: string) => {
        if (!confirm('이 카테고리를 삭제할까요? 속해 있던 프로모션은 미분류로 남습니다.')) return;
        setBusy(true);
        try {
            await deletePromotionCategory(id);
            if (editing?.id === id) reset();
            onChanged();
        } catch {
            alert('삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setBusy(false);
        }
    };

    const onDragEnd = async (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldIdx = categories.findIndex((c) => c.id === active.id);
        const newIdx = categories.findIndex((c) => c.id === over.id);
        const reordered = arrayMove(categories, oldIdx, newIdx);
        await reorderPromotionCategories(reordered);
        onChanged();
    };

    return (
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="space-y-5 p-6 sm:p-8">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#3a322c]">카테고리</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        추가한 카테고리는 프로모션 페이지 탭으로 보이고, 아래에서 상품을 나눠 관리합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            한국어 <span className="text-rose-500">*</span>
                        </span>
                        <input
                            value={name.ko}
                            onChange={(e) => setName((prev) => ({ ...prev, ko: e.target.value }))}
                            placeholder="예: 리프팅"
                            className={inputBase}
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">English</span>
                        <input
                            value={name.en}
                            onChange={(e) => setName((prev) => ({ ...prev, en: e.target.value }))}
                            placeholder="Lifting"
                            className={inputBase}
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">中文</span>
                        <input
                            value={name.zh}
                            onChange={(e) => setName((prev) => ({ ...prev, zh: e.target.value }))}
                            placeholder="提升"
                            className={inputBase}
                        />
                    </label>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    {editing && (
                        <button
                            type="button"
                            onClick={reset}
                            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-600"
                        >
                            취소
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy}
                        className="rounded-xl bg-[#3a322c] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {busy ? '저장 중…' : editing ? '카테고리 수정' : '카테고리 추가'}
                    </button>
                </div>

                {categories.length > 0 && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-2">
                                {categories.map((c) => (
                                    <SortableRow
                                        key={c.id}
                                        category={c}
                                        editing={editing?.id === c.id}
                                        onEdit={startEdit}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
