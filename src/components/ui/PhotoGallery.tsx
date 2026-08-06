'use client';

import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { DUR, EASE, fadeIn, stagger, VIEWPORT } from '@/lib/motion';

export type GalleryPhoto = {
    src: string;
    alt: string;
    /** 그리드 배치용. 레이아웃은 페이지가 정하고 이 컴포넌트는 인터랙션만 맡는다 */
    className?: string;
};

const PHOTO = { rest: { scale: 1 }, hover: { scale: 1.06 } };
const SCRIM = { rest: { opacity: 0 }, hover: { opacity: 1 } };
const CTA = { rest: { opacity: 0, y: 10 }, hover: { opacity: 1, y: 0 } };

/** 이만큼 끌거나 이 속도를 넘기면 넘긴 것으로 본다 */
const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 400;

/** 사진 원본 비율. img-tour-* 전부 1624x836 */
const RATIO = 1624 / 836;

/** 서버에서 false, 클라이언트에서 true. effect 안 setState 없이 마운트를 판정한다 */
const noopSubscribe = () => () => {};
const useMounted = () =>
    useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false,
    );

/**
 * 클릭하면 원본이 뜨는 사진 갤러리.
 * 호버하면 사진이 천천히 확대되고 아래에서 그라데이션과 버튼이 올라온다.
 * 모달에서는 PC 는 좌우 버튼, 모바일은 스와이프로 넘긴다.
 * 배치는 photos[].className 으로 페이지가 지정한다.
 */
export default function PhotoGallery({ photos, className }: { photos: GalleryPhoto[]; className?: string }) {
    const [index, setIndex] = useState<number | null>(null);
    const reduced = useReducedMotion();
    const mounted = useMounted();
    const active = index === null ? null : photos[index];

    const close = useCallback(() => setIndex(null), []);
    const move = useCallback(
        (step: number) => setIndex((i) => (i === null ? i : (i + step + photos.length) % photos.length)),
        [photos.length],
    );

    useEffect(() => {
        if (index === null) return;
        document.body.classList.add('overflow-hidden');
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowRight') move(1);
            if (e.key === 'ArrowLeft') move(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.classList.remove('overflow-hidden');
            window.removeEventListener('keydown', onKey);
        };
    }, [index, close, move]);

    const onDragEnd = (_: unknown, info: PanInfo) => {
        const { offset, velocity } = info;
        if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) move(1);
        else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) move(-1);
    };

    return (
        <>
            <motion.ul
                variants={stagger}
                initial={reduced ? false : 'hidden'}
                whileInView="show"
                viewport={VIEWPORT}
                className={className}
            >
                {photos.map((p, i) => (
                    <motion.li key={p.src} variants={reduced ? undefined : fadeIn} className={p.className}>
                        <motion.button
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`${p.alt} 크게 보기`}
                            initial="rest"
                            animate="rest"
                            whileHover={reduced ? undefined : 'hover'}
                            whileFocus={reduced ? undefined : 'hover'}
                            className="relative block h-full w-full overflow-hidden"
                        >
                            <motion.span
                                variants={PHOTO}
                                transition={{ duration: 1, ease: EASE }}
                                className="absolute inset-0 block"
                            >
                                <Image
                                    src={p.src}
                                    alt={p.alt}
                                    fill
                                    quality={90}
                                    sizes="(min-width:1024px) 400px, 50vw"
                                    className="object-cover"
                                />
                            </motion.span>

                            <motion.span
                                variants={SCRIM}
                                transition={{ duration: DUR.fast, ease: EASE }}
                                className="absolute inset-0 block bg-gradient-to-t from-dark/80 via-dark/15 to-transparent"
                            />

                            <motion.span
                                variants={CTA}
                                transition={{ duration: DUR.fast, ease: EASE }}
                                className="absolute bottom-4 left-4 flex items-center gap-2.5 text-cream"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/50 bg-cream/10 backdrop-blur-sm">
                                    <ExpandIcon />
                                </span>
                                <span className="text-caption-sm font-semibold">크게 보기</span>
                            </motion.span>
                        </motion.button>
                    </motion.li>
                ))}
            </motion.ul>

            {/* 모달은 body 로 포털한다. 가로 트랙에 transform 이 걸려 있어서 그 안에 두면
                fixed 가 뷰포트가 아니라 트랙 기준이 되고 sticky 의 overflow-hidden 에 잘린다 */}
            {mounted &&
                createPortal(
                    <AnimatePresence>
                        {active && (
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-label={active.alt}
                                initial={reduced ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: DUR.fast, ease: EASE }}
                                onClick={close}
                                className="fixed inset-0 z-60 flex items-center justify-center bg-dark/85 p-4 backdrop-blur-sm lg:p-10"
                            >
                                {/* 사진이 차지할 자리를 비율로 미리 확정한다.
                                    컨트롤이 이 박스 기준이라 사진이 바뀌어도 제자리에 있는다 */}
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="relative aspect-[1624/836] max-h-full w-full max-w-[1100px] touch-pan-y"
                                    style={{ maxWidth: `min(1100px, calc((100dvh - 80px) * ${RATIO}))` }}
                                >
                                    {/* 좌우 이동 없이 겹쳐서 교차 페이드한다.
                                        사진이 옆으로 빠지면 고정된 버튼만 남아 보여서 분리돼 보인다 */}
                                    <AnimatePresence initial={false}>
                                        <motion.div
                                            key={active.src}
                                            initial={reduced ? false : { opacity: 0, scale: 1.015 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: DUR.fast, ease: EASE }}
                                            drag={photos.length > 1 ? 'x' : false}
                                            dragElastic={0.14}
                                            dragMomentum={false}
                                            dragConstraints={{ left: 0, right: 0 }}
                                            onDragEnd={onDragEnd}
                                            className="absolute inset-0 cursor-grab active:cursor-grabbing"
                                        >
                                            <Image
                                                src={active.src}
                                                alt={active.alt}
                                                fill
                                                quality={95}
                                                sizes="(min-width:1024px) 1100px, 92vw"
                                                className="pointer-events-none select-none object-contain"
                                                priority
                                                draggable={false}
                                            />
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* 컨트롤 — 사진 박스 기준 고정 */}
                                    <button
                                        type="button"
                                        onClick={close}
                                        aria-label="닫기"
                                        className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-cream/25 bg-dark/40 text-cream backdrop-blur-sm transition-colors duration-500 ease-brand hover:border-cream/60 hover:bg-dark/70 lg:right-5 lg:top-5 lg:h-12 lg:w-12"
                                    >
                                        <CloseIcon />
                                    </button>

                                    {/* 모바일은 스와이프로 넘긴다. 작은 화면에서 사진을 가리지 않도록 숨김 */}
                                    {photos.length > 1 && (
                                        <>
                                            <NavButton dir={-1} onClick={() => move(-1)} />
                                            <NavButton dir={1} onClick={() => move(1)} />
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}

/** 사진 안쪽 좌우 끝. 테두리 원 안에 셰브론. PC 전용 */
function NavButton({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
    const next = dir === 1;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={next ? '다음 사진' : '이전 사진'}
            className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/25 bg-dark/40 text-cream backdrop-blur-sm transition-colors duration-500 ease-brand hover:border-cream/60 hover:bg-dark/70 lg:flex ${
                next ? 'right-5' : 'left-5'
            }`}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-5 w-5 ${next ? '' : 'rotate-180'}`}
            >
                <path d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
}

function ExpandIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="h-4 w-4"
        >
            <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="h-4 w-4 lg:h-5 lg:w-5"
        >
            <path d="M5 5l14 14M19 5L5 19" />
        </svg>
    );
}
