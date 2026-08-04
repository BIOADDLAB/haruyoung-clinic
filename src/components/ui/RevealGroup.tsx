'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

interface Props {
    children?: ReactNode;
    className?: string;
    as?: ElementType;
    id?: string;
    role?: string;
    'aria-label'?: string;
}

// 자식 카드들을 0.12s 간격으로 순차 등장시키는 그룹
export function RevealGroup({ children, className, as = 'div', ...rest }: Props) {
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
        <Tag variants={stagger} initial="hidden" whileInView="show" viewport={VIEWPORT} className={className} {...rest}>
            {children}
        </Tag>
    );
}

export function RevealItem({
    children,
    className,
    as = 'div',
    variants = fadeUp,
    ...rest
}: Props & { variants?: Variants }) {
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
        <Tag variants={variants} className={className} {...rest}>
            {children}
        </Tag>
    );
}
