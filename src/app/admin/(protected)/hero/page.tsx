'use client';

import { useEffect, useState } from 'react';
import { HERO_BANNER } from '@/data/site';
import { getHeroBannerSetting, saveHeroBannerSetting } from '@/lib/settings';

const inputBase =
    'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10';

const LANGS = ['ko', 'en', 'zh'] as const;
type Lang = (typeof LANGS)[number];

const LANG_LABEL: Record<Lang, string> = { ko: '한국어', en: 'English', zh: '中文' };

type Fields = { slogan: string; sub: string; cta: string };

const empty: Fields = { slogan: '', sub: '', cta: '' };

export default function HeroBannerPage() {
    const [lang, setLang] = useState<Lang>('ko');
    const [text, setText] = useState<Record<Lang, Fields>>({
        ko: { ...empty },
        en: { ...empty },
        zh: { ...empty },
    });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let alive = true;
        getHeroBannerSetting().then((s) => {
            if (!alive) return;
            setText({
                ko: { slogan: s?.slogan ?? '', sub: s?.sub ?? '', cta: s?.cta ?? '' },
                en: { slogan: s?.sloganEn ?? '', sub: s?.subEn ?? '', cta: s?.ctaEn ?? '' },
                zh: { slogan: s?.sloganZh ?? '', sub: s?.subZh ?? '', cta: s?.ctaZh ?? '' },
            });
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const setField = (field: keyof Fields, v: string) =>
        setText((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: v } }));

    const filled = (l: Lang) => Boolean(text[l].slogan.trim() || text[l].sub.trim() || text[l].cta.trim());

    const submit = async () => {
        if (!text.ko.slogan.trim()) {
            setLang('ko');
            return alert('한국어 슬로건을 입력하세요.');
        }
        setBusy(true);
        try {
            await saveHeroBannerSetting({
                slogan: text.ko.slogan,
                sloganEn: text.en.slogan,
                sloganZh: text.zh.slogan,
                sub: text.ko.sub,
                subEn: text.en.sub,
                subZh: text.zh.sub,
                cta: text.ko.cta,
                ctaEn: text.en.cta,
                ctaZh: text.zh.cta,
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
            <h1 className="text-2xl font-bold text-[#3a322c] lg:text-3xl">메인 배너 설정</h1>
            <p className="mt-1 text-sm text-neutral-500">
                홈 화면 히어로 배너 문구를 바꿉니다. 위 로고 이미지는 고정이고 슬로건·소개·버튼 글자만 바뀝니다. 엔터로
                줄바꿈하면 홈에도 그대로 보입니다.
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
                        {lang !== 'ko' && (
                            <span className="ml-2 text-xs text-neutral-400">비우면 한국어로 표시됩니다</span>
                        )}
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">
                            슬로건 {lang === 'ko' && <span className="text-rose-500">*</span>}
                        </span>
                        <textarea
                            value={text[lang].slogan}
                            onChange={(e) => setField('slogan', e.target.value)}
                            placeholder={
                                lang === 'ko' ? HERO_BANNER.slogan : lang === 'en' ? HERO_BANNER.sloganEn : HERO_BANNER.sloganZh
                            }
                            rows={2}
                            className={`${inputBase} min-h-[4.25rem] resize-y`}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">소개 문구</span>
                        <textarea
                            value={text[lang].sub}
                            onChange={(e) => setField('sub', e.target.value)}
                            placeholder={lang === 'ko' ? HERO_BANNER.sub : lang === 'en' ? HERO_BANNER.subEn : HERO_BANNER.subZh}
                            rows={2}
                            className={`${inputBase} min-h-[4.25rem] resize-y`}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-neutral-600">버튼 글자</span>
                        <input
                            value={text[lang].cta}
                            onChange={(e) => setField('cta', e.target.value)}
                            placeholder={lang === 'ko' ? HERO_BANNER.cta : lang === 'en' ? HERO_BANNER.ctaEn : HERO_BANNER.ctaZh}
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
