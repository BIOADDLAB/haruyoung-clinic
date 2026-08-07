'use client';

import { useEffect, useState } from 'react';
import CartToggle from '@/components/cart/CartToggle';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { fadeUp } from '@/lib/motion';
import { getProducts } from '@/lib/products';
import type { Product } from '@/types/product';

/** 중제목을 앵커 id 로 바꾼다. 한글 id 는 HTML5 에서 유효하다 */
const anchorId = (s: string) => `sec-${s.replace(/\s+/g, '-')}`;

export default function TreatmentList({ slug, categoryName }: { slug: string; categoryName: string }) {
    const [list, setList] = useState<Product[] | null>(null);

    useEffect(() => {
        let alive = true;
        getProducts().then((all) => {
            if (alive) setList(all.filter((p) => p.menuSlug === slug));
        });
        return () => {
            alive = false;
        };
    }, [slug]);

    // 중제목을 등장 순서대로 모아 브레드크럼을 만든다
    const groups = list ? Array.from(new Set(list.map((p) => p.subCategory).filter(Boolean))) : [];

    // 각 그룹의 첫 시술 id. 그 카드에만 앵커를 심는다
    const firstOfGroup = new Map<string, string>();
    list?.forEach((p) => {
        if (p.subCategory && !firstOfGroup.has(p.subCategory)) firstOfGroup.set(p.subCategory, p.id);
    });

    return (
        <div className="pb-28 lg:pb-24">
            {groups.length > 0 ? (
                <nav aria-label="중제목 바로가기" className="px-6 pt-8 lg:pl-12 lg:pt-16">
                    <ul className="flex flex-wrap items-center text-small font-semibold">
                        {groups.map((g) => (
                            <li
                                key={g}
                                className="before:mx-2 before:text-dark/35 before:content-['|'] first:before:hidden"
                            >
                                <a
                                    href={`#${anchorId(g)}`}
                                    className="transition-colors duration-500 ease-brand hover:text-brown"
                                >
                                    {g}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            ) : (
                <p className="px-6 pt-8 text-small font-semibold lg:pl-12 lg:pt-16">{categoryName}</p>
            )}

            {/* 사진영역 896x195. 콘텐츠 좌측 끝에 붙는다 (시안 실측) */}
            {/* TODO: 카테고리 대표 이미지 확보 시 next/image 로 교체 */}
            <div
                role="img"
                aria-label={`하루영의원 ${categoryName} 대표 이미지`}
                className="mt-9 flex aspect-[896/195] w-full max-w-[896px] items-center justify-center bg-[#d9d9d9] text-caption text-dark/50"
            >
                사진영역
            </div>

            {list === null ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">불러오는 중…</p>
            ) : list.length === 0 ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:pl-12">준비 중인 시술입니다.</p>
            ) : (
                <RevealGroup as="ul" className="flex flex-col gap-4 px-6 pt-12 lg:pl-12 lg:pr-0">
                    {list.map((p) => (
                        <RevealItem
                            as="li"
                            key={p.id}
                            variants={fadeUp}
                            // 앵커로 뛰었을 때 고정 헤더 아래로 숨지 않게 여백을 준다
                            id={firstOfGroup.get(p.subCategory) === p.id ? anchorId(p.subCategory) : undefined}
                            className="w-full max-w-[800px] scroll-mt-32 rounded-lg shadow-[4px_4px_5px_rgba(0,0,0,0.05)] border border-dark/80 p-6 lg:scroll-mt-8"
                        >
                            <h2 className="text-lead font-extrabold ">{p.name}</h2>

                            {p.highlight && <p className="text-small font-bold text-brown mb-4">{p.highlight}</p>}

                            {p.description && (
                                <p className=" whitespace-pre-line text-caption font-medium leading-[1.7] text-dark ">
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
                                        }}
                                    />
                                )}
                            </div>
                        </RevealItem>
                    ))}
                </RevealGroup>
            )}
        </div>
    );
}
