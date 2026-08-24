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
    /**
     * true 면 화면에 들어온 뒤가 아니라 바로 등장한다.
     * 팝업처럼 새 탭·가려진 탭에서 열리면 whileInView 가 한 번도 안 떠서 카드가 투명으로 남는다.
     */
    immediate?: boolean;
}

// 자식 카드들을 0.12s 간격으로 순차 등장시키는 그룹
export function RevealGroup({ children, className, as = 'div', immediate = false, ...rest }: Props) {
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
            variants={stagger}
            initial="hidden"
            {...(immediate ? { animate: 'show' as const } : { whileInView: 'show' as const, viewport: VIEWPORT })}
            className={className}
            {...rest}
        >
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
