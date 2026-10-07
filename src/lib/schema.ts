import { CLINIC } from '@/data/site';
import type { Locale } from '@/i18n/routing';
import { absoluteUrl, getLocalizedUrl, LANGUAGE_TAG, SITE_URL } from '@/lib/seo';

type ClinicSchemaOptions = {
    locale: Locale;
    name: string;
    description: string;
    address: string;
};

export function createClinicSchema({ locale, name, description, address }: ClinicSchemaOptions) {
    const telephone = /^\d{2,3}-\d{3,4}-\d{4}$/.test(CLINIC.tel) ? CLINIC.tel : undefined;
    const openingHours = CLINIC.hours.flatMap(({ time, schemaDays }) => {
        if (schemaDays.length === 0) return [];
        const [opens, closes] = time.split(' - ');

        return [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: schemaDays.map((day) => `https://schema.org/${day}`),
                opens,
                closes,
            },
        ];
    });

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'MedicalClinic',
                '@id': `${SITE_URL}/#clinic`,
                name,
                description,
                url: getLocalizedUrl(locale),
                image: absoluteUrl('/images/og-image.jpg'),
                logo: absoluteUrl('/images/logo.svg'),
                ...(telephone && { telephone }),
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: address,
                    addressCountry: 'KR',
                },
                openingHoursSpecification: openingHours,
            },
            {
                '@type': 'WebSite',
                '@id': `${getLocalizedUrl(locale)}#website`,
                url: getLocalizedUrl(locale),
                name,
                description,
                inLanguage: LANGUAGE_TAG[locale],
                publisher: { '@id': `${SITE_URL}/#clinic` },
            },
        ],
    };
}

type ColumnSchemaOptions = {
    locale: Locale;
    slug: string;
    headline: string;
    description: string;
    /** 대표 이미지 절대 URL */
    image: string;
    /** 'YYYY-MM-DD' */
    datePublished: string;
    /** ISO */
    dateModified: string;
    clinic: string;
    /** 칼럼 목록 페이지 표기명 */
    boardName: string;
};

/** 칼럼 상세의 Article + 빵부스러기. 의료 콘텐츠라 publisher 를 의원 스키마에 연결한다 */
export function createColumnSchema({
    locale,
    slug,
    headline,
    description,
    image,
    datePublished,
    dateModified,
    clinic,
    boardName,
}: ColumnSchemaOptions) {
    const url = getLocalizedUrl(locale, `/column/${slug}`);
    const breadcrumbId = `${url}#breadcrumb`;

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                '@id': breadcrumbId,
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: clinic, item: getLocalizedUrl(locale) },
                    { '@type': 'ListItem', position: 2, name: boardName, item: getLocalizedUrl(locale, '/column') },
                    { '@type': 'ListItem', position: 3, name: headline, item: url },
                ],
            },
            {
                '@type': 'Article',
                '@id': `${url}#article`,
                mainEntityOfPage: url,
                headline,
                description,
                image,
                datePublished,
                dateModified,
                inLanguage: LANGUAGE_TAG[locale],
                author: { '@id': `${SITE_URL}/#clinic` },
                publisher: { '@id': `${SITE_URL}/#clinic` },
                breadcrumb: { '@id': breadcrumbId },
            },
        ],
    };
}

type TreatmentSchemaOptions = {
    locale: Locale;
    slug: string;
    name: string;
    description: string;
    clinic: string;
};

export function createTreatmentSchema({ locale, slug, name, description, clinic }: TreatmentSchemaOptions) {
    const path = `/treatments/${slug}`;
    const url = getLocalizedUrl(locale, path);
    const breadcrumbId = `${url}#breadcrumb`;

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                '@id': breadcrumbId,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: clinic,
                        item: getLocalizedUrl(locale),
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name,
                        item: url,
                    },
                ],
            },
            {
                '@type': 'MedicalWebPage',
                '@id': `${url}#webpage`,
                url,
                name,
                description,
                inLanguage: LANGUAGE_TAG[locale],
                about: { '@id': `${SITE_URL}/#clinic` },
                breadcrumb: { '@id': breadcrumbId },
            },
        ],
    };
}
