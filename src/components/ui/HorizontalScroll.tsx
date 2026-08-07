'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const RAIL = 106;

export function Panel({
    id,
    width,
    className = '',
    children,
}: {
    id?: string;
    width?: number;
    className?: string;
    children: ReactNode;
}) {
    return (
        <section
            id={id}
            style={
                {
                    '--pw': width ? `${width}px` : 'var(--avail, calc(100vw - var(--spacing-rail)))',
                } as React.CSSProperties
            }
            className={`h-panel relative w-full shrink-0 ${className}`}
        >
            {children}
        </section>
    );
}

/**
 * 세로 스크롤을 가로 이동으로 바꾸는 sticky 트랙.
 */
export default function HorizontalScroll({
    children,
    footer,
    holdStart = 0,
}: {
    children: ReactNode;
    footer?: ReactNode;
    /** 트랙을 움직이기 전에 첫 패널을 제자리에 고정해 둘 스크롤 거리(px). 히어로 연출용 */
    holdStart?: number;
}) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [horizontal, setHorizontal] = useState(false);
    const [travel, setTravel] = useState(0);
    const [viewH, setViewH] = useState(0);
    const reduced = useReducedMotion();

    // 1단계: 가로 모드 여부만 판정한다
    useEffect(() => {
        const decide = () => setHorizontal(window.matchMedia('(min-width: 1024px)').matches && !reduced);
        decide();
        window.addEventListener('resize', decide);
        return () => window.removeEventListener('resize', decide);
    }, [reduced]);

    // 2단계: 가로 레이아웃이 DOM에 반영된 뒤에 실제 폭을 잰다
    const measure = useCallback(() => {
        const wrap = wrapRef.current;
        const track = trackRef.current;
        if (!wrap || !track) return;
        setViewH(window.innerHeight);
        if (!horizontal) {
            setTravel(0);
            return;
        }
        // clientWidth 는 세로 스크롤바를 제외한 실제 가용 폭 (100vw 는 포함해서 어긋난다)
        const avail = document.documentElement.clientWidth - RAIL;
        wrap.style.setProperty('--avail', `${avail}px`);
        setTravel(Array.from(track.children).reduce((sum, el) => sum + (el as HTMLElement).offsetWidth, 0));
    }, [horizontal]);

    useEffect(() => {
        // 가로 레이아웃이 페인트된 다음 프레임에 측정한다
        const raf = requestAnimationFrame(measure);
        window.addEventListener('resize', measure);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', measure);
        };
    }, [measure]);

    useEffect(() => {
        if (!travel) return;
        let first = true;
        const goto = () => {
            const wrap = wrapRef.current;
            if (!wrap) return;
            const hash = window.location.hash.slice(1);
            const el = hash ? trackRef.current?.querySelector<HTMLElement>(`#${CSS.escape(hash)}`) : null;
            window.scrollTo({
                top: el ? wrap.offsetTop + holdStart + Math.min(el.offsetLeft, travel) : wrap.offsetTop,
                behavior: first ? 'auto' : 'smooth',
            });
            first = false;
        };
        goto();
        window.addEventListener('hashchange', goto);
        return () => window.removeEventListener('hashchange', goto);
    }, [travel, holdStart]);

    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });

    // 앞쪽 holdStart 구간은 x 를 0 으로 붙잡아 첫 패널을 핀 시킨다
    const scrollLen = holdStart + travel;
    const holdRatio = scrollLen > 0 ? holdStart / scrollLen : 0;
    const x = useTransform(
        scrollYProgress,
        holdRatio > 0 ? [0, holdRatio, 1] : [0, 1],
        holdRatio > 0 ? [0, 0, -travel] : [0, -travel],
    );

    return (
        <>
            <div ref={wrapRef} style={horizontal ? { height: scrollLen + viewH } : undefined} className="relative">
                <div className={horizontal ? 'sticky top-0 h-dvh overflow-hidden' : ''}>
                    {horizontal && footer && <div className="footer-behind">{footer}</div>}

                    <motion.div
                        ref={trackRef}
                        data-horizontal={horizontal}
                        style={horizontal ? { x } : undefined}
                        className="h-track relative z-10 flex w-full flex-col"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>

            {/* 세로 폴백에서는 트랙 아래에 그냥 붙는다 */}
            {!horizontal && footer}
        </>
    );
}
