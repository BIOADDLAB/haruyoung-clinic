'use client';

import { useEffect, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MENU_CATEGORIES } from '@/constants/categories';
import { getProducts, deleteProduct, reorderProducts } from '@/lib/products';
import ProductForm from '@/components/admin/ProductForm';
import type { Product } from '@/types/product';

function SortableCard({
    p,
    onEdit,
    onDelete,
    editing,
}: {
    p: Product;
    onEdit: (p: Product) => void;
    onDelete: (id: string) => void;
    editing: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
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
                <div className="text-sm text-neutral-500">{p.subCategory || '(중제목 없음)'}</div>
                <div className="font-medium">{p.name}</div>
            </div>
            <div className="text-sm">{p.price === null ? '-' : p.price.toLocaleString() + '원'}</div>
            <button onClick={() => onEdit(p)} className="text-sm text-blue-600">
                수정
            </button>
            <button onClick={() => onDelete(p.id)} className="text-sm text-red-500">
                삭제
            </button>
        </div>
    );
}

export default function ProductsPage() {
    const [all, setAll] = useState<Product[]>([]);
    const [menu, setMenu] = useState<string>(MENU_CATEGORIES[0].slug);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Product | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    /** 저장·삭제 후 다시 불러올 때 쓴다 */
    const load = async () => {
        setAll(await getProducts());
        setLoading(false);
    };

    // 첫 로드. effect 본문에서 load() 를 그대로 부르면 lint 가 동기 setState 로 잡는다.
    // then 안에서 바꾸고, 언마운트되면 반영하지 않는다.
    useEffect(() => {
        let alive = true;
        getProducts().then((data) => {
            if (!alive) return;
            setAll(data);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const list = all.filter((p) => p.menuSlug === menu);

    const onDragEnd = async (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldIdx = list.findIndex((p) => p.id === active.id);
        const newIdx = list.findIndex((p) => p.id === over.id);
        const reordered = arrayMove(list, oldIdx, newIdx);
        const others = all.filter((p) => p.menuSlug !== menu);
        setAll([...others, ...reordered]);
        await reorderProducts(reordered);
    };

    const onDelete = async (id: string) => {
        if (!confirm('삭제할까요?')) return;
        await deleteProduct(id);
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
            <h1 className="text-3xl font-bold text-[#3a322c]">수가표 관리</h1>

            {/* 폼: key로 편집 대상 바뀔 때 폼 리셋 */}
            <div className="mt-6">
                <ProductForm
                    key={editing?.id ?? 'new'}
                    initial={editing ?? undefined}
                    allProducts={all}
                    onSaved={onSaved}
                    onCancel={() => setEditing(null)}
                />
            </div>

            {/* 대메뉴 탭 */}
            <div className="mt-8 flex flex-wrap gap-2">
                {MENU_CATEGORIES.map((c) => (
                    <button
                        key={c.slug}
                        onClick={() => setMenu(c.slug)}
                        className={`rounded-full px-4 py-1.5 text-sm ${
                            menu === c.slug ? 'bg-[#3a322c] text-white' : 'border border-black/10 bg-white'
                        }`}
                    >
                        {c.name}
                    </button>
                ))}
            </div>

            {/* 목록 */}
            <div className="mt-6">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={list.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-2">
                            {list.map((p) => (
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
                {list.length === 0 && <p className="text-neutral-400">이 메뉴에 시술이 없습니다.</p>}
            </div>
        </div>
    );
}
