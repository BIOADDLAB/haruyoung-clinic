import { defineRouting } from 'next-intl/routing';

/**
 * 지원 언어.
 * localePrefix 가 'as-needed' 라 한국어는 /about, 나머지는 /en/about 이다.
 * localeDetection 을 꺼서 첫 진입은 무조건 한국어다.
 * 이미 색인된 한국어 주소가 바뀌지 않아 SEO 에 유리하다.
 */
export const routing = defineRouting({
    locales: ['ko', 'en', 'zh'],
    defaultLocale: 'ko',
    localePrefix: 'as-needed',
    /** 브라우저 언어와 무관하게 항상 한국어로 시작한다. 방문자가 헤더에서 고르면 그때 바뀐다 */
    localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
