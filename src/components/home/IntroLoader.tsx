'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { INTRO_CLOSED_EVENT, INTRO_DISPLAY_PROPERTY, INTRO_ELEMENT_ID, INTRO_STORAGE_KEY } from '@/lib/intro';
import { EASE } from '@/lib/motion';

/** 03 → 00, 1초 간격. 00 에서 HOLD_MS 만큼 머문 뒤 닫는다. */
const START_COUNT = 3;
const INTERVAL_MS = 1000;
const HOLD_MS = 1000;

/** 영상이 끝내 준비되지 않아도 이만큼 지나면 카운트다운을 시작한다. */
const READY_TIMEOUT_MS = 1500;

/** 마지막 00 만 길게 내려앉힌다. */
const swapOf = (n: number) => (n === 0 ? 0.7 : 0.5);

/** 새 탭에서는 다시 열리고, 같은 탭의 새로고침에서는 열리지 않는다. */
function markSeen() {
    try {
        window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
    } catch {}
}

/**
 * 브랜드 인트로.
 * intro.mp4 위에 HA : RU : 00 이 겹치고, 뒤 두 자리가 03 → 00 으로 내려간다.
 * 클릭하면 즉시 건너뛴다. 모션 최소화 설정이면 아예 뜨지 않는다.
 */
export default function IntroLoader() {
    const t = useTranslations('intro');
    const reduced = useReducedMotion();
    const [open, setOpen] = useState(true);
    const [skipped, setSkipped] = useState(false);
    const [ready, setReady] = useState(false);
    const [count, setCount] = useState(START_COUNT);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const visible = open && !reduced;

    useEffect(() => {
        let seen = false;
        try {
            seen = window.sessionStorage.getItem(INTRO_STORAGE_KEY) === '1';
        } catch {}

        if (!seen) return;
        const frame = window.requestAnimationFrame(() => setOpen(false));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    const close = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        markSeen();
        setSkipped(true);
        setOpen(false);
    }, []);

    // 영상이 준비되지 않아도 인트로가 멈춰 있으면 안 된다
    useEffect(() => {
        if (!visible || ready) return;
        const t = setTimeout(() => setReady(true), READY_TIMEOUT_MS);
        return () => clearTimeout(t);
    }, [visible, ready]);

    useEffect(() => {
        if (!visible || !ready) return;

        if (count <= 0) {
            timer.current = setTimeout(close, HOLD_MS);
        } else {
            timer.current = setTimeout(() => setCount((n) => n - 1), INTERVAL_MS);
        }

        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [visible, ready, count, close]);

    // 인트로가 떠 있는 동안 배경 스크롤을 막는다
    useEffect(() => {
        if (!visible) return;
        document.body.classList.add('overflow-hidden');
        return () => document.body.classList.remove('overflow-hidden');
    }, [visible]);

    return (
        <AnimatePresence
            onExitComplete={() => {
                document.documentElement.style.setProperty(INTRO_DISPLAY_PROPERTY, 'none');
                window.dispatchEvent(new Event(INTRO_CLOSED_EVENT));
            }}
        >
            {visible && (
                <motion.div
                    id={INTRO_ELEMENT_ID}
                    style={{ display: `var(${INTRO_DISPLAY_PROPERTY}, block)` }}
                    // 확대되며 사라진다. 영상이 히어로로 빨려드는 느낌이라 이어짐이 부드럽다
                    exit={{
                        opacity: 0,
                        scale: 1.08,
                        transition: { duration: 1, ease: EASE },
                    }}
                    onClick={close}
                    className="fixed inset-0 z-[100] cursor-pointer overflow-hidden bg-dark motion-reduce:hidden"
                >
                    <video
                        src="/videos/intro.mp4"
                        poster="/images/intro-s.jpg"
                        autoPlay
                        muted
                        playsInline
                        preload="auto"
                        onCanPlay={() => setReady(true)}
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    {/* 영상 위에 글자가 묻히지 않게 눌러준다 */}
                    <span aria-hidden="true" className="absolute inset-0 bg-dark/40" />

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0 }}
                        transition={{ duration: 0.9, ease: EASE }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <p className="flex items-baseline gap-3 font-display text-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:gap-5">
                            <span className="text-32 tracking-[0.14em] sm:text-48">HA</span>
                            <span className="text-24 opacity-60 sm:text-32">:</span>
                            <span className="text-32 tracking-[0.14em] sm:text-48">RU</span>
                            <span className="text-24 opacity-60 sm:text-32">:</span>

                            <span className="relative inline-block w-[2.2ch] text-32 tabular-nums sm:text-48">
                                {/* 자리를 잡아두는 투명 글자. absolute 만 있으면 폭이 0 이 된다 */}
                                <span className="invisible">00</span>

                                <AnimatePresence initial={false}>
                                    <motion.span
                                        key={count}
                                        initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                                        transition={{ duration: swapOf(count), ease: EASE }}
                                        className="absolute inset-0 block"
                                    >
                                        {String(count).padStart(2, '0')}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                        </p>
                    </motion.div>

                    <p className="absolute inset-x-0 bottom-10 text-center text-caption-sm tracking-[0.1em] text-cream/45">
                        {t('skip')}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
