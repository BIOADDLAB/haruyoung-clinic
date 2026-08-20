'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { INTRO_CLOSED_EVENT, INTRO_ELEMENT_ID } from '@/lib/intro';
import { DUR, EASE } from '@/lib/motion';
import { getPopupSetting } from '@/lib/settings';
import { localizedSetting, type PopupTab, type SettingLocale } from '@/types/settings';

/** '오늘 하루 그만 보기' 를 누른 날짜를 담아둔다. 날이 바뀌면 다시 뜬다 */
const HIDE_KEY = 'haruyoung_popup_hidden_until';

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

    const close = () => setOpen(false);

    const hideToday = () => {
        try {
            window.localStorage.setItem(HIDE_KEY, todayKey());
        } catch {}
        setOpen(false);
    };

    const current = tabs[index];

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
                    className="fixed inset-0 z-90 flex items-center justify-center bg-dark/60 px-5 py-8"
                >
                    <button type="button" tabIndex={-1} aria-hidden onClick={close} className="absolute inset-0" />

                    <motion.div
                        initial={reduced ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: DUR.base, ease: EASE }}
                        className="relative flex max-h-full w-full max-w-[420px] flex-col overflow-hidden bg-cream"
                    >
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <PopupImage tab={current} />
                        </div>

                        {tabs.length > 1 && (
                            <ul className="flex shrink-0 border-t border-dark/10">
                                {tabs.map((tab, i) => (
                                    <li key={`${tab.imageUrl}-${i}`} className="min-w-0 flex-1">
                                        <button
                                            type="button"
                                            onClick={() => setIndex(i)}
                                            aria-pressed={i === index}
                                            className={`w-full truncate px-2 py-3 text-caption-sm transition-colors duration-500 ease-brand ${
                                                i === index ? 'bg-dark text-cream' : 'bg-cream text-dark/70'
                                            }`}
                                        >
                                            {localizedSetting(tab, 'label', locale) || t('tab', { n: i + 1 })}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex shrink-0 border-t border-dark/10 bg-dark text-cream">
                            <button
                                type="button"
                                onClick={hideToday}
                                className="flex-1 border-r border-cream/20 py-3.5 text-caption"
                            >
                                {t('hideToday')}
                            </button>
                            <button type="button" onClick={close} className="flex-1 py-3.5 font-display text-caption">
                                {t('close')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/** 이미지 원본 비율을 모르므로 unoptimized + 자동 높이로 그대로 흘린다 */
function PopupImage({ tab }: { tab: PopupTab }) {
    const img = (
        <Image
            src={tab.imageUrl}
            alt=""
            width={840}
            height={1000}
            unoptimized
            className="h-auto w-full object-contain"
        />
    );

    if (!tab.linkUrl) return img;

    return (
        <a href={tab.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
            {img}
        </a>
    );
}
