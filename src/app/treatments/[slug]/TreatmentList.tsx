'use client';

import { useEffect, useState } from 'react';
import CartToggle from '@/components/cart/CartToggle';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { getProducts } from '@/lib/products';
import { fadeUp } from '@/lib/motion';
import type { Product } from '@/types/product';

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

    return (
        <div className="pb-28 lg:pb-24">
            <p className="px-6 pt-8 text-small font-semibold lg:px-12 lg:pt-16">
                {groups.length > 0 ? groups.join(' | ') : categoryName}
            </p>

            {/* 사진영역 896x195. 콘텐츠 좌측에 붙는다 (시안 실측) */}
            {/* TODO: 카테고리 대표 이미지 확보 시 next/image 로 교체 */}
            <div
                role="img"
                aria-label={`하루영의원 ${categoryName} 대표 이미지`}
                className="mt-6 flex aspect-[896/195] w-full max-w-[896px] items-center justify-center bg-[#d9d9d9] text-caption text-dark/50 lg:mt-8"
            >
                사진영역
            </div>

            {list === null ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:px-12">불러오는 중…</p>
            ) : list.length === 0 ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:px-12">준비 중인 시술입니다.</p>
            ) : (
                <RevealGroup as="ul" className="flex flex-col gap-4 px-6 pt-12 lg:pl-12 lg:pr-0 lg:pt-14">
                    {list.map((p) => (
                        <RevealItem
                            as="li"
                            key={p.id}
                            variants={fadeUp}
                            className="w-full max-w-[800px] border border-beige p-6"
                        >
                            <h2 className="text-20 font-bold">{p.name}</h2>

                            {p.highlight && <p className="mt-3 text-small font-medium text-brown">{p.highlight}</p>}

                            {p.description && (
                                <p className="mt-7 whitespace-pre-line text-caption leading-[1.7] text-dark/80">
                                    {p.description}
                                </p>
                            )}

                            <div className="mt-4 flex justify-end">
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
