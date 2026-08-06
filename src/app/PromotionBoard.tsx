'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import MoreView from '@/components/ui/MoreView';
import Reveal from '@/components/ui/Reveal';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { slideRight } from '@/lib/motion';

/** 개별 페이지가 아직 없어서 링크가 아니다. 목록에 마우스를 올리면 More View 로 시선을 넘긴다 */
const PROMOTIONS = [
    'Welcome Event',
    '미백/색소 이벤트',
    '스킨케어 이벤트',
    '월별 이벤트',
    '영양주사 이벤트',
    '제모 이벤트',
];

export default function PromotionBoard() {
    const [hot, setHot] = useState(false);
    const reduced = useReducedMotion();

    return (
        <div className="relative flex h-full items-center">
            {/* 카테고리와 같은 828 컨테이너 · 같은 155/56/617 축 */}
            <div className="mx-auto flex w-full flex-col gap-8 lg:max-w-[828px] lg:flex-row lg:items-start lg:gap-[11px]">
                <Reveal variants={slideRight} className="shrink-0 lg:w-[200px]">
                    <h2 className="font-display text-24">Promotion</h2>
                    <p className="mt-3.5 text-caption text-cream">원하는 프로모션을 만나보세요.</p>
                    <motion.div
                        animate={hot && !reduced ? 'pulse' : 'rest'}
                        variants={{
                            rest: { scale: 1 },
                            pulse: {
                                scale: [1, 1.02, 1],
                                transition: { duration: 2.6, ease: [0.45, 0, 0.55, 1], repeat: Infinity },
                            },
                        }}
                        className="mt-7 inline-flex"
                    >
                        <MoreView href="/promotion" ariaLabel="프로모션 더 보기" />
                    </motion.div>
                </Reveal>

                <div
                    onMouseEnter={() => setHot(true)}
                    onMouseLeave={() => setHot(false)}
                    className="w-full lg:w-[617px] lg:shrink-0"
                >
                    {/* 모바일 2열 / PC 3열. 구간이 바뀌면 선 규칙도 같이 리셋해야 어긋나지 않는다 */}
                    <RevealGroup as="ul" className="grid grid-cols-2 lg:grid-cols-3">
                        {PROMOTIONS.map((label, i) => (
                            <RevealItem
                                as="li"
                                key={label}
                                className={`flex items-center justify-center border-cream/25 px-2 py-4 text-center text-caption font-normal lg:border-cream/70 lg:text-small ${
                                    i < 4 ? 'border-b' : ''
                                } ${i % 2 === 0 ? 'border-r' : ''} ${i < 3 ? 'lg:border-b' : 'lg:border-b-0'} ${
                                    i % 3 !== 2 ? 'lg:border-r' : 'lg:border-r-0'
                                }`}
                            >
                                {label}
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </div>
        </div>
    );
}
