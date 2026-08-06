'use client';

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DUR, EASE } from '@/lib/motion';

// #TODO: 모바일에서는 애니메이션 다르게 가기
// 히어로 애니메이션을 위해 핀 고정 추가
export const HERO_HOLD = 300;

const COUNT_FROM = 10; // 10 → 0 으로 수렴
const TICK = 0.26; // 한 칸당 초
const INTRO_SEC = COUNT_FROM * TICK; // 모래가 다 올라가는 시간
const SEEN_KEY = 'haruyoung:intro-seen';

export default function HeroVisual() {
    const reduced = useReducedMotion();
    const { scrollY } = useScroll();
    const [count, setCount] = useState<number | null>(COUNT_FROM); // null = 인트로 종료

    const scale = useTransform(scrollY, [0, HERO_HOLD], [1, 1.18]);
    const y = useTransform(scrollY, [0, HERO_HOLD], [0, 200]);
    const opacity = useTransform(scrollY, [0, HERO_HOLD * 0.75], [1, 0]);

    // 카운트다운. 모션 최소화거나 이미 본 세션이면 건너뛴다
    useEffect(() => {
        if (reduced || sessionStorage.getItem(SEEN_KEY)) {
            const raf = requestAnimationFrame(() => setCount(null));
            return () => cancelAnimationFrame(raf);
        }
        const tick = setInterval(() => setCount((c) => (c !== null && c > 0 ? c - 1 : c)), TICK * 1000);
        const end = setTimeout(
            () => {
                setCount(null);
                sessionStorage.setItem(SEEN_KEY, '1');
            },
            INTRO_SEC * 1000 + 400,
        );
        return () => {
            clearInterval(tick);
            clearTimeout(end);
        };
    }, [reduced]);

    // 스크롤이나 클릭하면 즉시 건너뛴다
    useEffect(() => {
        const skip = () => {
            setCount(null);
            sessionStorage.setItem(SEEN_KEY, '1');
        };
        const opt = { once: true, passive: true } as const;
        window.addEventListener('wheel', skip, opt);
        window.addEventListener('touchmove', skip, opt);
        window.addEventListener('click', skip, { once: true });
        return () => {
            window.removeEventListener('wheel', skip);
            window.removeEventListener('touchmove', skip);
            window.removeEventListener('click', skip);
        };
    }, []);

    const intro = count !== null;

    return (
        <>
            <motion.div style={reduced ? undefined : { scale }} className="absolute inset-0 origin-center">
                <Image
                    src="/images/bg-hero.jpg"
                    alt="하루영의원 리셉션 라운지 메인 비주얼"
                    fill
                    priority
                    quality={95}
                    /* 확대되므로 화면 폭보다 큰 소스를 받는다 */
                    sizes="125vw"
                    className="object-cover"
                />
            </motion.div>

            <div className="absolute inset-0 bg-dark/25" />

            <motion.div
                style={reduced ? undefined : { y, opacity }}
                className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-cream"
            >
                <motion.div
                    initial={reduced ? false : { opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.slow, ease: EASE }}
                >
                    {/* h1 은 항상 최종 문구. 인트로 동안만 시각적으로 감추고 시계 표기를 겹친다 */}
                    <div className="relative">
                        <h1
                            className={`font-display text-40 font-normal leading-13 transition-opacity duration-700 ease-brand [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)] ${
                                intro ? 'opacity-0' : 'opacity-100'
                            }`}
                        >
                            A Moment of Pause,
                            <br />
                            Timeless Beauty
                        </h1>

                        <AnimatePresence>
                            {intro && (
                                <motion.span
                                    key="clock"
                                    aria-hidden
                                    exit={{ opacity: 0, filter: 'blur(6px)' }}
                                    transition={{ duration: DUR.base, ease: EASE }}
                                    className="absolute inset-0 flex items-center justify-center font-display text-40 font-normal tracking-[0.08em] [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)]"
                                >
                                    HA : RU : OO
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <p className="mt-5 text-30 font-normal [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)]">
                        하루의 쉼표가 만드는 영원한 시간
                    </p>

                    {/* 인트로 — 모래는 아래에서 위로, 숫자는 10 → 0 으로 수렴.
                        높이를 미리 잡아둬서 인트로가 끝나도 버튼 위치가 흔들리지 않는다 */}
                    <div className="mt-4 flex h-20 items-center justify-center lg:mt-6 lg:h-24">
                        <AnimatePresence>
                            {intro && (
                                <motion.div
                                    key="intro"
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: DUR.base, ease: EASE }}
                                    className="flex items-center gap-4"
                                >
                                    <Hourglass seconds={INTRO_SEC} />
                                    <span
                                        aria-hidden
                                        className="w-8 text-left font-display text-30 tabular-nums [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)]"
                                    >
                                        {count}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-4 lg:mt-7.5">
                        <Link
                            href="/about"
                            className="inline-flex items-center border border-cream/80 px-8.25 py-2 font-display text-lead transition-colors duration-500 [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)] hover:bg-cream hover:text-dark"
                        >
                            VISIT HARU YOUNG
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}

/**
 * 시간을 거스르는 모래시계.
 * 아래 벌브의 모래가 줄고 위 벌브가 목에서부터 차오른다. (정상 모래시계의 역재생)
 * transform-box 를 view-box 로 고정해 viewBox 좌표로 원점을 잡는다.
 */
function Hourglass({ seconds }: { seconds: number }) {
    const rise = { duration: seconds, ease: 'linear' as const };

    return (
        <svg viewBox="0 0 48 72" aria-hidden className="h-14 w-auto text-cream/90 lg:h-16">
            <defs>
                <clipPath id="hg-top">
                    <polygon points="10,3 38,3 24,36" />
                </clipPath>
                <clipPath id="hg-bottom">
                    <polygon points="24,36 38,69 10,69" />
                </clipPath>
            </defs>

            {/* 아래 벌브 — 위에서부터 비워진다 */}
            <motion.rect
                x="9"
                y="36"
                width="30"
                height="33"
                fill="currentColor"
                clipPath="url(#hg-bottom)"
                style={{ transformBox: 'view-box', transformOrigin: '24px 69px' }}
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={rise}
            />

            {/* 위 벌브 — 목에서부터 차오른다 */}
            <motion.rect
                x="9"
                y="3"
                width="30"
                height="33"
                fill="currentColor"
                clipPath="url(#hg-top)"
                style={{ transformBox: 'view-box', transformOrigin: '24px 36px' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={rise}
            />

            {/* 목을 타고 올라가는 줄기 */}
            <motion.line
                x1="24"
                y1="34"
                x2="24"
                y2="26"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />

            {/* 유리 */}
            <path
                d="M10 3 L38 3 L24 36 L38 69 L10 69 L24 36 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
            <path d="M7 3 H41 M7 69 H41" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}
