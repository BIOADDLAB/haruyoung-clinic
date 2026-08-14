'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import MoreView from '@/components/ui/MoreView';
import Reveal from '@/components/ui/Reveal';
import { RevealGroup, RevealItem } from '@/components/ui/RevealGroup';
import { slideRight } from '@/lib/motion';

/** 개별 페이지가 아직 없어서 링크가 아니다. 목록에 마우스를 올리면 More View 로 시선을 넘긴다 */
const PROMOTION_KEYS = ['event1', 'event2', 'event3'] as const;

export default function PromotionBoard() {
    const t = useTranslations('home');
    const tp = useTranslations('promoBoard');
    const [hot, setHot] = useState(false);
    const reduced = useReducedMotion();

    return (
        <div className="relative flex h-full items-center">
            <div className="mx-auto flex w-full flex-col gap-8 lg:max-w-[828px] lg:flex-row lg:items-center lg:gap-[11px]">
                <Reveal variants={slideRight} className="shrink-0 lg:w-[200px]">
                    <h2 className="font-display text-24">Promotion</h2>
                    <p className="mt-3.5 text-caption text-cream lg:whitespace-pre-line">{t('promotionLead')}</p>
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
                    <RevealGroup
                        as="ul"
                        className="flex flex-col border-y border-cream/35 lg:grid lg:grid-cols-3 lg:border-y-0"
                    >
                        {PROMOTION_KEYS.map((label, i) => (
                            <RevealItem
                                as="li"
                                key={label}
                                className={`flex items-center gap-4 px-1 py-5 text-left text-caption font-normal ${
                                    i < 2 ? 'border-b border-cream/25' : ''
                                } lg:justify-center lg:gap-0 lg:border-b-0 lg:border-cream/70 lg:px-2 lg:py-4 lg:text-center lg:text-small ${
                                    i < 2 ? 'lg:border-r' : 'lg:border-r-0'
                                }`}
                            >
                                <span className="font-display text-caption-sm tracking-[0.16em] text-cream/45 lg:hidden">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span aria-hidden="true" className="h-px w-8 bg-cream/35 lg:hidden" />
                                <span className="whitespace-nowrap tracking-[0.02em] lg:tracking-normal">
                                    {tp(label)}
                                </span>
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </div>
        </div>
    );
}
