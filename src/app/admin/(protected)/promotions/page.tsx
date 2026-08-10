'use client';

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';
import PromotionForm from './PromotionForm';
import { deletePromotion, getPromotions, reorderPromotions } from '@/lib/promotions';
import { daysLeft, discountRate, type Promotion } from '@/types/promotion';

function SortableCard({
    p,
    onEdit,
    onDelete,
    editing,
}: {
    p: Promotion;
    onEdit: (p: Promotion) => void;
    onDelete: (id: string) => void;
    editing: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
    const left = daysLeft(p.until);

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className={`w-full max-w-[800px] rounded-lg border bg-cream p-6 ${
                editing ? 'border-dark ring-1 ring-dark' : 'border-beige'
            }`}
        >
            {/* 홈 프로모션 카드와 같은 규격 */}
            <div className="flex items-start gap-3">
                <button {...attributes} {...listeners} className="cursor-grab pt-1 text-dark/35">
                    ⠿
                </button>
                <h3 className="min-w-0 flex-1 text-20 font-bold text-dark">{p.name}</h3>
            </div>

            <div className="mt-4 flex items-baseline justify-between gap-6">
                <p className="text-small font-medium text-brown">{p.highlight}</p>
                <p className="shrink-0 text-caption text-dark/60">
                    ~{p.until} ({left < 0 ? '마감됨' : left === 0 ? '오늘 마감' : `${left}일 남음`})
                </p>
            </div>

            {p.description && (
                <p className="mt-6 whitespace-pre-line text-caption leading-[1.7] text-dark/85">{p.description}</p>
            )}

            <div className="mt-3 flex items-center justify-end gap-5">
                <button onClick={() => onEdit(p)} className="text-caption text-dark/55 hover:text-dark">
                    수정
                </button>
                <button onClick={() => onDelete(p.id)} className="text-caption text-red-500">
                    삭제
                </button>
                {discountRate(p) > 0 && (
                    <span className="flex h-6 items-center rounded-full bg-dark px-3 text-caption-sm font-semibold text-cream">
                        {discountRate(p)}%
                    </span>
                )}
                {p.originPrice > p.price && (
                    <span className="text-caption text-dark/45 line-through">{p.originPrice.toLocaleString()}원</span>
                )}
                <span className="text-24 font-bold text-dark">{p.price.toLocaleString()}원</span>
            </div>
        </div>
    );
}

export default function PromotionsPage() {
    const [all, setAll] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Promotion | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    const load = async () => {
        setAll(await getPromotions());
        setLoading(false);
    };

    // effect 안에서 동기 setState 를 부르면 lint 가 잡는다. then 안에서 바꾼다
    useEffect(() => {
        let alive = true;
        getPromotions().then((data) => {
            if (!alive) return;
            setAll(data);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const onDragEnd = async (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldIdx = all.findIndex((p) => p.id === active.id);
        const newIdx = all.findIndex((p) => p.id === over.id);
        const reordered = arrayMove(all, oldIdx, newIdx);
        setAll(reordered);
        await reorderPromotions(reordered);
    };

    const onDelete = async (id: string) => {
        if (!confirm('삭제할까요?')) return;
        await deletePromotion(id);
        if (editing?.id === id) setEditing(null);
        load();
    };

    const onSaved = () => {
        setEditing(null);
        load();
    };

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">프로모션 관리</h1>

            <div className="mt-6">
                <PromotionForm
                    key={editing?.id ?? 'new'}
                    initial={editing ?? undefined}
                    onSaved={onSaved}
                    onCancel={() => setEditing(null)}
                />
            </div>

            <div className="mt-8">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={all.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-2">
                            {all.map((p) => (
                                <SortableCard
                                    key={p.id}
                                    p={p}
                                    onEdit={setEditing}
                                    onDelete={onDelete}
                                    editing={editing?.id === p.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                {all.length === 0 && <p className="text-neutral-400">등록된 프로모션이 없습니다.</p>}
            </div>
        </div>
    );
}
