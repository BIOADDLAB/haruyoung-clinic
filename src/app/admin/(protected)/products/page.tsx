'use client';

import { useEffect, useRef, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MENU_CATEGORIES } from '@/constants/categories';
import { getProducts, deleteProduct, reorderProducts, updateProduct } from '@/lib/products';
import ProductForm from '@/components/admin/ProductForm';
import { isProductVisible, tierCaption, usableTiers, type Product } from '@/types/product';

function adminPriceLabel(p: Product) {
    const tiers = usableTiers(p);
    if (tiers.length > 0) {
        return tiers
            .map((tier) => {
                const label = tierCaption(tier);
                return tier.price == null ? `${label} 문의` : `${label} ${tier.price.toLocaleString()}원`;
            })
            .join(' · ');
    }
    return p.price === null ? '가격 문의' : `${p.price.toLocaleString()}원`;
}

function SortableCard({
    p,
    onEdit,
    onHide,
    onDelete,
    editing,
}: {
    p: Product;
    onEdit: (p: Product) => void;
    onHide: (p: Product) => void;
    onDelete: (id: string) => void;
    editing: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : 1,
            }}
            className={`w-full max-w-[800px] rounded-lg border bg-cream p-5 lg:p-6 ${
                editing ? 'border-dark ring-1 ring-dark' : 'border-beige'
            } ${p.hidden ? 'opacity-55' : ''}`}
        >
            {/* 홈 시술 카드와 같은 규격: 폭 800 · p-6 · 제목 20 · 부제 16 brown · 설명 14 · 가격 22 */}
            <div className="flex items-start gap-3">
                <button {...attributes} {...listeners} className="cursor-grab pt-1 text-dark/35">
                    ⠿
                </button>

                <div className="min-w-0 flex-1">
                    <p className="text-caption-sm text-dark/45">
                        {p.subCategory || '(섹션 없음)'}
                        {p.hidden && <span className="ml-2 text-dark/70">숨김</span>}
                    </p>
                    <h3 className="mt-1 whitespace-pre-line text-18 font-bold text-dark lg:text-20">{p.name}</h3>
                    {p.highlight && <p className="mt-2 text-small font-medium text-brown">{p.highlight}</p>}
                    {p.description && (
                        <p className="mt-6 whitespace-pre-line text-caption leading-[1.7] text-dark/85">
                            {p.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
                <button onClick={() => onEdit(p)} className="text-caption text-dark/55 hover:text-dark">
                    수정
                </button>
                <button onClick={() => onHide(p)} className="text-caption text-dark/55 hover:text-dark">
                    {isProductVisible(p) ? '숨김' : '노출'}
                </button>
                <button onClick={() => onDelete(p.id)} className="text-caption text-red-500">
                    삭제
                </button>
                <span className="text-right text-20 font-bold text-dark lg:text-22">{adminPriceLabel(p)}</span>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const [all, setAll] = useState<Product[]>([]);
    const [menu, setMenu] = useState<string>(MENU_CATEGORIES[0].slug);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Product | null>(null);
    const [formVersion, setFormVersion] = useState(0);
    const sensors = useSensors(useSensor(PointerSensor));
    const formRef = useRef<HTMLDivElement>(null);

    /** 수정을 누르면 폼이 화면 밖에 있을 수 있다. 폼으로 데려간다 */
    const edit = (item: typeof editing) => {
        setEditing(item);
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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

    const onHide = async (p: Product) => {
        const hidden = isProductVisible(p);
        setAll((prev) => prev.map((item) => (item.id === p.id ? { ...item, hidden } : item)));
        if (editing?.id === p.id) setEditing({ ...p, hidden });
        await updateProduct(p.id, { hidden });
    };

    const onDelete = async (id: string) => {
        if (!confirm('삭제할까요?')) return;
        await deleteProduct(id);
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
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">수가표 관리</h1>

            {/* 폼: key로 편집 대상 바뀔 때 폼 리셋 */}
            <div ref={formRef} className="mt-6">
                <ProductForm
                    key={editing?.id ?? `new-${formVersion}`}
                    initial={editing ?? undefined}
                    allProducts={all}
                    onSaved={onSaved}
                    onCancel={() => setEditing(null)}
                />
            </div>

            {/* 대메뉴 탭 */}
            <div className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
                {MENU_CATEGORIES.map((c) => (
                    <button
                        key={c.slug}
                        onClick={() => setMenu(c.slug)}
                        className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
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
                                    onEdit={edit}
                                    onHide={onHide}
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
