import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import SubNav from '@/components/layout/SubNav';
import JsonLd from '@/components/seo/JsonLd';
import { COLUMN_HTML_CLASS } from '@/components/column/columnHtml';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getPublishedColumnBySlug, getPublishedColumns } from '@/lib/columns';
import { createColumnSchema } from '@/lib/schema';
import { getColumnLanguageAlternates, getLocalizedUrl, OG_LOCALE } from '@/lib/seo';
import { localizedColumn, type Column } from '@/types/column';
import { adminCategoryName } from '@/constants/categories';

/** 새 글·수정이 늦어도 5분 안에 반영되도록 ISR 로 재생성한다 */
export const revalidate = 300;

type Params = Promise<{ locale: string; slug: string }>;

/**
 * hreflang 은 공개된 언어만 넣는다.
 * 미검수 언어 URL 을 알리면 검색엔진에 404 를 노출하게 된다.
 */
function columnAlternates(column: Column, locale: string): Metadata['alternates'] {
    const path = `/column/${column.slug}`;
    return { canonical: getLocalizedUrl(locale, path), languages: getColumnLanguageAlternates(column, path) };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale, slug } = await params;
    const column = await getPublishedColumnBySlug(slug);
    const text = column && localizedColumn(column, locale);
    if (!column || !text) return {};

    const t = await getTranslations({ locale, namespace: 'meta' });
    const title = text.title;
    const description = text.summary || text.title;
    const pageTitle = `${title} | ${t('clinic')}`;

    return {
        title,
        description,
        alternates: columnAlternates(column, locale),
        openGraph: {
            title: pageTitle,
            description,
            url: getLocalizedUrl(locale, `/column/${slug}`),
            siteName: t('clinic'),
            type: 'article',
            locale: OG_LOCALE[locale as Locale] ?? OG_LOCALE.ko,
            images: [{ url: column.coverImage, width: 1200, height: 630, alt: text.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description,
            images: [column.coverImage],
        },
    };
}

export default async function ColumnDetailPage({ params }: { params: Params }) {
    const { locale, slug } = await params;
    const column = await getPublishedColumnBySlug(slug);
    const text = column && localizedColumn(column, locale);
    if (!column || !text) notFound();

    const [t, tb, tm, all] = await Promise.all([
        getTranslations({ locale, namespace: 'column' }),
        getTranslations({ locale, namespace: 'banner' }),
        getTranslations({ locale, namespace: 'meta' }),
        getPublishedColumns(),
    ]);

    // 한국어는 관리자 화면과 같은 카테고리명, 영·중은 banner 번역을 쓴다
    const categoryName = locale === 'ko' ? adminCategoryName(column.category) : tb(column.category);

    // 하단 목록: 같은 카테고리에서 이 언어로 공개된 글
    const related = all
        .map((c) => ({ column: c, text: localizedColumn(c, locale) }))
        .filter((v) => v.column.category === column.category && Boolean(v.text));

    const schema = createColumnSchema({
        locale: locale as Locale,
        slug: column.slug,
        headline: text.title,
        description: text.summary || text.title,
        image: column.coverImage,
        datePublished: column.publishedAt,
        dateModified: column.updatedAt,
        clinic: tm('clinic'),
        boardName: t('title'),
    });

    return (
        <>
            <Header dark />
            <SubNav columnCategory={column.category} />
            <JsonLd data={schema} />

            <main className="site-sub min-h-dvh bg-cream">
                <article className="w-full max-w-[800px] px-6 pb-16 pt-10 lg:ml-12 lg:px-0 lg:pt-12">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-caption font-medium text-brown">{categoryName}</span>
                        <time dateTime={column.publishedAt} className="text-caption text-dark/45">
                            {column.publishedAt}
                        </time>
                    </div>

                    <h1 className="mt-3 text-24 font-bold leading-[1.4] text-dark lg:text-32">{text.title}</h1>
                    {text.summary && <p className="mt-3 text-small leading-[1.7] text-dark/70">{text.summary}</p>}

                    <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-beige/50">
                        <Image src={column.coverImage} alt={text.title} fill unoptimized priority className="object-cover" />
                    </div>

                    {/* 본문은 관리자만 작성하는 Tiptap HTML 이다 */}
                    <div className={`${COLUMN_HTML_CLASS} mt-10`} dangerouslySetInnerHTML={{ __html: text.content }} />
                </article>

                {/* 같은 카테고리 글 목록. 현재글은 링크 없이 표기만 한다 */}
                <section
                    aria-label={t('listTitle', { category: categoryName })}
                    className="w-full max-w-[800px] px-6 pb-28 lg:ml-12 lg:px-0 lg:pb-24"
                >
                    <div className="border-t border-beige pt-10">
                        <h2 className="text-18 font-semibold text-dark lg:text-20">
                            {t('listTitle', { category: categoryName })}
                        </h2>

                        <ul className="mt-5 flex flex-col divide-y divide-beige/70">
                            {related.map(({ column: c, text: ct }) => {
                                const isCurrent = c.id === column.id;
                                const row = (
                                    <>
                                        <div className="relative h-[48px] w-[72px] shrink-0 overflow-hidden rounded-md bg-beige/50">
                                            <Image src={c.coverImage} alt="" fill unoptimized className="object-cover" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`truncate text-small ${
                                                    isCurrent ? 'font-semibold text-dark' : 'text-dark/80'
                                                }`}
                                            >
                                                {ct!.title}
                                            </p>
                                            <time dateTime={c.publishedAt} className="text-caption text-dark/45">
                                                {c.publishedAt}
                                            </time>
                                        </div>
                                        {isCurrent && (
                                            <span className="shrink-0 rounded-full bg-dark px-2.5 py-0.5 text-caption-sm font-medium text-cream">
                                                {t('current')}
                                            </span>
                                        )}
                                    </>
                                );

                                return (
                                    <li key={c.id}>
                                        {isCurrent ? (
                                            <div aria-current="page" className="flex items-center gap-4 py-3.5">
                                                {row}
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/column/${c.slug}`}
                                                className="group flex items-center gap-4 py-3.5"
                                            >
                                                {row}
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="mt-8">
                            <Link
                                href="/column"
                                className="inline-block rounded-full border border-dark/30 px-5 py-2 text-small text-dark transition-colors hover:border-dark"
                            >
                                {t('backToList')}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
