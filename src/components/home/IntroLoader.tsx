'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { EASE } from '@/lib/motion';

/**
 * 카운트다운 리듬. Intro-03.mp4 길이(5.5초)에 맞춘다.
 *
 * 10 부터 00 까지 센다. 대비를 극단으로 벌린다.
 * 어중간하게 빠르면 성의 없어 보인다. 확실히 질주해야 뒤의 정적이 산다.
 *
 *   10~4    110ms × 7 =   770   훅 지나간다. 배율 11 배
 *   3·2·1  1240ms × 3 = 3,720   느려지며 시선을 붙잡는다
 *   00 정지            = 1,010   모래가 다 찬 화면에서 머무는 여운
 *                      ─────────
 *                        5,500
 *
 * 규칙: FAST_MS × 7 + SLOW_MS × 3 + HOLD_MS = 영상 길이
 * 하나를 줄이면 다른 하나를 늘려야 어긋나지 않는다.
 */
const FAST_MS = 110;
const SLOW_MS = 1240;
const HOLD_MS = 1010;
const SLOW_FROM = 3;

/**
 * 영상이 끝내 준비되지 않아도 이만큼 지나면 카운트다운을 시작한다.
 * 느린 회선이나 영상이 차단된 환경에서 인트로가 영영 안 끝나는 걸 막는다.
 */
const READY_TIMEOUT_MS = 1500;

/**
 * 인트로 노출 방식. 이 한 줄로 켜고 끄고 빈도까지 조절한다.
 *
 *   'always'  새로고침할 때마다 — 조절·확인용
 *   'session' 탭을 닫았다 열면 다시 — 실서비스 권장
 *   'daily'   하루 한 번
 *   'once'    기기당 한 번
 *   'off'     아예 끔
 *
 * 브랜드 사이트는 'session' 이 가장 흔하다.
 * 인상을 남기면서도 같은 방문 중에는 방해하지 않는 절충이다.
 */
const INTRO_MODE: 'always' | 'session' | 'daily' | 'once' | 'off' = 'session';

const SEEN_KEY = 'haruyoung:intro-seen';
const INTRO_ID = 'haruyoung-intro-loader';
const SKIP_STYLE_ID = 'haruyoung-intro-skip-style';

/** 이미 본 세션이면 첫 화면이 그려지기 전에 인트로를 감춘다. */
const BEFORE_PAINT_SCRIPT = `
try {
    const mode = ${JSON.stringify(INTRO_MODE)};
    const key = ${JSON.stringify(SEEN_KEY)};
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = mode === 'off' || reduced;

    if (mode === 'session') seen ||= sessionStorage.getItem(key) !== null;
    else if (mode === 'daily') seen ||= localStorage.getItem(key) === new Date().toDateString();
    else if (mode === 'once') seen ||= localStorage.getItem(key) !== null;

    if (seen && !document.getElementById(${JSON.stringify(SKIP_STYLE_ID)})) {
        const style = document.createElement('style');
        style.id = ${JSON.stringify(SKIP_STYLE_ID)};
        style.textContent = '#${INTRO_ID}{display:none!important}';
        document.head.appendChild(style);
    }
} catch {
    const style = document.createElement('style');
    style.id = ${JSON.stringify(SKIP_STYLE_ID)};
    style.textContent = '#${INTRO_ID}{display:none!important}';
    document.head.appendChild(style);
}
`;

const tickOf = (n: number) => (n <= SLOW_FROM ? SLOW_MS : FAST_MS);

/**
 * 숫자 전환 시간.
 * 빠른 구간은 짧게 — 다음 숫자가 오기 전에 끝나야 잔상이 안 뭉갠다.
 * 마지막 00 은 길게 — 툭 뜨지 않고 천천히 내려앉는다.
 */
const swapOf = (n: number) => (n === 0 ? 0.7 : n <= SLOW_FROM ? 0.5 : 0.16);

const noopSubscribe = () => () => {};

/** 이번 방문에 이미 봤는지. 저장소 접근이 막혀 있으면 본 것으로 친다 */
function hasSeen() {
    if (typeof window === 'undefined') return true;
    if (INTRO_MODE === 'off') return true;
    if (INTRO_MODE === 'always') return false;

    try {
        if (INTRO_MODE === 'session') return sessionStorage.getItem(SEEN_KEY) !== null;
        if (INTRO_MODE === 'daily') return localStorage.getItem(SEEN_KEY) === new Date().toDateString();
        return localStorage.getItem(SEEN_KEY) !== null;
    } catch {
        return true;
    }
}

/** 본 것으로 기록한다. 모드에 맞는 저장소를 쓴다 */
function markSeen() {
    try {
        if (INTRO_MODE === 'session') sessionStorage.setItem(SEEN_KEY, '1');
        else if (INTRO_MODE === 'daily') localStorage.setItem(SEEN_KEY, new Date().toDateString());
        else if (INTRO_MODE === 'once') localStorage.setItem(SEEN_KEY, '1');
    } catch {
        // 사파리 프라이빗 모드 등. 저장 못 해도 닫기는 되어야 한다
    }
}

/**
 * 브랜드 인트로.
 * Intro-03.mp4 위에 HA : RU : 00 이 겹치고, 뒤 두 자리가 10 → 00 으로 내려간다.
 * 00 에서 1초 머문 뒤 화면이 확대되며 사라지고 히어로가 드러난다.
 *
 * 영상은 받는 데 시간이 걸린다. poster 로 첫 프레임을 먼저 띄우고,
 * onCanPlay 이후에 카운트다운을 시작해 숫자와 모래가 어긋나지 않게 한다.
 *
 * 클릭하면 즉시 건너뛴다. 모션 최소화 설정이면 아예 뜨지 않는다.
 * 개발 중 다시 보려면 INTRO_MODE 를 'always' 로 두거나
 * 콘솔에서 sessionStorage.clear() 후 새로고침한다.
 */
export default function IntroLoader() {
    const reduced = useReducedMotion();
    // 서버 렌더부터 인트로를 덮어 메인 화면이 먼저 비치는 것을 막는다.
    const mounted = useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false,
    );
    const [skipped, setSkipped] = useState(false);
    const [ready, setReady] = useState(false);
    const [count, setCount] = useState(10);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const open = !mounted || (!reduced && !skipped && !hasSeen());

    const close = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        markSeen();
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
        <>
            <script dangerouslySetInnerHTML={{ __html: BEFORE_PAINT_SCRIPT }} />
            <AnimatePresence>
                {open && (
                    <motion.div
                        id={INTRO_ID}
                        // 확대되며 사라진다. 영상이 히어로로 빨려드는 느낌이라 이어짐이 부드럽다
                        exit={{
                            opacity: 0,
                            scale: skipped ? 1.08 : 1,
                            transition: { duration: skipped ? 1 : 0, ease: EASE },
                        }}
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
        </>
    );
}
