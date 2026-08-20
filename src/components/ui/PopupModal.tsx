'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { INTRO_CLOSED_EVENT, INTRO_ELEMENT_ID } from '@/lib/intro';
import { DUR, EASE } from '@/lib/motion';
import { getPopupSetting } from '@/lib/settings';
import { localizedSetting, POPUP_IMAGE_SIZE, type PopupTab, type SettingLocale } from '@/types/settings';

/** '오늘 하루 그만 보기' 를 누른 날짜를 담아둔다. 날이 바뀌면 다시 뜬다 */
const HIDE_KEY = 'haruyoung_popup_hidden_until';

/** 탭이 둘 이상이면 이 간격으로 자동으로 넘어간다 */
const AUTO_MS = 5000;

const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function hiddenToday() {
    try {
        return window.localStorage.getItem(HIDE_KEY) === todayKey();
    } catch {
        return false;
    }
}

/**
 * 홈 진입 팝업.
 * 관리자 > 팝업 관리에서 켜고 끄며 탭을 최대 5개까지 등록한다.
 * 인트로가 떠 있으면 인트로가 닫힌 뒤에 올라온다.
 *
 * 이미지는 520×520 정사각 기준이다. PC 는 520px 고정, 모바일은 화면 폭에 맞춰 줄되 비율은 그대로다.
 */
export default function PopupModal() {
    const t = useTranslations('popup');
    const locale = useLocale() as SettingLocale;
    const reduced = useReducedMotion();
    const [tabs, setTabs] = useState<PopupTab[]>([]);
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (hiddenToday()) return;

        let alive = true;
        getPopupSetting().then((setting) => {
            if (!alive || !setting?.enabled) return;
            const usable = setting.tabs.filter((tab) => tab.imageUrl);
            if (usable.length === 0) return;
            setTabs(usable);

            // 인트로가 떠 있으면 닫힌 뒤에 올린다
            if (!document.getElementById(INTRO_ELEMENT_ID)) {
                setOpen(true);
                return;
            }
            window.addEventListener(INTRO_CLOSED_EVENT, () => setOpen(true), { once: true });
        });

        return () => {
            alive = false;
        };
    }, []);

    // 배너처럼 5초마다 다음 탭으로. 탭을 직접 누르면 index 가 바뀌며 타이머도 다시 시작된다
    useEffect(() => {
        if (!open || reduced || tabs.length < 2) return;
        const timer = setTimeout(() => setIndex((i) => (i + 1) % tabs.length), AUTO_MS);
        return () => clearTimeout(timer);
    }, [open, reduced, tabs.length, index]);

    const close = () => setOpen(false);

    const hideToday = () => {
        try {
            window.localStorage.setItem(HIDE_KEY, todayKey());
        } catch {}
        setOpen(false);
    };

    const current = tabs[index];
    /** 탭이 하나여도 관리자가 넣은 이름은 보여준다. 안 보이면 왜 안 나오냐는 말이 나온다 */
    const labels = tabs.map((tab, i) => localizedSetting(tab, 'label', locale) || t('tab', { n: i + 1 }));

    return (
        <AnimatePresence>
            {open && current && (
                <motion.div
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.fast, ease: EASE }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('label')}
                    className="fixed inset-0 z-90 flex items-center justify-center bg-dark/55 px-5 py-10 backdrop-blur-[2px]"
                >
                    <button type="button" tabIndex={-1} aria-hidden onClick={close} className="absolute inset-0" />

                    <motion.div
                        initial={reduced ? false : { opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: DUR.base, ease: EASE }}
                        // 부모에 배경을 깔면 둥근 모서리 안티에일리어싱 틈으로 그 색이 비친다.
                        // 배경은 아래 크림 영역들이 각자 갖는다
                        className="relative flex max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-[18px] shadow-[0_28px_70px_rgba(59,43,30,0.4)]"
                    >
                        {/* 이미지 520×520 정사각. 모바일에서도 비율은 그대로 */}
                        <div className="relative aspect-square w-full shrink-0 overflow-hidden">
                            {/* key 를 주소로 잡아 탭이 바뀌면 스켈레톤부터 다시 시작한다 */}
                            <PopupImage key={current.imageUrl} tab={current} />
                        </div>

                        {/* 탭은 하나여도 그린다. 가로로 넘치면 밀어서 본다 */}
                        <nav
                            aria-label={t('label')}
                            className="flex shrink-0 gap-6 overflow-x-auto border-t border-dark/10 bg-cream px-6 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {tabs.map((tab, i) => (
                                <button
                                    key={`${tab.imageUrl}-${i}`}
                                    type="button"
                                    onClick={() => setIndex(i)}
                                    aria-current={i === index ? 'true' : undefined}
                                    className={`group relative shrink-0 whitespace-nowrap pb-3 text-caption transition-colors duration-500 ease-brand ${
                                        i === index ? 'font-semibold text-dark' : 'text-dark/45 hover:text-dark/70'
                                    }`}
                                >
                                    {labels[i]}
                                    <span
                                        className={`absolute inset-x-0 bottom-0 h-px origin-left bg-dark transition-transform duration-500 ease-brand group-hover:scale-x-100 ${
                                            i === index ? 'scale-x-100' : 'scale-x-0'
                                        }`}
                                    />
                                </button>
                            ))}
                        </nav>

                        <div className="flex shrink-0 border-t border-dark/10 bg-cream">
                            <button
                                type="button"
                                onClick={hideToday}
                                className="flex-1 border-r border-dark/10 py-4 text-caption text-dark/55 transition-colors duration-500 ease-brand hover:text-dark"
                            >
                                {t('hideToday')}
                            </button>
                            <button
                                type="button"
                                onClick={close}
                                // 둥근 모서리 위에서 배경색을 덮으면 안티에일리어싱 틈으로 아래 크림이 비친다.
                                // 하단 두 버튼 모두 글자색만 바꾼다
                                className="flex-1 py-4 font-display text-caption tracking-[0.08em] text-dark/70 transition-colors duration-500 ease-brand hover:text-dark"
                            >
                                {t('close')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * 권장 규격(520×520)을 벗어난 이미지는 가운데를 기준으로 잘라 채운다.
 * 받아오는 동안에는 스켈레톤을 덮어둔다. 다 받으면 스켈레톤은 아예 사라진다.
 */
function PopupImage({ tab }: { tab: PopupTab }) {
    const [loaded, setLoaded] = useState(false);

    const img = (
        <Image
            src={tab.imageUrl}
            alt=""
            width={POPUP_IMAGE_SIZE}
            height={POPUP_IMAGE_SIZE}
            unoptimized
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className="h-full w-full object-cover"
        />
    );

    return (
        <>
            {tab.linkUrl ? (
                <a href={tab.linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                    {img}
                </a>
            ) : (
                img
            )}

            {!loaded && <span aria-hidden="true" className="absolute inset-0 bg-sand motion-safe:animate-pulse" />}
        </>
    );
}
