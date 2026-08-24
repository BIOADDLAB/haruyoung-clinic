'use client';

import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DUR, EASE } from '@/lib/motion';
import { useMounted } from '@/lib/useMounted';

/** 안내문 이미지. 제증명·환자 권리처럼 세로로 긴 고지문을 스크롤해서 본다 */
export default function NoticeImageModal({
    open,
    src,
    alt,
    onClose,
}: {
    open: boolean;
    src: string;
    alt: string;
    onClose: () => void;
}) {
    const ta = useTranslations('a11y');
    const reduced = useReducedMotion();
    const mounted = useMounted();

    useEffect(() => {
        if (!open) return;
        document.body.classList.add('overflow-hidden');
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.classList.remove('overflow-hidden');
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={alt}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.fast, ease: EASE }}
                    onClick={onClose}
                    className="fixed inset-0 z-70 flex items-center justify-center bg-dark/80 px-4 py-10 backdrop-blur-sm"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={ta('close')}
                        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 bg-dark/40 text-cream backdrop-blur-sm transition-colors duration-500 ease-brand hover:border-cream/60 hover:bg-dark/70"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            className="h-4 w-4"
                        >
                            <path d="M5 5l14 14M19 5L5 19" />
                        </svg>
                    </button>
                    <motion.div
                        initial={reduced ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: DUR.base, ease: EASE }}
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-full w-full max-w-[640px] overflow-y-auto overscroll-contain bg-white shadow-[0_28px_70px_rgba(59,43,30,0.4)]"
                    >
                        <Image src={src} alt={alt} width={2250} height={3250} className="h-auto w-full" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
