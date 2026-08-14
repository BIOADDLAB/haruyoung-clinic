'use client';

import { useTranslations } from 'next-intl';
import { motion, useAnimationControls, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useLayoutEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { INTRO_CLOSED_EVENT, INTRO_ELEMENT_ID } from '@/lib/intro';
import { DUR, EASE } from '@/lib/motion';

export const HERO_HOLD = 300;

export default function HeroVisual() {
    const t = useTranslations('a11y');
    const th = useTranslations('home');
    const reduced = useReducedMotion();
    const { scrollY } = useScroll();
    const backgroundControls = useAnimationControls();

    // 다른 페이지의 스크롤 진행률이 메인 히어로에 이어지지 않도록 진입 시 즉시 초기화한다.
    useLayoutEffect(() => {
        if (window.location.hash) {
            window.history.replaceState(
                window.history.state,
                '',
                `${window.location.pathname}${window.location.search}`,
            );
        }
        scrollY.set(0);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [scrollY]);

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

    const scale = useTransform(scrollY, [0, HERO_HOLD], [1, 1.18]);
    const opacity = useTransform(scrollY, [0, HERO_HOLD * 0.75], [1, 0]);

    // #TODO: 모션 부드럽게
    return (
        <>
            <motion.div style={reduced ? undefined : { scale }} className="absolute inset-0 origin-center">
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
            </motion.div>

            <div className="absolute inset-0 bg-dark/25" />

            <motion.div
                style={reduced ? undefined : { opacity }}
                className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-16 text-center text-cream lg:pb-0"
            >
                <motion.div
                    initial={reduced ? false : { opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.slow, ease: EASE }}
                >
                    <div className="relative">
                        <h1 className="font-display text-40 font-normal leading-13 transition-opacity duration-700 ease-brand [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)] ">
                            A Moment of Pause,
                            <br />
                            Timeless Beauty
                        </h1>
                    </div>

                    <p className="mt-5 text-30 font-normal [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)]">
                        {th('heroSub')}
                    </p>

                    <div className="mt-14 lg:mt-18">
                        <Link
                            href="/about"
                            className="inline-flex items-center border border-cream/80 px-8.25 py-2 font-display text-lead transition-colors duration-500 [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)] hover:bg-dark hover:text-cream hover:border-dark"
                        >
                            VISIT HARU YOUNG
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}
