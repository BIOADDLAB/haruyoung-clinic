'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const RAIL = 104; // PC 좌측 헤더 레일 폭

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
 * 히어로부터 마지막 섹션까지 전부 한 줄로 이어 붙이고, 푸터만 트랙 밖에 둔다.
 * 스크롤 거리와 가로 이동 거리가 1:1이라 해시(#id) → 좌표 계산이 그대로 성립한다.
 * PC + 모션 허용일 때만 동작하고, 그 외에는 세로 스택으로 폴백한다.
 *
 * [2안] CSS scroll-snap + overflow-x-auto 로도 구현 가능하지만
 * 세로 휠로 넘어가지 않아 시안의 스크롤 감각이 나오지 않아 채택하지 않음.
 */
export default function HorizontalScroll({ children }: { children: ReactNode }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [horizontal, setHorizontal] = useState(false);
    const [distance, setDistance] = useState(0);
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
            setDistance(0);
            return;
        }
        // clientWidth 는 세로 스크롤바를 제외한 실제 가용 폭 (100vw 는 포함해서 어긋난다)
        const avail = document.documentElement.clientWidth - RAIL;
        wrap.style.setProperty('--avail', `${avail}px`);
        const total = Array.from(track.children).reduce((sum, el) => sum + (el as HTMLElement).offsetWidth, 0);
        setDistance(Math.max(0, total - avail));
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
        if (!distance) return;
        const goto = () => {
            const hash = window.location.hash.slice(1);
            if (!hash) return;
            const el = trackRef.current?.querySelector<HTMLElement>(`#${CSS.escape(hash)}`);
            if (!el || !wrapRef.current) return;
            window.scrollTo({ top: wrapRef.current.offsetTop + Math.min(el.offsetLeft, distance), behavior: 'smooth' });
        };
        goto();
        window.addEventListener('hashchange', goto);
        return () => window.removeEventListener('hashchange', goto);
    }, [distance]);

    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });
    const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

    return (
        <div ref={wrapRef} style={horizontal ? { height: distance + viewH } : undefined} className="relative">
            <div className={horizontal ? 'sticky top-0 h-dvh overflow-hidden' : ''}>
                <motion.div
                    ref={trackRef}
                    data-horizontal={horizontal}
                    style={horizontal ? { x } : undefined}
                    className="h-track flex w-full flex-col"
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
