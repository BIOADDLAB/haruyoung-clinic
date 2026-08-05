'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const RAIL = 106; // PC 좌측 헤더 레일 폭

/**
 * 가로 스크롤 패널 1칸.
 * width 를 생략하면 뷰포트 폭(레일 제외)을 채운다 — 히어로처럼 꽉 차는 패널용.
 * 고정 폭(--pw)은 트랙이 가로 모드일 때만 globals.css 규칙으로 적용된다.
 */
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
 * 히어로부터 마지막 섹션까지 한 줄로 이어 붙인다.
 *
 * 푸터는 아래로 이어지지 않는다. sticky 영역 뒤(z-0)에 미리 깔아두고
 * 트랙(z-10)이 왼쪽으로 완전히 빠져나가면서 드러나게 한다.
 * 그래서 이동량은 (합계 - 가용폭) 이 아니라 트랙 폭 '전체' 다.
 *
 * [2안] CSS scroll-snap + overflow-x-auto 로도 가능하지만
 * 세로 휠로 넘어가지 않아 시안의 스크롤 감각이 안 나와 채택하지 않음.
 */
export default function HorizontalScroll({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
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

    // 해시 진입: /about#specialist 같은 링크로 특정 패널까지 스크롤
    useEffect(() => {
        if (!travel) return;
        const goto = () => {
            const hash = window.location.hash.slice(1);
            if (!hash) return;
            const el = trackRef.current?.querySelector<HTMLElement>(`#${CSS.escape(hash)}`);
            if (!el || !wrapRef.current) return;
            window.scrollTo({ top: wrapRef.current.offsetTop + Math.min(el.offsetLeft, travel), behavior: 'smooth' });
        };
        goto();
        window.addEventListener('hashchange', goto);
        return () => window.removeEventListener('hashchange', goto);
    }, [travel]);

    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });
    const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

    return (
        <>
            <div ref={wrapRef} style={horizontal ? { height: travel + viewH } : undefined} className="relative">
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
