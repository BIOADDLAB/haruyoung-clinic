import type { MetadataRoute } from 'next';
import { MENU_CATEGORIES } from '@/constants/categories';
import { routing } from '@/i18n/routing';
import { getPublishedColumns } from '@/lib/columns';
import { getColumnLanguageAlternates, getLanguageAlternates, getLocalizedUrl } from '@/lib/seo';
import { columnLocales } from '@/types/column';

const STATIC_PATHS = ['/', '/about', '/equipment', '/before-after', '/promotion', '/reservation', '/precautions', '/privacy', '/terms'];
const TREATMENT_PATHS = MENU_CATEGORIES.map(({ slug }) => `/treatments/${slug}`);

/** 정적 페이지는 실제 수정일을 추적하지 않아 이 사이트맵이 생성된 시각(=최근 배포 시각)으로 대신한다 */
const BUILD_TIME = new Date();

/** 새 칼럼 발행이 반영되도록 5분마다 재생성한다 (기본은 빌드 시 한 번만 생성되는 정적 라우트다) */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const columns = await getPublishedColumns();

    const staticEntries = [...STATIC_PATHS, ...TREATMENT_PATHS].flatMap((path) =>
        routing.locales.map((locale) => ({
            url: getLocalizedUrl(locale, path),
            lastModified: BUILD_TIME,
            alternates: { languages: getLanguageAlternates(path) },
        })),
    );

    // 칼럼 목록 페이지. 가장 최근에 발행·수정된 글의 날짜를 목록 자체의 수정일로 쓴다
    const latestColumnUpdate = columns.reduce<Date | null>((latest, c) => {
        const updated = new Date(c.updatedAt);
        return !latest || updated > latest ? updated : latest;
    }, null);

    const columnListEntries = routing.locales.map((locale) => ({
        url: getLocalizedUrl(locale, '/column'),
        lastModified: latestColumnUpdate ?? BUILD_TIME,
        alternates: { languages: getLanguageAlternates('/column') },
    }));

    // 칼럼 상세. 검수 완료되어 실제 공개된 언어의 URL만 넣는다 (columnLocales)
    const columnEntries = columns.flatMap((column) => {
        const path = `/column/${column.slug}`;
        const lastModified = new Date(column.updatedAt);
        const alternates = { languages: getColumnLanguageAlternates(column, path) };

        return columnLocales(column).map((locale) => ({
            url: getLocalizedUrl(locale, path),
            lastModified,
            alternates,
        }));
    });

    return [...staticEntries, ...columnListEntries, ...columnEntries];
}
