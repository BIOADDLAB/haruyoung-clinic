import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/data/site';
import { routing, type Locale } from '@/i18n/routing';

export const SITE_URL = SITE_CONFIG.url.replace(/\/$/, '');

export const LANGUAGE_TAG: Record<Locale, string> = {
    ko: 'ko',
    en: 'en',
    zh: 'zh-CN',
};

export const OG_LOCALE: Record<Locale, string> = {
    ko: 'ko_KR',
    en: 'en_US',
    zh: 'zh_CN',
};

function normalizePath(path: string) {
    if (!path || path === '/') return '/';
    return `/${path.replace(/^\/+|\/+$/g, '')}`;
}

export function getLocalizedPath(locale: string, path = '/') {
    const normalizedPath = normalizePath(path);
    if (locale === routing.defaultLocale) return normalizedPath;
    return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function absoluteUrl(path = '/') {
    return new URL(normalizePath(path), `${SITE_URL}/`).toString();
}

export function getLocalizedUrl(locale: string, path = '/') {
    return absoluteUrl(getLocalizedPath(locale, path));
}

export function getLanguageAlternates(path = '/') {
    return {
        ko: getLocalizedUrl('ko', path),
        en: getLocalizedUrl('en', path),
        'zh-CN': getLocalizedUrl('zh', path),
        'x-default': getLocalizedUrl(routing.defaultLocale, path),
    };
}

export function getAlternates(locale: string, path = '/'): Metadata['alternates'] {
    return {
        canonical: getLocalizedUrl(locale, path),
        languages: getLanguageAlternates(path),
    };
}

type PageMetadataOptions = {
    locale: string;
    path: string;
    title: string;
    description: string;
    clinic: string;
    ogAlt: string;
    index?: boolean;
};

export function createPageMetadata({
    locale,
    path,
    title,
    description,
    clinic,
    ogAlt,
    index = true,
}: PageMetadataOptions): Metadata {
    const pageTitle = `${title} | ${clinic}`;

    return {
        title,
        description,
        alternates: getAlternates(locale, path),
        openGraph: {
            title: pageTitle,
            description,
            url: getLocalizedUrl(locale, path),
            siteName: clinic,
            type: 'website',
            locale: OG_LOCALE[locale as Locale] ?? OG_LOCALE.ko,
            images: [
                {
                    url: absoluteUrl('/images/og-image.jpg'),
                    width: 1200,
                    height: 630,
                    alt: ogAlt,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description,
            images: [absoluteUrl('/images/og-image.jpg')],
        },
        ...(!index && { robots: { index: false, follow: true } }),
    };
}
