'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { EASE } from '@/lib/motion';

const FAST_MS = 110;
const SLOW_MS = 1240;
const HOLD_MS = 1010;
const SLOW_FROM = 3;

const READY_TIMEOUT_MS = 1500;

/** 세션당 1회 노출용 키. */
const SEEN_KEY = 'haruyoung:intro-seen';

const tickOf = (n: number) => (n <= SLOW_FROM ? SLOW_MS : FAST_MS);

/**
 * 숫자 전환 시간.
 * 빠른 구간은 짧게 — 다음 숫자가 오기 전에 끝나야 잔상이 안 뭉갠다.
 * 마지막 00 은 길게 — 툭 뜨지 않고 천천히 내려앉는다.
 */
const swapOf = (n: number) => (n === 0 ? 0.7 : n <= SLOW_FROM ? 0.5 : 0.16);

const noopSubscribe = () => () => {};

/** 이번 세션에 이미 봤는지. 저장소 접근이 막혀 있으면 본 것으로 친다 */
function hasSeen() {
    if (typeof window === 'undefined') return true;
    try {
        return sessionStorage.getItem(SEEN_KEY) !== null;
    } catch {
        return true;
    }
}

export default function IntroLoader() {
    const reduced = useReducedMotion();
    // 서버에서는 false, 클라이언트 첫 렌더에서 true. effect 안 setState 없이 판정한다
    const mounted = useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false,
    );
    const [skipped, setSkipped] = useState(false);
    const [ready, setReady] = useState(false);
    const [count, setCount] = useState(10);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // [노출 빈도] 조절이 끝나면 아랫줄로 교체한다 (세션당 1회)
    // const open = mounted && !reduced && !skipped && !hasSeen();
    const open = mounted && !reduced && !skipped;

    const close = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        try {
            sessionStorage.setItem(SEEN_KEY, '1');
        } catch {
            // 사파리 프라이빗 모드 등. 저장 못 해도 닫기는 되어야 한다
        }
        setSkipped(true);
    }, []);

    // 영상이 준비되지 않아도 인트로가 멈춰 있으면 안 된다
    useEffect(() => {
        if (!open || ready) return;
        const t = setTimeout(() => setReady(true), READY_TIMEOUT_MS);
        return () => clearTimeout(t);
    }, [open, ready]);

    // 카운트다운. 숫자마다 간격이 달라 setInterval 을 쓸 수 없다.
    // 00 까지 내려간 뒤 HOLD_MS 동안 머물다 닫는다
    useEffect(() => {
        if (!open || !ready) return;

        if (count <= 0) {
            timer.current = setTimeout(close, HOLD_MS);
        } else {
            timer.current = setTimeout(() => setCount((n) => n - 1), tickOf(count));
        }

        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [open, ready, count, close]);

    // 인트로가 떠 있는 동안 배경 스크롤을 막는다
    useEffect(() => {
        if (!open) return;
        document.body.classList.add('overflow-hidden');
        return () => document.body.classList.remove('overflow-hidden');
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    // 확대되며 사라진다. 영상이 히어로로 빨려드는 느낌이라 이어짐이 부드럽다
                    exit={{ opacity: 0, scale: 1.08, transition: { duration: 1, ease: EASE } }}
                    onClick={close}
                    className="fixed inset-0 z-[100] cursor-pointer overflow-hidden bg-dark"
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

                    {/* 영상 위에 글자가 묻히지 않게 눌러준다. 값이 높을수록 글자가 또렷해진다 */}
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

                            {/* mode="wait" 을 쓰지 않아 나가는 숫자와 들어오는 숫자가 겹친다.
                                빠른 구간에서 잔상이 이어져 툭툭 끊기지 않는다 */}
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
                        SKIP
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
