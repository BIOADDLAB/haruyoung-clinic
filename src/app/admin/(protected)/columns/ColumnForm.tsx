'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import ColumnEditor from './ColumnEditor';
import { COLUMN_HTML_CLASS } from '@/components/column/columnHtml';
import { MENU_CATEGORIES } from '@/constants/categories';
import { suggestSlug, suggestSummary, translateColumn } from '@/lib/columnAi';
import { addColumn, updateColumn, uploadColumnImage } from '@/lib/columns';
import type { Column, ColumnLang, ColumnSeed } from '@/types/column';

const inputBase =
    'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#3a322c] placeholder:text-neutral-400 outline-none transition focus:border-[#3a322c]/30 focus:ring-2 focus:ring-[#3a322c]/10';

type LangText = {
    title: string;
    summary: string;
    content: string;
};

const EMPTY_TEXT: LangText = { title: '', summary: '', content: '' };

function langText(src?: { title?: string; summary?: string; content?: string } | null): LangText {
    return {
        title: src?.title ?? '',
        summary: src?.summary ?? '',
        content: src?.content ?? '',
    };
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function sanitizeSlug(v: string) {
    return v
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function ColumnForm({
    initial,
    onSaved,
    onCancel,
}: {
    initial?: Column;
    onSaved?: () => void;
    onCancel?: () => void;
}) {
    const [text, setText] = useState<Record<'ko' | 'en' | 'zh', LangText>>({
        ko: langText(initial),
        en: initial?.en ? langText(initial.en) : EMPTY_TEXT,
        zh: initial?.zh ? langText(initial.zh) : EMPTY_TEXT,
    });
    const [approved, setApproved] = useState<Record<ColumnLang, boolean>>({
        en: initial?.en?.approved ?? false,
        zh: initial?.zh?.approved ?? false,
    });

    const [lang, setLang] = useState<'ko' | 'en' | 'zh'>('ko');
    const [slug, setSlug] = useState(initial?.slug ?? '');
    const [category, setCategory] = useState(initial?.category ?? MENU_CATEGORIES[0].slug);
    const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '');
    const [publishedAt, setPublishedAt] = useState(initial?.publishedAt ?? today());
    const [published, setPublished] = useState(initial?.published ?? false);

    const [busy, setBusy] = useState(false);
    const [slugBusy, setSlugBusy] = useState(false);
    const [summaryBusy, setSummaryBusy] = useState(false);
    const [coverBusy, setCoverBusy] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [compare, setCompare] = useState(false);
    const [error, setError] = useState('');

    const coverInput = useRef<HTMLInputElement>(null);

    const setField = (field: keyof LangText, v: string) =>
        setText((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: v } }));

    /** 탭 상태 뱃지 */
    const badge = (l: 'ko' | 'en' | 'zh') => {
        if (l === 'ko') return published ? { label: '발행', cls: 'bg-emerald-500 text-white' } : { label: '임시저장', cls: 'bg-neutral-300 text-neutral-700' };
        if (!text[l].content.trim()) return { label: '미번역', cls: 'bg-neutral-200 text-neutral-500' };
        if (!approved[l]) return { label: 'AI 초안', cls: 'bg-amber-400 text-white' };
        return { label: '검수 완료', cls: 'bg-emerald-500 text-white' };
    };

    const handleSuggestSlug = async () => {
        if (!text.ko.title.trim()) {
            setError('먼저 한국어 제목을 입력해 주세요.');
            return;
        }
        setSlugBusy(true);
        setError('');
        try {
            const s = await suggestSlug(text.ko.title.trim());
            if (s) setSlug(s);
        } catch {
            setError('slug 자동 생성에 실패했습니다. 직접 입력해 주세요.');
        } finally {
            setSlugBusy(false);
        }
    };

    const handleSuggestSummary = async () => {
        if (!text.ko.content.trim()) {
            setError('먼저 한국어 본문을 작성해 주세요.');
            return;
        }
        setSummaryBusy(true);
        setError('');
        try {
            const s = await suggestSummary(text.ko.title.trim(), text.ko.content);
            if (s) setText((prev) => ({ ...prev, ko: { ...prev.ko, summary: s } }));
        } catch (e) {
            setError(e instanceof Error ? e.message : '요약문 생성에 실패했습니다. 직접 입력해 주세요.');
        } finally {
            setSummaryBusy(false);
        }
    };

    const handleTranslate = async (target: ColumnLang) => {
        if (!text.ko.title.trim() || !text.ko.content.trim()) {
            setError('한국어 제목과 본문을 먼저 작성해 주세요.');
            return;
        }
        if (text[target].content.trim() && !window.confirm('기존 번역 내용을 덮어씁니다. 계속할까요?')) return;

        setTranslating(true);
        setError('');
        try {
            const r = await translateColumn(
                {
                    title: text.ko.title,
                    summary: text.ko.summary,
                    content: text.ko.content,
                },
                target,
            );
            setText((prev) => ({
                ...prev,
                [target]: {
                    title: r.title || '',
                    summary: r.summary || '',
                    content: r.content || '',
                },
            }));
            // 새 번역은 반드시 다시 검수한다
            setApproved((prev) => ({ ...prev, [target]: false }));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'AI 번역에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setTranslating(false);
        }
    };

    const handleCoverImage = async (file: File) => {
        setError('');
        setCoverBusy(true);
        try {
            const url = await uploadColumnImage(file);
            setCoverImage(url);
            // 기존 파일은 지우지 않는다. 저장 전에 취소하면 발행된 글이 깨진 이미지를 참조하게 된다
        } catch {
            setError('이미지 업로드에 실패했습니다.');
        } finally {
            setCoverBusy(false);
        }
    };

    const save = async () => {
        const ko = text.ko;
        if (!ko.title.trim()) return setError('한국어 제목은 필수입니다.');
        if (!ko.content.trim()) return setError('한국어 본문은 필수입니다.');
        const cleanSlug = sanitizeSlug(slug);
        if (!cleanSlug) return setError('slug 를 입력해 주세요. (영문·숫자·하이픈)');
        if (!coverImage) return setError('대표 이미지를 올려 주세요.');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) return setError('게시일을 선택해 주세요.');

        const translation = (l: ColumnLang) =>
            text[l].content.trim()
                ? {
                      title: text[l].title.trim(),
                      summary: text[l].summary.trim(),
                      content: text[l].content,
                      approved: approved[l],
                  }
                : null;

        const now = new Date().toISOString();
        const seed: ColumnSeed = {
            slug: cleanSlug,
            category,
            coverImage,
            published,
            publishedAt,
            createdAt: initial?.createdAt ?? now,
            updatedAt: now,
            title: ko.title.trim(),
            summary: ko.summary.trim(),
            content: ko.content,
            en: translation('en'),
            zh: translation('zh'),
        };

        setBusy(true);
        setError('');
        try {
            if (initial) await updateColumn(initial.id, seed);
            else await addColumn(seed);
            onSaved?.();
        } catch {
            setError('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setBusy(false);
        }
    };

    const isTranslationTab = lang !== 'ko';
    const cur = text[lang];

    return (
        <div className="w-full max-w-[1100px] rounded-2xl border border-neutral-200 bg-white p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-[#3a322c]">{initial ? '칼럼 수정' : '새 칼럼 작성'}</h2>

            {/* 언어 공통 필드. slug 는 한국어 제목에서 만들어지므로 한국어 탭의 제목 아래에 있다 */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium text-neutral-600">
                        카테고리 <span className="text-rose-500">*</span>
                    </span>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputBase}>
                        {MENU_CATEGORIES.map((c) => (
                            <option key={c.slug} value={c.slug}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium text-neutral-600">
                        게시일 <span className="text-rose-500">*</span>
                    </span>
                    <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputBase} />
                </label>

                <ImageField
                    label="대표 이미지"
                    required
                    hint="상세 상단·공유·목록 썸네일 공통 · 권장 1200×630px"
                    url={coverImage}
                    busy={coverBusy}
                    inputRef={coverInput}
                    onFile={(f) => void handleCoverImage(f)}
                    onClear={() => {
                        // Storage 파일은 지우지 않는다 (저장 전 취소 대비). 참조만 비운다
                        setCoverImage('');
                    }}
                />
            </div>

            {/* 언어 탭 */}
            <div className="mt-8 flex items-end gap-1 border-b border-neutral-200">
                {(['ko', 'en', 'zh'] as const).map((l) => {
                    const b = badge(l);
                    return (
                        <button
                            key={l}
                            type="button"
                            onClick={() => {
                                setLang(l);
                                setCompare(false);
                            }}
                            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm transition ${
                                lang === l
                                    ? 'border border-b-0 border-neutral-200 bg-white font-semibold text-[#3a322c]'
                                    : 'text-neutral-500 hover:text-[#3a322c]'
                            }`}
                        >
                            {l === 'ko' ? '한국어' : l === 'en' ? 'English' : '中文'}
                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${b.cls}`}>{b.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* 번역 탭 도구 */}
            {isTranslationTab && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3">
                    <button
                        type="button"
                        onClick={() => void handleTranslate(lang as ColumnLang)}
                        disabled={translating}
                        className="rounded-xl bg-[#3a322c] px-4 py-2 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                        {translating ? 'AI 번역 중…' : cur.content.trim() ? '🌐 다시 번역' : '🌐 한국어 원문에서 AI 번역 생성'}
                    </button>
                    {cur.content.trim() !== '' && (
                        <>
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                                <input
                                    type="checkbox"
                                    checked={approved[lang as ColumnLang]}
                                    onChange={(e) => setApproved((prev) => ({ ...prev, [lang]: e.target.checked }))}
                                    className="h-4 w-4 accent-emerald-600"
                                />
                                검수 완료 (체크해야 이 언어 페이지가 공개됩니다)
                            </label>
                            <button
                                type="button"
                                onClick={() => setCompare((v) => !v)}
                                className="ml-auto text-sm text-neutral-500 underline-offset-2 hover:underline"
                            >
                                {compare ? '원문 비교 닫기' : '원문 비교'}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* 번역 탭에서 아직 번역 전이면 입력폼 대신 안내만 */}
            {isTranslationTab && !cur.content.trim() ? (
                <p className="mt-6 rounded-xl border border-dashed border-neutral-300 px-5 py-10 text-center text-sm text-neutral-400">
                    아직 번역이 없습니다. 위의 버튼으로 AI 번역 초안을 만든 뒤 검수해 주세요.
                </p>
            ) : (
                <div className={`mt-6 grid gap-6 ${compare ? 'lg:grid-cols-2' : ''}`}>
                    {/* 원문 비교 (읽기 전용) */}
                    {compare && (
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                            <p className="mb-2 text-[13px] font-medium text-neutral-500">한국어 원문</p>
                            <p className="text-[15px] font-semibold text-[#3a322c]">{text.ko.title}</p>
                            {text.ko.summary && <p className="mt-1 text-sm text-neutral-600">{text.ko.summary}</p>}
                            <div
                                className={`${COLUMN_HTML_CLASS} mt-4 max-h-[480px] overflow-y-auto border-t border-neutral-200 pt-3 text-sm`}
                                dangerouslySetInnerHTML={{ __html: text.ko.content }}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-5">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                제목 {lang === 'ko' && <span className="text-rose-500">*</span>}
                            </span>
                            <input
                                value={cur.title}
                                onChange={(e) => setField('title', e.target.value)}
                                onBlur={() => {
                                    // 한국어 제목을 입력하고 벗어나면 slug 가 비어 있을 때 자동 제안한다
                                    if (lang === 'ko' && !slug.trim() && text.ko.title.trim()) void handleSuggestSlug();
                                }}
                                placeholder={lang === 'ko' ? '예: 기미 레이저 후 관리법' : ''}
                                className={inputBase}
                            />
                        </label>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                본문 {lang === 'ko' && <span className="text-rose-500">*</span>}
                            </span>
                            <ColumnEditor key={lang} value={cur.content} onChange={(html) => setField('content', html)} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-neutral-600">
                                요약문 <span className="font-normal text-neutral-400">(목록·검색 미리보기에 표시)</span>
                            </span>
                            <div className="flex gap-2">
                                <textarea
                                    value={cur.summary}
                                    onChange={(e) => setField('summary', e.target.value)}
                                    rows={2}
                                    placeholder={summaryBusy ? '생성 중…' : ''}
                                    className={`${inputBase} resize-none`}
                                />
                                {lang === 'ko' && (
                                    <button
                                        type="button"
                                        onClick={() => void handleSuggestSummary()}
                                        disabled={summaryBusy}
                                        className="shrink-0 self-stretch rounded-xl border border-neutral-300 px-4 text-sm text-neutral-600 transition hover:border-[#3a322c] hover:text-[#3a322c] disabled:opacity-50"
                                    >
                                        {summaryBusy ? '생성 중…' : 'AI 작성'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* slug 는 세 언어가 같은 값을 쓴다. 제목 입력 시 자동 생성된다 */}
                        {lang === 'ko' && (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[13px] font-medium text-neutral-600">
                                    URL slug <span className="text-rose-500">*</span>{' '}
                                    <span className="font-normal text-neutral-400">
                                        (영문·숫자·하이픈 · 제목 입력 시 자동 생성 · 세 언어 공통)
                                    </span>
                                </span>
                                <div className="flex gap-2">
                                    <input
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        onBlur={() => setSlug(sanitizeSlug(slug))}
                                        placeholder={slugBusy ? '생성 중…' : 'melasma-laser-aftercare'}
                                        className={inputBase}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void handleSuggestSlug()}
                                        disabled={slugBusy}
                                        className="shrink-0 rounded-xl border border-neutral-300 px-4 text-sm text-neutral-600 transition hover:border-[#3a322c] hover:text-[#3a322c] disabled:opacity-50"
                                    >
                                        {slugBusy ? '생성 중…' : 'AI 다시 제안'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="mt-5 text-sm text-rose-500">{error}</p>}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-5">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="h-4 w-4 accent-emerald-600"
                    />
                    발행 (해제하면 임시저장 상태로 사이트에 노출되지 않습니다)
                </label>
                <div className="flex gap-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm text-neutral-600 transition hover:border-[#3a322c] hover:text-[#3a322c]"
                        >
                            취소
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => void save()}
                        disabled={busy}
                        className="rounded-xl bg-[#3a322c] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                        {busy ? '저장 중…' : '저장'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ImageField({
    label,
    hint,
    required,
    url,
    busy,
    inputRef,
    onFile,
    onClear,
}: {
    label: string;
    hint: string;
    required?: boolean;
    /** 업로드 중이면 미리보기에 스피너를 띄우고 버튼을 잠근다 */
    busy?: boolean;
    url: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onFile: (file: File) => void;
    onClear: () => void;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-neutral-600">
                {label} {required && <span className="text-rose-500">*</span>}{' '}
                <span className="font-normal text-neutral-400">({hint})</span>
            </span>
            <div className="flex items-center gap-3">
                <div className="relative h-20 w-32 shrink-0">
                    {url ? (
                        <div className="relative h-full w-full overflow-hidden rounded-lg border border-neutral-200">
                            <Image src={url} alt={label} fill unoptimized className="object-cover" />
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400">
                            {busy ? '' : '없음'}
                        </div>
                    )}
                    {busy && (
                        <div
                            role="status"
                            aria-label="이미지 업로드 중"
                            className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70"
                        >
                            <span
                                aria-hidden="true"
                                className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700"
                            />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-1.5">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={busy}
                        className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                            busy
                                ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                                : 'border-neutral-300 text-neutral-600 hover:border-[#3a322c] hover:text-[#3a322c]'
                        }`}
                    >
                        {busy ? '업로드 중…' : url ? '교체' : '업로드'}
                    </button>
                    {url && !busy && (
                        <button type="button" onClick={onClear} className="text-xs text-rose-500">
                            삭제
                        </button>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFile(file);
                        e.target.value = '';
                    }}
                />
            </div>
        </div>
    );
}
