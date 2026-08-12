'use client';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { DUR, EASE } from '@/lib/motion';
import { Link } from '@/i18n/navigation';

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
                    '시술 당일 세안 및 화장은 가급적 피해주세요.',
                    '시술 부위에 붉은기, 부기, 멍, 엠보싱(올록볼록한 느낌)이 일시적으로 나타날 수 있습니다.',
                    '눈이 무겁거나 눈썹 모양이 일시적으로 변하는 느낌이 있을 수 있으나 대부분 자연스럽게 호전됩니다.',
                    '시술 후 3~7일간 음주, 흡연, 사우나, 찜질방은 피해주세요.',
                    '충분한 보습 관리와 자외선 차단을 해주세요.',
                ],
            },
            {
                name: '윤곽주사',
                notes: [
                    '시술 당일부터 세안, 메이크업, 샤워가 가능합니다.',
                    '시술 후 1주일간 사우나, 음주, 흡연은 피해주세요.',
                    '주사 시술 특성상 멍이 발생할 수 있으며 보통 5~7일 내 자연스럽게 사라집니다.',
                    '약물 작용으로 일시적인 붓기가 발생할 수 있으며 보통 수시간 내 점차 완화됩니다.',
                    '개인의 지방량과 체질에 따라 시술 효과에는 차이가 있을 수 있으며, 보다 만족스러운 결과를 위해 여러 차례 반복 시술이 필요할 수 있습니다.',
                ],
            },
        ],
    },
    {
        tab: '스킨부스터',
        icon: 'i-pre-02',
        items: [
            {
                name: '쥬베룩스킨',
                notes: [
                    '시술 후 주사 부위에 붓기, 홍반, 멍, 압통, 가려움 등이 나타날 수 있으며 대부분 1~2주 이내 자연스럽게 완화됩니다.',
                    '피부 얕은 층에 주입되는 경우 엠보싱(주사 자국처럼 볼록하게 올라오는 현상)이 나타날 수 있으며 보통 수시간~수일 내 자연스럽게 사라집니다.',
                    '콜라겐 생성 과정에 따라 약 4~6주 이후부터 피부 탄력 및 잔주름 개선 효과가 점진적으로 나타날 수 있습니다.',
                    '시술 후 3~7일 동안 음주, 사우나, 찜질방, 격한 운동 등 체온을 높이는 활동은 피하는 것이 좋습니다.',
                    '피부가 건조하거나 예민해질 수 있으므로 재생크림 및 보습 관리와 자외선 차단제를 충분히 사용해 주시기 바랍니다.',
                    '심한 통증, 지속적인 붓기, 결절 등 비정상적인 증상이 나타날 경우 병원으로 연락 후 내원해 주시기 바랍니다.',
                ],
            },
            {
                name: '스킨부스터',
                notes: [
                    '시술 후 2~3시간 동안 세안 및 화장은 피해주세요.',
                    '시술 후 3~7일간 음주, 흡연, 사우나, 찜질방, 수영장 이용은 피해주세요.',
                    '멍, 붓기, 통증이 발생할 수 있으며 보통 1~2주 내 자연스럽게 완화됩니다.',
                    '엠보싱(올록볼록한 느낌)이 나타날 수 있으며 보통 2~3일, 길게는 약 1주 정도 지속될 수 있습니다.',
                    '1주 이상 지속되거나 불편감이 심한 경우 병원으로 연락 후 내원해주세요.',
                ],
            },
        ],
    },
    {
        tab: '레이저 리프팅',
        icon: 'i-pre-03',
        items: [
            {
                name: '써마지 · 덴서티',
                notes: [
                    '시술 후 붉은기, 열감, 붓기가 일시적으로 나타날 수 있습니다.',
                    '드물게 미세한 물집 또는 피부 자극 반응이 발생할 수 있습니다.',
                    '대부분의 증상은 수일 내 자연스럽게 호전됩니다.',
                    '보습 관리와 자외선 차단을 충분히 해주세요.',
                    '콜라겐 재생으로 인해 효과는 2~6개월에 걸쳐 점진적으로 나타날 수 있습니다.',
                ],
            },
            {
                name: '울쎄라',
                notes: [
                    '시술 후 붉은기, 열감, 붓기, 저림, 욱신거림이 나타날 수 있으나 대부분 1~2주 이내 자연스럽게 호전됩니다.',
                    '시술 후 하얀 웰츠(엠보싱)이 자연스럽게 나타날 수 있으나 이 역시 1~2주 내에 자연스럽게 호전됩니다.',
                    '자외선 차단 및 보습 관리를 충분히 해주세요.',
                    '턱선이나 볼 부위에 통증이나 뻐근한 느낌이 1~2주 지속될 수 있습니다.',
                    '시술 효과는 2~3개월에 걸쳐 점진적으로 나타납니다.',
                ],
            },
            {
                name: '아이써마지',
                notes: [
                    '시술 후 붉은기, 열감, 붓기가 일시적으로 나타날 수 있습니다.',
                    '드물게 미세한 물집 또는 피부 자극 반응이 발생할 수 있습니다.',
                    '대부분의 증상은 수일 내 자연스럽게 호전됩니다.',
                    '보습 관리와 자외선 차단을 충분히 해주세요.',
                    '콜라겐 재생으로 인해 효과는 2~6개월에 걸쳐 점진적으로 나타날 수 있습니다.',
                    '아이써마지는 얇고 예민한 눈가 전용 팁을 사용하는 시술로, 기본 주의사항은 일반 써마지와 동일합니다.',
                    '시술 시 안구 보호를 위해 전용 아이쉴드(보호 렌즈)를 착용할 수 있으며,',
                    '사용된 점안액으로 인해 시술 후 일시적으로 눈이 시리거나 시야가 흐릿하게 느껴질 수 있습니다.',
                    '이러한 증상은 수 시간 내 자연스럽게 회복됩니다.',
                ],
            },
            {
                name: '인모드 · 리니어지',
                notes: [
                    '시술 후 붉은기, 열감, 붓기, 저림, 욱신거림이 나타날 수 있으나 대부분 1~2주 이내 자연스럽게 호전됩니다.',
                    '시술 후 간단한 세안 및 화장은 가능하며, 피부에 자극이 되는 각질제거는 피해주세요.',
                    '시술 후 미온수로 세안해서 따뜻한 느낌을 지속시켜주어야 효과가 좋아요.',
                    '시술 후 피부가 예민해질 수 있으므로 보습 관리와 자외선 차단을 충분히 해주세요.',
                    '시술 후 3~7일 동안 음주, 사우나, 찜질방, 격한 운동 등 체온을 높이는 활동은 피하는 것이 좋습니다.',
                ],
            },
        ],
    },
    {
        tab: '색소·점',
        icon: 'i-pre-04',
        items: [
            {
                name: '토닝',
                notes: [
                    '시술 후 가벼운 세안 및 화장은 당일부터 가능합니다.',
                    '레티놀, 필링제, 기능성 화장품 등 자극이 강한 제품은 5~7일간 사용을 피해주세요.',
                    '충분한 보습 관리와 수분 섭취를 해주세요.',
                    '피부를 긁거나 딱지를 억지로 제거하지 말고 자연 탈락되도록 해주세요.',
                    '외출 시 자외선 차단제를 충분히 사용해주세요.',
                ],
            },
            {
                name: '점 제거 · 비립종 · 사마귀 · 쥐젖',
                notes: [
                    '세안은 시술 다음날부터 가능합니다.',
                    '부착해드린 재생테이프를 유지한 상태로 세안해 주세요.',
                    '재생테이프는 약 1~2주간 사용하는 것을 권장하며, 습윤 상태에 따라 교체해 주세요.',
                    '시술 부위는 재발할 수 있으며 필요 시 8~12주 후 재시술이 가능합니다.',
                    '외출 시 자외선 차단제를 충분히 발라주시고 재생크림을 함께 사용하면 회복에 도움이 됩니다.',
                ],
            },
        ],
    },
    {
        tab: '콜라겐 재생',
        icon: 'i-pre-05',
        items: [
            {
                name: '쥬베룩볼륨',
                notes: [
                    '시술 후 주사 부위에 붓기, 홍반, 멍, 압통, 가려움 등이 나타날 수 있으며 대부분 1~2주 이내 자연스럽게 완화됩니다.',
                    '시술 직후 나타나는 볼륨감은 시간이 지나면서 자연스럽게 감소합니다.',
                    '콜라겐 생성 과정은 개인차가 있으며 보통 4~6주 이후부터 점진적으로 피부 탄력 및 볼륨 개선 효과가 나타납니다.',
                    '시술 후 약 3일간 하루 3회, 3분 정도 부드러운 마사지(3-3-3 마사지)를 권장합니다.',
                    '시술 후 3~7일 동안 음주, 사우나, 찜질방, 격한 운동 등 체온을 높이는 활동은 피하는 것이 좋습니다.',
                    '드물게 결절, 지속적인 붓기, 심한 통증 등이 발생할 수 있으며 이러한 증상이 지속될 경우 병원으로 연락 후 내원해 주시기 바랍니다.',
                ],
            },
            {
                name: '스컬트라',
                notes: [
                    '시술 후 주사 부위에 붓기, 홍반, 멍, 압통, 가려움 등이 나타날 수 있으며 대부분 1~2주 이내 자연스럽게 완화됩니다.',
                    '시술 직후 나타나는 볼륨감은 시간이 지나면서 자연스럽게 감소합니다.',
                    '콜라겐 생성 과정은 개인차가 있으며 보통 4~6주 이후부터 점진적으로 피부 탄력 및 볼륨 개선 효과가 나타납니다.',
                    '시술 후 약 5일간 하루 5회, 5분 정도 부드러운 마사지(5-5-5 마사지)를 권장합니다.',
                    '시술 후 3~7일 동안 음주, 사우나, 찜질방, 격한 운동 등 체온을 높이는 활동은 피하는 것이 좋습니다.',
                    '드물게 결절, 지속적인 붓기, 심한 통증 등이 발생할 수 있으며 이러한 증상이 지속될 경우 병원으로 연락 후 내원해 주시기 바랍니다.',
                ],
            },
        ],
    },
    {
        tab: '피부관리',
        icon: 'i-pre-06',
        items: [
            {
                name: 'LDM',
                notes: [
                    '시술 시 약간의 열감이 느껴질 수 있습니다.',
                    '시술 후 세안 및 화장 등 일상생활은 바로 가능합니다.',
                    '시술 후 일시적으로 붉은기나 열감이 나타날 수 있으나 대부분 수시간 내 자연스럽게 완화됩니다.',
                    '시술 후 피부가 예민해질 수 있으므로 보습 관리와 자외선 차단을 충분히 해주세요.',
                    '피부 상태에 따라 일시적인 당김이나 건조함이 느껴질 수 있습니다.',
                ],
            },
            {
                name: '포텐자',
                notes: [
                    '시술 후 붉은기, 열감, 부기가 나타날 수 있으며 보통 3~7일 내 점차 완화됩니다.',
                    '미세한 딱지가 형성될 수 있으며 보통 3~5일 후 자연스럽게 탈락됩니다.',
                    '딱지는 억지로 제거하거나 문지르지 말고 자연스럽게 탈락되도록 해주세요.',
                    '충분한 수분 섭취와 보습 관리가 피부 회복에 도움이 됩니다.',
                    '외출 시 자외선 차단제를 발라주세요.',
                    '시술 후 약 1주간 음주, 사우나, 격한 운동은 피해주세요.',
                    '2주간 스크럽 등 피부 자극이 강한 시술이나 홈케어는 피해주세요.',
                ],
            },
            {
                name: '프락셀',
                notes: [
                    '시술 후 따끔거림, 붉은기, 붓기, 가려움 등이 나타날 수 있습니다.',
                    '3~5일 후 미세한 딱지와 각질이 형성되며 자연스럽게 탈락됩니다.',
                    '딱지를 억지로 제거할 경우 색소침착이 발생할 수 있으므로 손으로 긁거나 뜯지 마세요.',
                    '세안은 시술 다음날부터 가능합니다.',
                    '외출 시 자외선 차단제를 충분히 발라주세요.',
                    '피부 재생이 완료될 때까지 음주, 사우나, 찜질방, 수영장은 피해주세요.',
                ],
            },
            {
                name: '필링',
                notes: [
                    '시술 후 세안 시 얼굴을 강하게 문지르지 마세요.',
                    '시술 후 피부가 민감해질 수 있으므로 직사광선을 피하고 외출 시 자외선 차단제를 발라주세요.',
                    '1주일 동안 과도한 운동, 수영장, 사우나, 음주 및 자극적인 음식은 피하는 것이 좋습니다.',
                    '스크럽 제품, 필링 패드 및 레티놀·비타민C 등 피부에 자극이 되는 제품은 약 1주일 후부터 사용해주세요.',
                    '붉은기 완화를 위해 재생크림을 충분히 발라주시고 불편한 증상이 있을 경우 병원으로 문의해주세요.',
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
                    '시술 후 3~7일간 음주, 흡연, 사우나, 찜질방, 격한 운동은 피해주세요.',
                    '시술 부위에 멍, 붓기, 통증이 발생할 수 있으며 보통 1~2주 내 자연스럽게 호전됩니다.',
                    '시술 후 2~3시간 동안 세안 및 화장은 피해주세요.',
                    '시술 부위를 강하게 누르거나 마사지하는 행동은 삼가주세요.',
                    '시술 부위에 일시적인 이물감이나 단단한 느낌이 있을 수 있으나 대부분 시간이 지나면서 자연스럽게 호전됩니다.',
                    '피부 색 변화, 심한 통증, 시야 이상, 과도한 붓기 등이 발생할 경우 병원으로 연락 후 내원해주세요.',
                ],
            },
            {
                name: '히알라제',
                notes: [
                    '시술 후 1주일 정도 시술 부위에 강한 자극(마사지, 경락 등)은 피해주세요.',
                    '음주, 흡연, 사우나, 찜질방은 약 1주일간 피하는 것이 좋습니다.',
                    '멍, 붓기가 발생할 수 있으며 보통 1주 정도 지속될 수 있습니다.',
                    '붉은기, 가려움, 알레르기 반응이 나타날 수 있으며 증상이 지속될 경우 병원으로 문의해주세요.',
                    '녹인 부위의 필러 재시술은 보통 1주 이후 가능합니다.',
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
                    '시술 전날 저녁 면도 후 내원해 주시고 당일 면도는 가급적 피해주세요.',
                    '시술 당일 가벼운 샤워는 가능하나 시술 부위를 강하게 문지르지 마세요.',
                    '사우나, 찜질방, 수영장은 약 1주일간 피해주세요.',
                    '제모 후 털의 잔해가 5~7일 정도 남아 있다가 자연스럽게 탈락될 수 있습니다.',
                    '바디 제모 후 모낭염(붉은 뾰루지)이 발생할 수 있으며 증상이 지속될 경우 병원으로 문의해주세요.',
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
