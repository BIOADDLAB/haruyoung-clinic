'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { fadeUp, VIEWPORT } from '@/lib/motion';

interface Props {
    children?: ReactNode;
    className?: string;
    variants?: Variants;
    delay?: number;
    /** 시맨틱 태그 유지용. 기본 div */
    as?: ElementType;
    id?: string;
    role?: string;
    'aria-label'?: string;
}

// 스크롤 진입 시 1회 페이드업 — 사이트 애니메이션의 90%는 이걸로 처리
export default function Reveal({ children, className, variants = fadeUp, delay = 0, as = 'div', ...rest }: Props) {
    const reduced = useReducedMotion();

    if (reduced) {
        const Plain = as;
        return (
            <Plain className={className} {...rest}>
                {children}
            </Plain>
        );
    }

    const Tag = motion[as as 'div'] ?? motion.div;
    return (
        <Tag
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            transition={{ delay }}
            className={className}
            {...rest}
        >
            {children}
        </Tag>
    );
}
