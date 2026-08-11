import type { Metadata } from 'next';
import { Marcellus, Cormorant_Garamond, Asta_Sans } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '../globals.css';
import CartProvider from '@/components/cart/CartProvider';
import { routing } from '@/i18n/routing';

const marcellus = Marcellus({
    weight: ['400'],
    subsets: ['latin'],
    variable: '--font-marcellus',
});

// 임시 애플 가라몬드 대체, 사용처 적음
const cormorantGaramond = Cormorant_Garamond({
    weight: ['400', '600', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    variable: '--font-cormorant-garamond',
});

const astaSans = Asta_Sans({
    subsets: ['latin'],
    variable: '--font-asta-sans',
});

// #TODO: 도메인 확정되면 실제 주소로 교체
const SITE_URL = 'https://haruyoung-clinic.vercel.app/';

/** html lang 속성. 검색엔진과 스크린리더가 읽는다 */
const HTML_LANG: Record<string, string> = { ko: 'ko', en: 'en', zh: 'zh-CN' };
const OG_LOCALE: Record<string, string> = { ko: 'ko_KR', en: 'en_US', zh: 'zh_CN' };

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });

    return {
        metadataBase: new URL(SITE_URL),
        title: { default: t('title'), template: `%s | ${t('clinic')}` },
        description: t('description'),
        alternates: {
            canonical: locale === routing.defaultLocale ? '/' : `/${locale}`,
            // 언어별 대체 주소. 없으면 영문·중문이 검색에 안 잡힌다
            languages: { ko: '/', en: '/en', 'zh-CN': '/zh' },
        },
        openGraph: {
            title: t('title'),
            description: t('description'),
            url: SITE_URL,
            siteName: t('clinic'),
            type: 'website',
            locale: OG_LOCALE[locale] ?? 'ko_KR',
            images: [
                {
                    url: '/images/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: t('ogAlt'),
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description'),
            images: ['/images/og-image.jpg'],
        },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();

    // 정적 렌더링을 쓰려면 요청 언어를 먼저 알려줘야 한다
    setRequestLocale(locale);

    return (
        <html
            lang={HTML_LANG[locale] ?? 'ko'}
            className={`${marcellus.variable} ${cormorantGaramond.variable} ${astaSans.variable}`}
        >
            <body>
                <NextIntlClientProvider>
                    <CartProvider>{children}</CartProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
