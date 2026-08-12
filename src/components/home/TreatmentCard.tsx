'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { EASE } from '@/lib/motion';

/** 목표를 살짝 넘겼다 되돌아오는 이징. 등장·호버 모두 이걸로 살랑인다 */
const SWAY = [0.34, 1.4, 0.64, 1] as const;

const CARD = {
    hidden: { opacity: 0, y: 20, rotate: -7, boxShadow: '0px 0px 0px rgba(59,43,30,0)' },
    show: {
        opacity: 1,
        y: 0,
        rotate: 0,
        boxShadow: '0px 0px 0px rgba(59,43,30,0)',
        transition: { duration: 0.9, ease: SWAY },
    },
    hover: {
        rotate: -3,
        boxShadow: '14px 18px 30px rgba(59,43,30,0.22)',
        transition: { duration: 0.7, ease: SWAY },
    },
    /** 터치 기기용. 누르는 동안만 살짝 기울고 그림자가 진해진다 */
    tap: {
        rotate: -2,
        boxShadow: '10px 12px 22px rgba(59,43,30,0.2)',
        transition: { duration: 0.25, ease: SWAY },
    },
};

const PHOTO = {
    hidden: { scale: 1 },
    show: { scale: 1 },
    hover: { scale: 1.06, transition: { duration: 1, ease: EASE } },
    tap: { scale: 1.03, transition: { duration: 0.25, ease: EASE } },
};

/** 좌상단 점을 축으로 매달린 택. 회전축 = pl 11+4, pt 7+4+4 */
export default function TreatmentCard({ en, n, desc, alt }: { en: string; n: string; desc: string; alt: string }) {
    const reduced = useReducedMotion();

    return (
        <motion.li
            variants={CARD}
            whileHover={reduced ? undefined : 'hover'}
            whileTap={reduced ? undefined : 'tap'}
            style={{ transformOrigin: '15px 15px' }}
            className="flex h-[198px] w-[288px] overflow-hidden rounded-tl-[13px] bg-paper py-[7px] pl-[11px] pr-[8px] text-dark"
        >
            <div className="flex w-[133px] shrink-0 flex-col">
                <span aria-hidden="true" className="mt-1 h-2 w-2 rounded-full bg-dark" />
                <h3 className="mt-6.5 font-gara text-22 font-bold italic leading-[1.15] lg:pl-2">{en}</h3>
                <p className="mt-3.25 whitespace-pre-line text-caption-sm leading-[1.7] text-dark lg:pl-2">{desc}</p>
            </div>

            <div className="relative h-full w-[136px] shrink-0 overflow-hidden">
                <motion.div variants={PHOTO} className="absolute inset-0">
                    <Image
                        src={`/images/img-s2-${n}.jpg`}
                        alt={alt}
                        fill
                        quality={90}
                        sizes="136px"
                        className="object-cover"
                    />
                </motion.div>
            </div>
        </motion.li>
    );
}
