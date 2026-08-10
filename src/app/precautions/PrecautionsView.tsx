'use client';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { DUR, EASE } from '@/lib/motion';

/** #TODO: 문구는 추가해야함 */

const GUIDES = [
    {
        tab: '보톡스',
        icon: 'i-pre-01',
        items: [
            {
                name: '보톡스',
                notes: [
                    '시술 후 2~3시간 동안 세안 및 화장은 피해주세요.',
                    '시술 후 3~7일간 음주, 흡연, 사우나, 찜질방 및 격한 운동은 피해주세요.',
                    '시술 부위에 멍, 붓기, 통증이 나타날 수 있으며 보통 1~2주 이내 자연스럽게 완화됩니다.',
                    '이마 또는 눈가 시술 후 눈이 무겁거나 눈썹 모양이 일시적으로 변하는 현상(사무라이 눈썹)이 나타날 수 있습니다.',
                    '드물게 눈꺼풀 처짐(안검하수), 눈썹 비대칭, 두통, 표정 어색함, 저작 시 불편감, 입꼬리 비대칭 등이 나타날 수 있습니다.',
                    '효과는 보통 1~2주 후 나타나며 턱 또는 바디 보톡스는 3~4주 후 효과가 나타날 수 있습니다.',
                    '개인의 근육 발달 정도에 따라 추가 용량 시술이 필요할 수 있습니다.',
                ],
            },
            {
                name: '스킨보톡스',
                notes: [
                    '시술 당일 세안은 미온수로 가볍게만 해주세요.',
                    '시술 후 3일간 사우나, 음주, 격한 운동을 피해주세요.',
                    '주사 자국과 미세한 붓기는 1~2일 내 가라앉습니다.',
                    '피부결과 모공 개선 효과는 2~3주에 걸쳐 서서히 나타납니다.',
                ],
            },
            {
                name: '윤곽주사',
                notes: [
                    '시술 후 24시간은 시술 부위를 강하게 누르지 마세요.',
                    '시술 후 3일간 사우나, 음주, 격한 운동을 피해주세요.',
                    '멍이나 붓기는 3~7일 내 가라앉습니다.',
                    '충분한 수분 섭취가 효과를 돕습니다.',
                ],
            },
        ],
    },
    {
        tab: '스킨부스터',
        icon: 'i-pre-02',
        items: [
            {
                name: '스킨부스터',
                notes: [
                    '시술 당일 세안은 미온수로 가볍게만 해주세요.',
                    '시술 후 3일간 사우나, 음주, 격한 운동을 피해주세요.',
                    '주사 자국과 미세한 붓기는 1~2일 내 가라앉습니다.',
                    '충분한 수분 섭취와 보습이 효과를 오래 유지시켜 줍니다.',
                ],
            },
        ],
    },
    {
        tab: '레이저 리프팅',
        icon: 'i-pre-03',
        items: [
            {
                name: '초음파·고주파 리프팅',
                notes: [
                    '시술 후 2주간 사우나, 찜질방, 격한 운동은 피해주세요.',
                    '자외선 차단제를 꼼꼼히 발라주세요.',
                    '붉은기나 얼얼함은 며칠 내 사라집니다.',
                    '효과는 2~3개월에 걸쳐 서서히 나타납니다.',
                ],
            },
        ],
    },
    {
        tab: '색조·점',
        icon: 'i-pre-04',
        items: [
            {
                name: '색소·잡티 레이저',
                notes: [
                    '딱지가 생기면 억지로 떼지 말고 자연히 떨어지도록 두세요.',
                    '시술 후 1주일간 자극적인 화장품과 각질 제거를 피해주세요.',
                    '자외선 차단이 가장 중요합니다. 외출 시 반드시 발라주세요.',
                    '색소가 진해 보이는 시기가 지나면 서서히 옅어집니다.',
                ],
            },
        ],
    },
    {
        tab: '콜라겐 재생',
        icon: 'i-pre-05',
        items: [
            {
                name: '콜라겐 재생 시술',
                notes: [
                    '시술 후 1주일간 시술 부위를 강하게 누르지 마세요.',
                    '사우나, 찜질방, 격한 운동은 1주일간 피해주세요.',
                    '붓기는 2~3일 차에 가장 심하고 이후 서서히 가라앉습니다.',
                    '효과는 4~6주에 걸쳐 서서히 나타납니다.',
                ],
            },
        ],
    },
    {
        tab: '피부관리',
        icon: 'i-pre-06',
        items: [
            {
                name: '피부관리·필링',
                notes: [
                    '시술 당일 사우나와 격한 운동을 피해주세요.',
                    '각질이 일어나면 억지로 뜯지 마세요.',
                    '보습과 자외선 차단을 꼼꼼히 해주세요.',
                    '정해진 주기에 맞춰 받으셔야 효과가 누적됩니다.',
                ],
            },
        ],
    },
    {
        tab: '필러',
        icon: 'i-pre-07',
        items: [
            {
                name: '필러',
                notes: [
                    '시술 후 1주일간 시술 부위를 강하게 누르지 마세요.',
                    '사우나, 찜질방, 격한 운동은 1주일간 피해주세요.',
                    '붓기는 2~3일 차에 가장 심하고 이후 서서히 가라앉습니다.',
                    '시술 부위가 창백해지거나 통증이 심해지면 즉시 내원해주세요.',
                ],
            },
        ],
    },
    {
        tab: '제모',
        icon: 'i-pre-08',
        items: [
            {
                name: '제모',
                notes: [
                    '시술 후 24시간은 뜨거운 물 샤워와 사우나를 피해주세요.',
                    '시술 부위에 자극적인 제품을 바르지 마세요.',
                    '털이 빠지는 데 1~2주가 걸립니다. 뽑지 말고 기다려주세요.',
                    '정해진 주기에 맞춰 내원하셔야 효과가 누적됩니다.',
                ],
            },
        ],
    },
] as const;

