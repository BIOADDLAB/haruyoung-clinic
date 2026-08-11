import { defineRouting } from 'next-intl/routing';

/**
 * 지원 언어.
 * localePrefix 가 'as-needed' 라 한국어는 /about, 나머지는 /en/about 이다.
 * 이미 색인된 한국어 주소가 바뀌지 않아 SEO 에 유리하다.
 */
export const routing = defineRouting({
    locales: ['ko', 'en', 'zh'],
    defaultLocale: 'ko',
    localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
