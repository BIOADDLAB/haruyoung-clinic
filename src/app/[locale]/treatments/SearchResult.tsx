'use client';

import { useEffect, useMemo, useState } from 'react';
import CartToggle from '@/components/cart/CartToggle';
import { getProducts } from '@/lib/products';
import type { Product } from '@/types/product';
import { Link } from '@/i18n/navigation';

/** 헤더 바로검색이 /treatments?q= 로 보낸 결과를 보여준다 */
export default function SearchResult({ keyword }: { keyword: string }) {
    const [all, setAll] = useState<Product[] | null>(null);

    useEffect(() => {
        let alive = true;
        getProducts().then((data) => {
            if (alive) setAll(data);
        });
        return () => {
            alive = false;
        };
    }, []);

    // 시술명·분류·설명 어디에든 걸리면 결과에 넣는다
    const hits = useMemo(() => {
        if (!all || !keyword.trim()) return [];
        const q = keyword.trim().toLowerCase();
        return all.filter((p) =>
            [p.name, p.subCategory, p.mainCategory, p.menuCategory, p.description].join(' ').toLowerCase().includes(q),
        );
    }, [all, keyword]);

    return (
        <div className="px-6 pb-28 pt-8 lg:pb-24 lg:pl-12 lg:pr-0 lg:pt-16">
            <p className="text-small font-semibold">
                {keyword ? (
                    <>
                        &lsquo;{keyword}&rsquo; 검색 결과
                        {all && <span className="ml-2 text-caption font-normal text-dark/55">{hits.length}건</span>}
                    </>
                ) : (
                    '시술 검색'
                )}
            </p>

            {!keyword ? (
                <p className="pt-16 text-caption text-dark/50">왼쪽 메뉴에서 시술을 골라보세요.</p>
            ) : all === null ? (
                <p className="pt-16 text-caption text-dark/50">불러오는 중…</p>
            ) : hits.length === 0 ? (
                <p className="pt-16 text-caption text-dark/50">검색 결과가 없습니다. 다른 이름으로 찾아보세요.</p>
            ) : (
                <ul className="flex flex-col gap-4 pt-9">
                    {hits.map((p) => (
                        <li key={p.id} className="w-full max-w-[800px] rounded-lg border border-beige p-5 lg:p-6">
                            <Link
                                href={`/treatments/${p.menuSlug}`}
                                className="text-caption-sm text-dark/50 transition-colors duration-500 ease-brand hover:text-brown"
                            >
                                {p.menuCategory}
                                {p.mainCategory && ` · ${p.mainCategory}`}
                            </Link>
                            <h2 className="mt-2 whitespace-pre-line text-18 font-bold lg:text-20">{p.name}</h2>

                            {p.highlight && <p className="mt-2 text-small font-medium text-brown">{p.highlight}</p>}

                            {p.description && (
                                <p className="mt-6 whitespace-pre-line text-caption leading-[1.7] text-dark/85">
                                    {p.description}
                                </p>
                            )}

                            <div className="mt-3 flex justify-end">
                                {p.price === null ? (
                                    <span className="text-caption text-dark/50">가격 문의</span>
                                ) : (
                                    <CartToggle
                                        item={{
                                            key: `product:${p.id}`,
                                            name: p.name,
                                            price: p.price,
                                            category: p.menuCategory,
                                            description: p.description,
                                        }}
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
