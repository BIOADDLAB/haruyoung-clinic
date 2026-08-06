'use client';

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { DUR, EASE } from '@/lib/motion';

export const HERO_HOLD = 300;

export default function HeroVisual() {
    const reduced = useReducedMotion();
    const { scrollY } = useScroll();

    const scale = useTransform(scrollY, [0, HERO_HOLD], [1, 1.18]);
    const y = useTransform(scrollY, [0, HERO_HOLD], [0, 200]);
    const opacity = useTransform(scrollY, [0, HERO_HOLD * 0.75], [1, 0]);

    // #TODO: 모션 부드럽게
    return (
        <>
            <motion.div style={reduced ? undefined : { scale }} className="absolute inset-0 origin-center">
                <Image
                    src="/images/bg-hero.jpg"
                    alt="하루영의원 리셉션 라운지 메인 비주얼"
                    fill
                    priority
                    quality={95}
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
                    <div className="relative">
                        <h1 className="font-display text-40 font-normal leading-13 transition-opacity duration-700 ease-brand [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)] ">
                            A Moment of Pause,
                            <br />
                            Timeless Beauty
                        </h1>
                    </div>

                    <p className="mt-5 text-30 font-normal [text-shadow:2px_0_10.6px_rgba(59,37,9,0.64)]">
                        하루의 쉼표가 만드는 영원한 시간
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
