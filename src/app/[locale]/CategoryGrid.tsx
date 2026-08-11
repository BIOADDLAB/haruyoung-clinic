'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { DUR, EASE, fadeIn, stagger, VIEWPORT } from '@/lib/motion';

export type CategoryItem = { en: string; ko: string; slug: string; n: string; alt: string };

const SCRIM = { rest: { backgroundColor: 'rgba(59,43,30,0.2)' }, hover: { backgroundColor: 'rgba(255,251,246,0.62)' } };
const EN = { rest: { opacity: 1 }, hover: { opacity: 0 } };
const KO = { rest: { opacity: 0 }, hover: { opacity: 1 } };
const LINE = { rest: { opacity: 0 }, hover: { opacity: 1 } };

export default function CategoryGrid({ items }: { items: readonly CategoryItem[] }) {
    const reduced = useReducedMotion();

    return (
        <motion.ul
            variants={stagger}
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={VIEWPORT}
            className="grid grid-cols-2 gap-[11px] sm:grid-cols-4 lg:w-[617px] lg:shrink-0"
        >
            {items.map((t) => (
                <motion.li key={t.slug} variants={reduced ? undefined : fadeIn}>
                    <Link href={`/treatments/${t.slug}`} className="block">
                        <motion.span
                            initial="rest"
                            animate="rest"
                            whileHover={reduced ? undefined : 'hover'}
                            whileFocus={reduced ? undefined : 'hover'}
                            className="relative block"
                        >
                            <motion.span
                                variants={LINE}
                                transition={{ duration: DUR.fast, ease: EASE }}
                                className="absolute -inset-[3px] block border border-beige"
                            />

                            <span className="relative block aspect-[146/97] w-full overflow-hidden">
                                <Image
                                    src={`/images/img-s3-${t.n}.jpg`}
                                    alt={t.alt}
                                    fill
                                    quality={90}
                                    sizes="(min-width:1024px) 146px, 45vw"
                                    className="object-cover"
                                />

                                <motion.span
                                    variants={SCRIM}
                                    transition={{ duration: DUR.fast, ease: EASE }}
                                    className="absolute inset-0 block"
                                />

                                <motion.span
                                    variants={EN}
                                    transition={{ duration: DUR.fast, ease: EASE }}
                                    className="absolute inset-0 flex items-center justify-center font-gara text-caption font-semibold italic text-dark"
                                >
                                    {t.en}
                                </motion.span>

                                <motion.span
                                    variants={KO}
                                    transition={{ duration: DUR.fast, ease: EASE }}
                                    className="absolute inset-0 flex items-center justify-center text-caption-sm text-dark"
                                >
                                    {t.ko}
                                </motion.span>
                            </span>
                        </motion.span>
                    </Link>
                </motion.li>
            ))}
        </motion.ul>
    );
}
