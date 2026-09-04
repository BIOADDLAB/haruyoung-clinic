'use client';

import { useEffect, useState } from 'react';
import { PROMOTION_BANNER } from '@/data/site';
import { getPromotionBannerSetting, savePromotionBannerSetting } from '@/lib/settings';

const inputBase =
    'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10';

const LANGS = ['ko', 'en', 'zh'] as const;
type Lang = (typeof LANGS)[number];

const LANG_LABEL: Record<Lang, string> = { ko: '한국어', en: 'English', zh: '中文' };

export default function SettingsPage() {
    const [lang, setLang] = useState<Lang>('ko');
    const [text, setText] = useState<Record<Lang, { title: string; subtitle: string }>>({
        ko: { title: '', subtitle: '' },
        en: { title: '', subtitle: '' },
        zh: { title: '', subtitle: '' },
    });
    const [titleVisible, setTitleVisible] = useState(true);
    const [subtitleVisible, setSubtitleVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let alive = true;
        getPromotionBannerSetting().then((s) => {
            if (!alive) return;
            setTitleVisible(s?.titleVisible !== false);
            setSubtitleVisible(s?.subtitleVisible !== false);
            setText({
                ko: { title: s?.title ?? '', subtitle: s?.subtitle ?? '' },
                en: { title: s?.titleEn ?? '', subtitle: s?.subtitleEn ?? '' },
                zh: { title: s?.titleZh ?? '', subtitle: s?.subtitleZh ?? '' },
            });
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const setField = (field: 'title' | 'subtitle', v: string) =>
        setText((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: v } }));

    const filled = (l: Lang) => Boolean(text[l].title.trim() || text[l].subtitle.trim());

    const submit = async () => {
        if (titleVisible && !text.ko.title.trim()) {
            setLang('ko');
            return alert('한국어 제목을 입력하세요.');
        }
        setBusy(true);
        try {
            await savePromotionBannerSetting({
                titleVisible,
                subtitleVisible,
                title: text.ko.title,
                titleEn: text.en.title,
                titleZh: text.zh.title,
                subtitle: text.ko.subtitle,
                subtitleEn: text.en.subtitle,
                subtitleZh: text.zh.subtitle,
            });
            alert('저장했습니다.');
        } catch {
            alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div className="w-full max-w-4xl">
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">프로모션 배너 설정</h1>
            <p className="mt-1 text-sm text-neutral-500">
                프로모션 페이지 배너 문구를 바꿉니다. 로고 이미지는 고정이고 아래 두 줄만 바뀝니다.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="space-y-6 p-6 sm:p-8">
                    <div className="flex items-center gap-1.5 border-b border-black/[0.06] pb-4">
                        {LANGS.map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => setLang(l)}
                                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
                                    lang === l
                                        ? 'bg-[#3a322c] text-white'
                                        : 'border border-neutral-200 bg-white text-neutral-600'
                                }`}
                            >
                                {LANG_LABEL[l]}
                                {filled(l) && (
                                    <span
                                        aria-hidden="true"
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            lang === l ? 'bg-white' : 'bg-emerald-500'
                                        }`}
                                    />
                                )}
                            </button>
                        ))}
                        {lang !== 'ko' && <span className="ml-2 text-xs text-neutral-400">비우면 한국어로 표시됩니다</span>}
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="flex items-center justify-between gap-3 text-[13px] font-medium text-neutral-600">
                            <span>
                                배너 제목 {lang === 'ko' && titleVisible && <span className="text-rose-500">*</span>}
                            </span>
                            <span className="flex items-center gap-1.5 font-normal">
                                <input
                                    type="checkbox"
                                    checked={titleVisible}
                                    onChange={(e) => setTitleVisible(e.target.checked)}
                                    className="h-3.5 w-3.5 accent-[#3a322c]"
                                />
                                노출
                            </span>
                        </span>
                        <input
                            value={text[lang].title}
                            onChange={(e) => setField('title', e.target.value)}
                            placeholder={PROMOTION_BANNER.title}
                            className={inputBase}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="flex items-center justify-between gap-3 text-[13px] font-medium text-neutral-600">
                            배너 부제
                            <span className="flex items-center gap-1.5 font-normal">
                                <input
                                    type="checkbox"
                                    checked={subtitleVisible}
                                    onChange={(e) => setSubtitleVisible(e.target.checked)}
                                    className="h-3.5 w-3.5 accent-[#3a322c]"
                                />
                                노출
                            </span>
                        </span>
                        <input
                            value={text[lang].subtitle}
                            onChange={(e) => setField('subtitle', e.target.value)}
                            placeholder={PROMOTION_BANNER.subtitle}
                            className={inputBase}
                        />
                    </label>
                </div>

                <div className="flex justify-end gap-2 border-t border-black/[0.06] bg-neutral-50 px-6 py-4 sm:px-8">
                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy}
                        className="rounded-xl bg-[#3a322c] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {busy ? '저장 중…' : '저장'}
                    </button>
                </div>
            </div>
        </div>
    );
}
