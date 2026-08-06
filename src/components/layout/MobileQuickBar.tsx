// 'use client';

// import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useState } from 'react';
// import { QUICK_LINKS } from '@/data/site';
// import { DUR, EASE } from '@/lib/motion';

/**
 * 모바일·태블릿 전용 빠른 실행.
 * PC 레일 하단의 상담예약 / 바로예약 / 카카오톡이 lg 미만에서 사라지므로 여기서 받는다.
 * (언어 전환은 상단 바, 로그인은 메뉴 패널 하단)
 */
// export default function MobileQuickBar() {
//     const [open, setOpen] = useState(false);
//     const reduced = useReducedMotion();

//     const close = () => setOpen(false);

//     const pill =
//         'flex items-center gap-2.5 rounded-full border border-dark/10 bg-cream py-2.5 pl-4 pr-3 shadow-[0_10px_28px_rgba(59,43,30,0.16)]';

//     return (
//         <>
//             <AnimatePresence>
//                 {open && (
//                     <motion.button
//                         type="button"
//                         tabIndex={-1}
//                         aria-hidden
//                         onClick={close}
//                         initial={reduced ? false : { opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         transition={{ duration: DUR.fast, ease: EASE }}
//                         className="fixed inset-0 z-20 cursor-default bg-dark/25 lg:hidden"
//                     />
//                 )}
//             </AnimatePresence>

//             <div className="fixed  bottom-6 right-5 z-30 flex flex-col items-end gap-3 lg:hidden ">
//                 <AnimatePresence>
//                     {open && (
//                         <motion.ul
//                             initial={reduced ? false : 'hidden'}
//                             animate="show"
//                             exit="hidden"
//                             variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
//                             className="flex flex-col items-end gap-2.5"
//                         >
//                             {QUICK_LINKS.map((l) => {
//                                 const inner = (
//                                     <>
//                                         <span className="text-caption font-semibold">{l.label}</span>
//                                         <Image src={`/images/${l.icon}.svg`} alt="" width={26} height={26} />
//                                     </>
//                                 );
//                                 return (
//                                     <motion.li
//                                         key={l.label}
//                                         variants={{
//                                             hidden: { opacity: 0, y: 14, scale: 0.94 },
//                                             show: {
//                                                 opacity: 1,
//                                                 y: 0,
//                                                 scale: 1,
//                                                 transition: { duration: DUR.fast, ease: EASE },
//                                             },
//                                         }}
//                                     >
//                                         {l.external ? (
//                                             <a
//                                                 href={l.href}
//                                                 target={l.href.startsWith('http') ? '_blank' : undefined}
//                                                 rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
//                                                 onClick={close}
//                                                 className={pill}
//                                             >
//                                                 {inner}
//                                             </a>
//                                         ) : (
//                                             <Link href={l.href} onClick={close} className={pill}>
//                                                 {inner}
//                                             </Link>
//                                         )}
//                                     </motion.li>
//                                 );
//                             })}
//                         </motion.ul>
//                     )}
//                 </AnimatePresence>

//                 <button
//                     type="button"
//                     onClick={() => setOpen((o) => !o)}
//                     aria-expanded={open}
//                     aria-label={open ? '빠른 실행 닫기' : '빠른 실행 열기'}
//                     className="flex h-14 w-14 items-center justify-center rounded-full shadow-md bg-dark shadow-[0_12px_32px_rgba(59,43,30,0.3)] transition-transform duration-500 ease-brand active:scale-95"
//                 >
//                     <Image
//                         src={open ? '/images/i-close.svg' : '/images/i-h-03.svg'}
//                         alt=""
//                         width={open ? 20 : 30}
//                         height={open ? 20 : 30}
//                         className="brightness-0 invert"
//                     />
//                 </button>
//             </div>
//         </>
//     );
// }

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { QUICK_LINKS } from '@/data/site';

export default function MobileQuickBar() {
    return (
        <nav
            aria-label="빠른 실행"
            className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-dark/12 bg-cream/95 backdrop-blur-sm lg:hidden"
        >
            <ul className="grid h-full grid-cols-3">
                {QUICK_LINKS.map((l, i) => {
                    const inner = (
                        <>
                            <Image src={`/images/${l.icon}.svg`} alt="" width={22} height={22} />
                            <span className="text-caption-sm font-semibold tracking-[0.02em]">{l.label}</span>
                        </>
                    );
                    const base = `flex h-full w-full flex-col items-center justify-center gap-1.5 border-dark/12 transition-opacity duration-500 ease-brand active:opacity-60 ${
                        i > 0 ? 'border-l' : ''
                    }`;

                    return (
                        <li key={l.label}>
                            {l.external ? (
                                <a
                                    href={l.href}
                                    target={l.href.startsWith('http') ? '_blank' : undefined}
                                    rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className={base}
                                >
                                    {inner}
                                </a>
                            ) : (
                                <Link href={l.href} className={base}>
                                    {inner}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
