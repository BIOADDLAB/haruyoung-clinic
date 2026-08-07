'use client';

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';
import PromotionForm from '@/components/admin/ProductForm';
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
            className={`flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm ${
                editing ? 'border-[#3a322c] ring-1 ring-[#3a322c]' : 'border-black/5'
            }`}
        >
            <button {...attributes} {...listeners} className="cursor-grab text-neutral-400">
                ⠿
            </button>
            <div className="flex-1">
                <div className="text-sm text-neutral-500">
                    {p.until} · {left < 0 ? '마감됨' : `${left}일 남음`}
                </div>
                <div className="font-medium">{p.name}</div>
            </div>
            <div className="text-sm">
                {discountRate(p) > 0 && <span className="mr-2 text-rose-500">{discountRate(p)}%</span>}
                {p.price.toLocaleString()}원
            </div>
            <button onClick={() => onEdit(p)} className="text-sm text-blue-600">
                수정
            </button>
            <button onClick={() => onDelete(p.id)} className="text-sm text-red-500">
                삭제
            </button>
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
            <h1 className="text-3xl font-bold text-[#3a322c]">프로모션 관리</h1>

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
