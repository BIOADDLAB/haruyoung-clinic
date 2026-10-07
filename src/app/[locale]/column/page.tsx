import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';
import Banner from '@/components/ui/Banner';
import { MENU_CATEGORIES, adminCategoryName } from '@/constants/categories';
import { TREATMENT_BANNER } from '@/data/site';
import { Link } from '@/i18n/navigation';
import { getPublishedColumns } from '@/lib/columns';
import { createPageMetadata } from '@/lib/seo';
import { localizedColumn } from '@/types/column';

/** 새 글이 늦어도 5분 안에 반영되도록 ISR 로 재생성한다 (카테고리 필터 시에는 요청마다 렌더) */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return createPageMetadata({
        locale,
        path: '/column',
        title: t('column'),
        description: t('columnDesc'),
        clinic: t('clinic'),
        ogAlt: t('ogAlt'),
    });
}

export default async function ColumnListPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ c?: string }>;
}) {
    const { locale } = await params;
    const { c } = await searchParams;
    const [t, tb, tn, columns] = await Promise.all([
        getTranslations({ locale, namespace: 'column' }),
        getTranslations({ locale, namespace: 'banner' }),
        getTranslations({ locale, namespace: 'nav' }),
        getPublishedColumns(),
    ]);

    // 전후사진과 같은 카테고리 필터. 모르는 값이면 전체로 취급한다
    const selected = typeof c === 'string' && MENU_CATEGORIES.some((cat) => cat.slug === c) ? c : '';

    // 한국어는 관리자 화면과 같은 카테고리명, 영·중은 banner 번역을 쓴다
    const categoryLabel = (slug: string) => (locale === 'ko' ? adminCategoryName(slug) : tb(slug));

    // 이 언어로 공개된 글만 (한국어는 발행 글 전체, 영·중은 검수 완료 번역만)
    const visible = columns
        .map((column) => ({ column, text: localizedColumn(column, locale) }))
        .filter(
            (v): v is { column: (typeof columns)[number]; text: NonNullable<ReturnType<typeof localizedColumn>> } =>
                Boolean(v.text) && (!selected || v.column.category === selected),
        );

    const headingEn = selected ? (TREATMENT_BANNER[selected]?.en ?? tn(selected)) : 'Column';
    const headingKo = selected ? categoryLabel(selected) : t('title');

    return (
        <>
            <Header dark />
            <SubNav />

            <main className="site-sub min-h-dvh bg-cream">
                <h1 className="sr-only">{t('title')}</h1>

                <div className="pb-28 lg:pb-24">
                    <Banner
                        file={selected ? (TREATMENT_BANNER[selected]?.file ?? 'bg-tre-01') : 'bg-tre-01'}
                        en={headingEn}
                        ko={headingKo === headingEn ? undefined : headingKo}
                    />

                    <div className="px-6 pt-6 lg:pl-12 lg:pr-0 lg:pt-8">
                        {visible.length === 0 ? (
                            <p className="pt-10 text-caption text-dark/50">{t('empty')}</p>
                        ) : (
                            <ul className="flex max-w-[800px] flex-col divide-y divide-beige">
                                {visible.map(({ column, text }) => (
                                    <li key={column.id}>
                                        <Link
                                            href={`/column/${column.slug}`}
                                            className="group flex items-start gap-5 py-6 lg:gap-7"
                                        >
                                            <div className="relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded-lg bg-beige/50 lg:h-[96px] lg:w-[144px]">
                                                <Image
                                                    src={column.coverImage}
                                                    alt=""
                                                    fill
                                                    unoptimized
                                                    className="object-cover transition-transform duration-500 ease-brand group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <span className="text-caption font-medium text-brown">
                                                        {categoryLabel(column.category)}
                                                    </span>
                                                    <time
                                                        dateTime={column.publishedAt}
                                                        className="text-caption text-dark/45"
                                                    >
                                                        {column.publishedAt}
                                                    </time>
                                                </div>
                                                <h2 className="mt-1.5 text-18 font-semibold text-dark underline-offset-4 group-hover:underline lg:text-20">
                                                    {text.title}
                                                </h2>
                                                {text.summary && (
                                                    <p className="mt-1.5 line-clamp-2 text-small leading-[1.7] text-dark/70">
                                                        {text.summary}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
