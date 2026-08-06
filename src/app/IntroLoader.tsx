'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { EASE } from '@/lib/motion';

const COUNT_FROM = 10; // 10 → 0 으로 수렴. 0 은 OO 로 읽힌다
const ENTER = 0.6; // 등장
const SPIN = 1.0; // 모래시계가 한 바퀴 도는 시간
const TICK = 0.26; // 한 칸당 초
const FALL = COUNT_FROM * TICK; // 모래가 다 올라가는 시간
const HOLD = 0.8; // OO 에서 머무는 시간
const SEEN_KEY = 'haruyoung:intro-seen';

/**
 * 브랜드 인트로.
 * 모래시계가 한 바퀴 돌고 나면 모래가 아래에서 위로 거슬러 올라가고,
 * HA : RU : 10 → … → HA : RU : OO 로 수렴하면 위로 걷히며 히어로가 드러난다.
 *
 * 세션당 1회, 클릭하면 즉시 건너뛴다. 모션 최소화면 아예 뜨지 않는다.
 * 개발 중 다시 보려면 콘솔에서 sessionStorage.clear() 후 새로고침.
 */
export default function IntroLoader() {
    const reduced = useReducedMotion();
    const [open, setOpen] = useState(true);
    const [count, setCount] = useState(COUNT_FROM);

    useEffect(() => {
        if (reduced || sessionStorage.getItem(SEEN_KEY)) {
            const raf = requestAnimationFrame(() => setOpen(false));
            return () => cancelAnimationFrame(raf);
        }
        window.scrollTo(0, 0);
        document.body.classList.add('overflow-hidden');

        // 등장과 회전이 끝난 뒤에 카운트를 시작한다
        let tick: ReturnType<typeof setInterval>;
        const start = setTimeout(
            () => {
                tick = setInterval(() => setCount((c) => (c > 0 ? c - 1 : c)), TICK * 1000);
            },
            (ENTER + SPIN) * 1000,
        );
        const end = setTimeout(
            () => {
                sessionStorage.setItem(SEEN_KEY, '1');
                setOpen(false);
            },
            (ENTER + SPIN + FALL + HOLD) * 1000,
        );

        return () => {
            clearTimeout(start);
            clearInterval(tick);
            clearTimeout(end);
            document.body.classList.remove('overflow-hidden');
        };
    }, [reduced]);

    useEffect(() => {
        if (!open) document.body.classList.remove('overflow-hidden');
    }, [open]);

    const skip = () => {
        sessionStorage.setItem(SEEN_KEY, '1');
        setOpen(false);
    };

    // 0 은 숫자가 아니라 로고의 OO 로 마무리한다
    const slot = count === 0 ? 'OO' : String(count).padStart(2, '0');

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    aria-hidden
                    onClick={skip}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 1.3, ease: EASE, delay: 0.25 }}
                    className="bg-intro fixed inset-0 z-60 overflow-hidden"
                >
                    {/* 질감. 매끈한 그라디언트만 있으면 화면이 비어 보인다 */}
                    <Image
                        src="/images/bg-sub-01.jpg"
                        alt=""
                        fill
                        quality={90}
                        sizes="100vw"
                        className="object-cover opacity-[0.07] mix-blend-soft-light"
                    />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: ENTER, ease: EASE }}
                        className="relative flex h-full flex-col items-center justify-center px-6"
                    >
                        {/* 한 바퀴 돌고 나서 모래가 거슬러 올라간다 */}
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: SPIN, delay: ENTER, ease: EASE }}
                        >
                            <Hourglass seconds={FALL} delay={ENTER + SPIN} reverse />
                        </motion.div>

                        <p className="mt-14 font-display text-24 leading-none tracking-[0.24em] text-cream lg:mt-16 lg:text-32">
                            HA : RU : <span className="inline-block w-[2.5em] text-left tabular-nums">{slot}</span>
                        </p>

                        <p className="mt-7 text-caption-sm tracking-[0.3em] text-beige/60 lg:mt-8">
                            하루의 쉼표가 만드는 영원한 시간
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * 모래시계.
 * 입체 그라디언트나 프레임 기둥을 넣으면 클립아트가 된다. 모노라인 + 평면 채움으로 간다.
 * reverse 면 아래 벌브가 줄고 위 벌브가 차오른다 — 시간을 거스르는 방향.
 * clip 은 반드시 <g> 에 걸어야 한다. 움직이는 요소에 직접 걸면 클립도 같이 변형돼 모래가 밖으로 샌다.
 */
function Hourglass({ seconds, delay = 0, reverse = false }: { seconds: number; delay?: number; reverse?: boolean }) {
    const flow = { duration: seconds, delay, ease: 'linear' as const };
    const top = reverse ? { from: 0, to: 1 } : { from: 1, to: 0 };
    const bottom = reverse ? { from: 1, to: 0 } : { from: 0, to: 1 };
    const glass = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const };

    return (
        <svg viewBox="0 0 100 150" aria-hidden className="h-40 w-auto text-beige lg:h-52">
            <defs>
                <clipPath id="hg-top">
                    <path d="M22 12 C22 48 50 62 50 75 C50 62 78 48 78 12 Z" />
                </clipPath>
                <clipPath id="hg-bottom">
                    <path d="M22 138 C22 102 50 88 50 75 C50 88 78 102 78 138 Z" />
                </clipPath>
            </defs>

            {/* 위 벌브 — 목에서부터 차오른다 */}
            <g clipPath="url(#hg-top)">
                <motion.rect
                    x="18"
                    y="12"
                    width="64"
                    height="63"
                    className="fill-tan"
                    style={{ transformBox: 'view-box', transformOrigin: '50px 75px' }}
                    initial={{ scaleY: top.from }}
                    animate={{ scaleY: top.to }}
                    transition={flow}
                />
            </g>

            {/* 아래 벌브 — 더미가 줄어든다 */}
            <g clipPath="url(#hg-bottom)">
                <motion.path
                    d="M18 140 L18 132 C27 112 73 112 82 132 L82 140 Z"
                    className="fill-tan"
                    style={{ transformBox: 'view-box', transformOrigin: '50px 138px' }}
                    initial={{ scaleY: bottom.from }}
                    animate={{ scaleY: bottom.to }}
                    transition={flow}
                />
            </g>

            {/* 목을 지나는 줄기 */}
            <motion.path
                d="M50 75 V96"
                className="stroke-tan"
                strokeWidth="1.4"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.25, 0.85, 0.25] }}
                transition={{ duration: 1.2, delay, repeat: Infinity, ease: 'linear' }}
            />

            {/* 유리와 캡 */}
            <path d="M22 12 C22 48 50 62 50 75 C50 88 22 102 22 138" {...glass} strokeWidth="2.4" />
            <path d="M78 12 C78 48 50 62 50 75 C50 88 78 102 78 138" {...glass} strokeWidth="2.4" />
            <path d="M14 10 H86 M14 140 H86" {...glass} strokeWidth="3.2" />
        </svg>
    );
}
