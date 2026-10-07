'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import ColumnForm from './ColumnForm';
import { MENU_CATEGORIES } from '@/constants/categories';
import { deleteColumn, getColumns } from '@/lib/columns';
import { type Column } from '@/types/column';

function categoryName(slug: string) {
    return MENU_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

function langBadges(c: Column) {
    const badges: { label: string; cls: string }[] = [
        c.published
            ? { label: 'KO 발행', cls: 'bg-emerald-500 text-white' }
            : { label: 'KO 임시저장', cls: 'bg-neutral-300 text-neutral-700' },
    ];
    for (const [lang, tr] of [
        ['EN', c.en],
        ['ZH', c.zh],
    ] as const) {
        if (!tr?.content) badges.push({ label: `${lang} 미번역`, cls: 'bg-neutral-100 text-neutral-400' });
        else if (!tr.approved) badges.push({ label: `${lang} AI 초안`, cls: 'bg-amber-400 text-white' });
        else badges.push({ label: `${lang} 검수 완료`, cls: 'bg-emerald-500 text-white' });
    }
    return badges;
}

export default function ColumnsPage() {
    return (
        <Suspense fallback={null}>
            <ColumnsAdmin />
        </Suspense>
    );
}

/**
 * 작성/수정 화면 여부를 URL 쿼리(?new=1, ?edit=id)로 관리한다.
 * 내부 상태로 두면 좌측 메뉴의 '칼럼 관리'(/admin/columns)를 다시 눌러도
 * 같은 경로라 화면이 초기화되지 않는다.
 */
function ColumnsAdmin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const creating = searchParams.get('new') === '1';
    const editId = searchParams.get('edit');

    const [items, setItems] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        // setState 를 effect 본문에서 동기로 부르지 않도록 로딩 표시는 초기값으로만 쓴다
        try {
            setItems(await getColumns());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const remove = async (c: Column) => {
        if (!window.confirm(`'${c.title}' 칼럼을 삭제할까요? 되돌릴 수 없습니다.`)) return;
        await deleteColumn(c);
        void load();
    };

    const backToList = () => router.push('/admin/columns');

    const editing = editId ? (items.find((c) => c.id === editId) ?? null) : null;

    // 수정 대상을 아직 불러오는 중이면 폼 대신 로딩만 보여준다
    if (editId && loading) {
        return <p className="py-16 text-center text-sm text-neutral-400">불러오는 중…</p>;
    }

    if (creating || editing) {
        return (
            <ColumnForm
                key={editing?.id ?? 'new'}
                initial={editing ?? undefined}
                onSaved={() => {
                    void load();
                    backToList();
                }}
                onCancel={backToList}
            />
        );
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[#3a322c]">칼럼 관리</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        피부 건강 칼럼을 작성·발행합니다. 번역은 검수 완료한 언어만 공개됩니다.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/admin/columns?new=1')}
                    className="rounded-xl bg-[#3a322c] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    새 칼럼 작성
                </button>
            </div>

            <div className="mt-8 flex flex-col gap-4">
                {loading ? (
                    <p className="py-16 text-center text-sm text-neutral-400">불러오는 중…</p>
                ) : items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-400">
                        아직 작성된 칼럼이 없습니다.
                    </p>
                ) : (
                    items.map((c) => (
                        <div
                            key={c.id}
                            className="flex w-full max-w-[900px] items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4"
                        >
                            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                                {c.coverImage && (
                                    <Image src={c.coverImage} alt="" fill unoptimized className="object-cover" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] text-neutral-500">
                                        {categoryName(c.category)}
                                    </span>
                                    <span className="text-xs text-neutral-400">{c.publishedAt}</span>
                                </div>
                                <p className="mt-1.5 truncate font-semibold text-[#3a322c]">{c.title}</p>
                                <p className="mt-0.5 truncate text-xs text-neutral-400">/column/{c.slug}</p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {langBadges(c).map((b) => (
                                        <span key={b.label} className={`rounded-full px-2 py-0.5 text-[11px] ${b.cls}`}>
                                            {b.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                                <button
                                    onClick={() => router.push(`/admin/columns?edit=${c.id}`)}
                                    className="text-sm text-neutral-500 hover:text-[#3a322c]"
                                >
                                    수정
                                </button>
                                <button onClick={() => void remove(c)} className="text-sm text-rose-500">
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
