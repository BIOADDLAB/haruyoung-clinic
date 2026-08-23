'use client';

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useRef, useState } from 'react';
import CategoryManager from './CategoryManager';
import PromotionForm from './PromotionForm';
import { getPromotionCategories } from '@/lib/promotionCategories';
import { deletePromotion, getPromotions, reorderPromotions } from '@/lib/promotions';
import { daysLeft, discountRate, type Promotion, type PromotionCategory } from '@/types/promotion';

const UNCATEGORIZED = '__uncategorized';

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
    const left = p.isOngoing ? null : daysLeft(p.until);

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className={`w-full max-w-[800px] rounded-lg border bg-cream p-5 lg:p-6 ${
                editing ? 'border-dark ring-1 ring-dark' : 'border-beige'
            }`}
        >
            {/* 홈 프로모션 카드와 같은 규격 */}
            <div className="flex items-start gap-3">
                <button {...attributes} {...listeners} className="cursor-grab pt-1 text-dark/35">
                    ⠿
                </button>
                <h3 className="min-w-0 flex-1 text-18 font-bold text-dark lg:text-20">{p.name}</h3>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="text-small font-medium text-brown">{p.highlight}</p>
                <p className="shrink-0 text-caption text-dark/60">
                    {left === null
                        ? '상시 진행'
                        : `~${p.until} (${left < 0 ? '마감됨' : left === 0 ? '오늘 마감' : `${left}일 남음`})`}
                </p>
            </div>

            {p.description && (
                <p className="mt-6 whitespace-pre-line text-caption leading-[1.7] text-dark/85">{p.description}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
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
                <span className="text-20 font-bold text-dark lg:text-24">{p.price.toLocaleString()}원</span>
            </div>
        </div>
    );
}

export default function PromotionsPage() {
    const [all, setAll] = useState<Promotion[]>([]);
    const [categories, setCategories] = useState<PromotionCategory[]>([]);
    const [menu, setMenu] = useState<string>(UNCATEGORIZED);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Promotion | null>(null);
    const [formVersion, setFormVersion] = useState(0);
    const sensors = useSensors(useSensor(PointerSensor));
    const formRef = useRef<HTMLDivElement>(null);

    /** 수정을 누르면 폼이 화면 밖에 있을 수 있다. 폼으로 데려간다 */
    const edit = (item: typeof editing) => {
        setEditing(item);
        if (item) {
            const inCategory = item.categoryId && categories.some((c) => c.id === item.categoryId);
            setMenu(inCategory ? item.categoryId! : UNCATEGORIZED);
        }
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const load = async () => {
        const [promos, cats] = await Promise.all([getPromotions(), getPromotionCategories()]);
        setAll(promos);
        setCategories(cats);
        setMenu((prev) => {
            if (prev === UNCATEGORIZED) return prev;
            return cats.some((c) => c.id === prev) ? prev : (cats[0]?.id ?? UNCATEGORIZED);
        });
        setLoading(false);
    };

    // effect 안에서 동기 setState 를 부르면 lint 가 잡는다. then 안에서 바꾼다
    useEffect(() => {
        let alive = true;
        Promise.all([getPromotions(), getPromotionCategories()]).then(([promos, cats]) => {
            if (!alive) return;
            setAll(promos);
            setCategories(cats);
            setMenu(cats[0]?.id ?? UNCATEGORIZED);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const list =
        menu === UNCATEGORIZED
            ? all.filter((p) => !p.categoryId || !categories.some((c) => c.id === p.categoryId))
            : all.filter((p) => p.categoryId === menu);

    const onDragEnd = async (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldIdx = list.findIndex((p) => p.id === active.id);
        const newIdx = list.findIndex((p) => p.id === over.id);
        const reordered = arrayMove(list, oldIdx, newIdx);
        const others = all.filter((p) => !list.some((item) => item.id === p.id));
        setAll([...others, ...reordered]);
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
        setFormVersion((version) => version + 1);
        load();
    };

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">프로모션 관리</h1>

            <div className="mt-6">
                <CategoryManager categories={categories} onChanged={load} />
            </div>

            <div ref={formRef} className="mt-8">
                <PromotionForm
                    key={editing?.id ?? `new-${formVersion}`}
                    initial={editing ?? undefined}
                    categories={categories}
                    defaultCategoryId={menu === UNCATEGORIZED ? '' : menu}
                    onSaved={onSaved}
                    onCancel={() => setEditing(null)}
                />
            </div>

            <div className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
                {categories.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => setMenu(c.id)}
                        className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
                            menu === c.id ? 'bg-[#3a322c] text-white' : 'border border-black/10 bg-white'
                        }`}
                    >
                        {c.name}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => setMenu(UNCATEGORIZED)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
                        menu === UNCATEGORIZED ? 'bg-[#3a322c] text-white' : 'border border-black/10 bg-white'
                    }`}
                >
                    미분류
                </button>
            </div>

            <div className="mt-6">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={list.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-2">
                            {list.map((p) => (
                                <SortableCard
                                    key={p.id}
                                    p={p}
                                    onEdit={edit}
                                    onDelete={onDelete}
                                    editing={editing?.id === p.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                {list.length === 0 && <p className="text-neutral-400">이 카테고리에 프로모션이 없습니다.</p>}
            </div>
        </div>
    );
}