export default function PrecautionsView() {
    const [tab, setTab] = useState(0);
    const [open, setOpen] = useState(0);
    const [hint, setHint] = useState(true);
    const reduced = useReducedMotion();
    const current = GUIDES[tab];

    const pick = (i: number) => {
        setTab(i);
        setOpen(0);
        setHint(false);
    };

    return (
        <div className="px-6 pb-28 pt-10 lg:pb-24 lg:pt-22.5">
            <div className="mx-auto flex w-full max-w-[1128px] flex-col gap-14 max-lg:gap-10">
                {/* 상단 — 페이지 제목 + 탭 */}
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-0">
                    <h1 className="shrink-0 text-30 font-extrabold leading-[45px] lg:w-[228px]">
                        시술 후
                        <br className="hidden lg:block" />
                        주의사항
                    </h1>

                    <div className="relative max-lg:-mx-6">
                        <ul
                            onScroll={() => setHint(false)}
                            className="flex gap-[23.5px] overflow-x-auto pb-1 [scrollbar-width:none] max-lg:px-6 lg:w-[900px] lg:shrink-0 [&::-webkit-scrollbar]:hidden"
                        >
                            {GUIDES.map((g, i) => (
                                <li key={g.tab} className="shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => pick(i)}
                                        aria-pressed={tab === i}
                                        className={`flex h-[70px] w-[92px] flex-col items-center cursor-pointer justify-center gap-2 rounded-lg bg-cream transition-colors duration-500 ease-brand ${
                                            tab === i
                                                ? 'border border-dark shadow-[2px_2px_5px_0_rgba(0,0,0,0.25)]'
                                                : 'border border-transparent hover:bg-cream/70 '
                                        }`}
                                    >
                                        <Icon name={g.icon} />
                                        <span
                                            className={`whitespace-nowrap text-caption-sm ${
                                                tab === i ? 'font-extrabold' : 'font-semibold'
                                            }`}
                                        >
                                            {g.tab}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/*  툴팁 — 모바일에서만 뜸 */}
                        <AnimatePresence>
                            {hint && (
                                <motion.div
                                    initial={reduced ? false : { opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    transition={{ duration: DUR.fast, ease: EASE }}
                                    className="pointer-events-none absolute left-1/2 top-full z-10 mt-2.5 -translate-x-1/2 lg:hidden"
                                >
                                    <div className="relative rounded-full border border-dark/10 bg-[#816854] px-3.5 py-1.5 text-caption-sm font-medium text-white shadow-[0_2px_8px_rgba(129,104,84,0.25)]">
                                        옆으로 밀어서 더 보기
                                        {/* 작은 화살표 */}
                                        <span
                                            aria-hidden
                                            className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-dark/10 bg-[#816854]"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 하단 — 선택한 분류명 + 아코디언 */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-0">
                    <p className="shrink-0 text-24 font-bold leading-[35px] text-dark lg:w-[228px]">
                        {current.tab}
                        <br />
                        시술 후 주의사항
                    </p>

                    <div className="w-full lg:w-[900px] lg:shrink-0">
                        {/* 아코디언. 헤더 65, 카드 간격 25 */}
                        <ul className="flex flex-col gap-[25px] max-lg:gap-4">
                            {current.items.map((item, i) => {
                                const on = open === i;
                                return (
                                    <li key={item.name} className="overflow-hidden rounded-lg bg-cream">
                                        <button
                                            type="button"
                                            onClick={() => setOpen(on ? -1 : i)}
                                            aria-expanded={on}
                                            className="flex h-[70px] w-full items-center gap-4 px-8 text-left max-lg:h-auto max-lg:min-h-[64px] max-lg:gap-3 max-lg:px-5 max-lg:py-3"
                                        >
                                            <span className="text-20 font-extrabold">{item.name}</span>

                                            <Link
                                                href="/reservation"
                                                onClick={(e) => e.stopPropagation()}
                                                className="shrink-0 whitespace-nowrap rounded-full bg-[#816854] px-3.25 py-1.75 text-caption font-medium text-white transition-colors duration-500 ease-brand hover:bg-[#816854c0]"
                                            >
                                                상담예약
                                            </Link>

                                            <span
                                                aria-hidden="true"
                                                className={`ml-auto shrink-0 transition-transform duration-500 ease-brand ${
                                                    on ? 'rotate-180' : ''
                                                }`}
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-5 w-5 text-dark"
                                                >
                                                    <path d="M6 9l6 6 6-6" />
                                                </svg>
                                            </span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {on && (
                                                <motion.div
                                                    initial={reduced ? false : { height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: DUR.fast, ease: EASE }}
                                                    className="overflow-hidden"
                                                >
                                                    <span aria-hidden="true" className="block h-px w-full bg-dark/10" />
                                                    <ol className="flex list-none flex-col gap-4 lg:gap-3 px-8 py-7 max-lg:px-5 max-lg:py-6 break-keep">
                                                        {item.notes.map((n, idx) => (
                                                            <li
                                                                key={n}
                                                                className="flex gap-2 text-caption font-semibold !leading-[1.4] text-dark max-lg:leading-[1.6]"
                                                            >
                                                                <span className="shrink-0 tabular-nums">
                                                                    {idx + 1}.
                                                                </span>
                                                                {n}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** 탭 아이콘. i-pre-01 ~ i-pre-08.svg, 20x20 */
function Icon({ name }: { name: string }) {
    return <Image src={`/images/${name}.svg`} alt="" width={20} height={20} />;
}
