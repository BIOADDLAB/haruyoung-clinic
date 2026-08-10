'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PRIVACY_EFFECTIVE, PRIVACY_SECTIONS } from '@/data/privacy';
import { DUR, EASE } from '@/lib/motion';
import { useMounted } from '@/lib/useMounted';

/**
 * 개인정보처리방침 모달.
 * 가입·예약 중에 페이지로 넘어가면 입력값이 날아가고 돌아올 길이 없다.
 * 같은 내용을 /privacy 페이지와 공유한다.
 */
export default function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const reduced = useReducedMotion();
    const mounted = useMounted();

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label="개인정보처리방침"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.fast, ease: EASE }}
                    onClick={onClose}
                    className="fixed inset-0 z-70 flex items-center justify-center bg-dark/70 px-6 py-10 backdrop-blur-sm"
                >
                    <motion.div
                        initial={reduced ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: DUR.base, ease: EASE }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex max-h-full w-full max-w-[520px] flex-col overflow-hidden bg-cream"
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-dark/12 px-8 py-6">
                            <h2 className="text-small font-bold">개인정보처리방침</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="닫기"
                                className="text-caption text-dark/50 transition-colors duration-500 ease-brand hover:text-dark"
                            >
                                닫기
                            </button>
                        </div>

                        <div className="overflow-y-auto overscroll-contain px-8 py-6">
                            {PRIVACY_SECTIONS.map((s) => (
                                <section
                                    key={s.title}
                                    className="border-b border-dark/10 py-5 first:pt-0 last:border-0"
                                >
                                    <h3 className="text-caption font-bold">{s.title}</h3>
                                    <p className="mt-2 text-caption-sm leading-[1.8] text-dark/75">{s.body}</p>
                                </section>
                            ))}
                            <p className="pt-4 text-caption-sm text-dark/45">시행일 {PRIVACY_EFFECTIVE}</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
