'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DUR, EASE } from '@/lib/motion';
import { useMounted } from '@/lib/useMounted';

export default function DoneModal({
    open,
    name,
    date,
    time,
    onClose,
}: {
    open: boolean;
    name: string;
    date: string;
    time: string;
    onClose: () => void;
}) {
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
                    aria-label="예약 접수 완료"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.fast, ease: EASE }}
                    className="fixed inset-0 z-60 flex items-center justify-center bg-dark/70 px-6 backdrop-blur-sm"
                >
                    <motion.div
                        initial={reduced ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: DUR.base, ease: EASE }}
                        className="w-full max-w-[420px] bg-cream px-8 py-12 text-center"
                    >
                        <p className="font-gara text-28 italic text-brown">Thank you</p>

                        <h2 className="mt-6 text-22 font-bold">예약이 접수되었습니다.</h2>
                        <p className="mt-4 text-caption leading-[1.9] text-dark/70">
                            확인 후 빠르게 연락드리겠습니다.
                            <br />
                            결제는 내원 후 진행해 주세요.
                        </p>

                        <dl className="mt-8 flex flex-col gap-2 border-y border-dark/12 py-5 text-caption">
                            <div className="flex justify-between">
                                <dt className="text-dark/55">예약자</dt>
                                <dd className="font-semibold">{name}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-dark/55">일시</dt>
                                <dd className="font-semibold">
                                    {date} {time}
                                </dd>
                            </div>
                        </dl>

                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-8 w-full bg-dark py-3.5 text-caption font-semibold text-cream transition-colors duration-500 ease-brand hover:bg-brown"
                        >
                            확인
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
