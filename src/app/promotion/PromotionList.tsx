'use client';

import { useEffect, useState } from 'react';
import CartToggle from '@/components/cart/CartToggle';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { fadeUp } from '@/lib/motion';
import { getPromotions } from '@/lib/promotions';
import { daysLeft, type Promotion } from '@/types/promotion';

export default function PromotionList() {
    const [list, setList] = useState<Promotion[] | null>(null);

    useEffect(() => {
        let alive = true;
        getPromotions().then((all) => {
            // 마감일이 지난 항목은 감춘다. 관리자가 지우지 않아도 알아서 내려간다
            if (alive) setList(all.filter((p) => daysLeft(p.until) >= 0));
        });
        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="pb-28 lg:pb-24">
            <p className="px-6 pt-8 text-small font-semibold lg:px-12 lg:pt-16">프로모션</p>

            {/* TODO: 프로모션 대표 이미지 확보 시 next/image 로 교체 */}
            <div
                role="img"
                aria-label="하루영의원 프로모션 대표 이미지"
                className="mt-6 flex aspect-[896/195] w-full max-w-[896px] items-center justify-center bg-[#d9d9d9] text-caption text-dark/50 lg:mt-8"
            >
                사진영역
            </div>

            {list === null ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:px-12">불러오는 중…</p>
            ) : list.length === 0 ? (
                <p className="px-6 pt-16 text-caption text-dark/50 lg:px-12">진행 중인 프로모션이 없습니다.</p>
            ) : (
                <RevealGroup as="ul" className="flex flex-col gap-4 px-6 pt-12 lg:pl-12 lg:pr-0 lg:pt-14">
                    {list.map((p) => {
                        const left = daysLeft(p.until);
                        return (
                            <RevealItem
                                as="li"
                                key={p.id}
                                variants={fadeUp}
                                className="w-full max-w-[800px] border border-beige p-6"
                            >
                                <h2 className="flex flex-wrap items-baseline gap-3 text-20 font-bold">
                                    {p.name}
                                    <span className="font-gara text-small italic font-normal text-brown">event</span>
                                </h2>

                                {p.highlight && <p className="mt-3 text-small font-medium text-brown">{p.highlight}</p>}

                                {p.description && (
                                    <p className="mt-7 whitespace-pre-line text-caption leading-[1.7] text-dark/80">
                                        {p.description}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-col items-end gap-1.5">
                                    <p className="text-caption-sm text-brown">
                                        ~ {p.until}
                                        <span className="ml-1">({left === 0 ? '오늘 마감' : `${left}일 남음`})</span>
                                    </p>
                                    <CartToggle
                                        item={{
                                            key: `promotion:${p.id}`,
                                            name: p.name,
                                            price: p.price,
                                            category: '프로모션',
                                        }}
                                        origin={p.originPrice}
                                    />
                                </div>
                            </RevealItem>
                        );
                    })}
                </RevealGroup>
            )}
        </div>
    );
}
