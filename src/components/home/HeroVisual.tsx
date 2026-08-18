'use client';

import { useTranslations } from 'next-intl';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useLayoutEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { INTRO_CLOSED_EVENT, INTRO_ELEMENT_ID } from '@/lib/intro';
import { DUR, EASE } from '@/lib/motion';

/** 히어로 유지 구간. 상위 스크롤 컨테이너의 가로 전환 시작점 계산에 쓴다. */
export const HERO_HOLD = 300;

export default function HeroVisual() {
    const t = useTranslations('a11y');
    const th = useTranslations('home');
    const reduced = useReducedMotion();
    const backgroundControls = useAnimationControls();

    // 다른 페이지에서 넘어올 때 스크롤 위치가 이어지지 않도록 진입 시 초기화한다.
    useLayoutEffect(() => {
        if (window.location.hash) {
            window.history.replaceState(
                window.history.state,
                '',
                `${window.location.pathname}${window.location.search}`,
            );
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    // 인트로가 닫힌 뒤 배경 블러를 푼다. 인트로가 없으면 즉시 실행한다.
    useEffect(() => {
        const reveal = () => {
            void backgroundControls.start({
                filter: 'blur(0px)',
                transition: { duration: 2.9, ease: EASE },
            });
        };

        if (!document.getElementById(INTRO_ELEMENT_ID)) {
            reveal();
            return;
        }

        window.addEventListener(INTRO_CLOSED_EVENT, reveal, { once: true });
        return () => window.removeEventListener(INTRO_CLOSED_EVENT, reveal);
    }, [backgroundControls]);

    return (
        <>
            <div className="absolute inset-0">
                <motion.div
                    initial={reduced ? false : { filter: 'blur(14px)' }}
                    animate={backgroundControls}
                    className="absolute inset-0"
                >
                    <Image
                        src="/images/bg-hero.jpg"
                        alt={t('heroImg')}
                        fill
                        priority
                        quality={95}
                        sizes="125vw"
                        className="object-cover object-[50%] lg:object-center"
                    />
                </motion.div>
            </div>

            <div className="absolute inset-0 bg-dark/25" />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-16 text-center text-cream lg:pb-0">
                <motion.div
                    initial={reduced ? false : { opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.slow, ease: EASE }}
                >
                    <h1 className="font-display text-40 font-normal leading-13 [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)]">
                        A Moment of Pause,
                        <br />
                        Timeless Beauty
                    </h1>

                    <p className="mt-5 text-30 font-normal [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)] whitespace-pre-line">
                        {th('heroSub')}
                    </p>

                    <div className="mt-14 lg:mt-18">
                        <Link
                            href="/about"
                            className="inline-flex items-center border border-cream/80 px-8.25 py-2 font-display text-lead transition-colors duration-500 [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)] hover:border-dark hover:bg-dark hover:text-cream"
                        >
                            VISIT HARUYOUNG
                        </Link>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
