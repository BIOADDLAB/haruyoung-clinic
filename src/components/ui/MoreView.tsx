'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { DUR, EASE } from '@/lib/motion';

export default function MoreView({
    href,
    dark,
    label = 'More View',
    ariaLabel,
}: {
    href: string;
    dark?: boolean;
    label?: string;
    ariaLabel?: string;
}) {
    const reduced = useReducedMotion();

    return (
        <motion.span
            initial="rest"
            animate="rest"
            whileHover={reduced ? undefined : 'hover'}
            whileFocus={reduced ? undefined : 'hover'}
            className="inline-flex"
        >
            <Link
                href={href}
                aria-label={ariaLabel ?? label}
                className={`inline-flex items-center gap-2.5 rounded-full px-6 py-2.5 text-caption tracking-wide transition-colors duration-500 ease-brand ${
                    dark
                        ? 'bg-dark text-cream hover:bg-dark/90'
                        : 'border border-cream/50 text-cream hover:bg-cream hover:text-dark'
                }`}
            >
                {label}

                <span
                    aria-hidden="true"
                    className={`relative flex h-2.75 w-2.75 items-center justify-center rounded-full ${
                        dark ? 'bg-cream/25' : 'bg-current/25'
                    }`}
                >
                    <motion.span
                        variants={{
                            rest: { scale: 1 },
                            hover: {
                                scale: [1, 1.5, 1],
                                transition: { duration: 2.4, ease: [0.45, 0, 0.55, 1], repeat: Infinity },
                            },
                        }}
                        transition={{ duration: DUR.fast, ease: EASE }}
                        className={`block h-1.25 w-1.25 rounded-full ${dark ? 'bg-cream' : 'bg-current'}`}
                    />
                </span>
            </Link>
        </motion.span>
    );
}
