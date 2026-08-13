import type { Metadata } from 'next';
import { Marcellus, Cormorant_Garamond, Asta_Sans } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '../globals.css';
import CartProvider from '@/components/cart/CartProvider';
import JsonLd from '@/components/seo/JsonLd';
import { SITE_CONFIG } from '@/data/site';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { absoluteUrl, getAlternates, getLocalizedUrl, LANGUAGE_TAG, OG_LOCALE, SITE_URL } from '@/lib/seo';
import { createClinicSchema } from '@/lib/schema';

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
    adjustFontFallback: false,
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });
    const googleVerification = SITE_CONFIG.googleSiteVerification;

    return {
        metadataBase: new URL(`${SITE_URL}/`),
        title: { default: t('title'), template: `%s | ${t('clinic')}` },
        description: t('description'),
        alternates: getAlternates(locale),
        openGraph: {
            title: t('title'),
            description: t('description'),
            url: getLocalizedUrl(locale),
            siteName: t('clinic'),
            type: 'website',
            locale: OG_LOCALE[locale as Locale] ?? OG_LOCALE.ko,
            images: [
                {
                    url: absoluteUrl('/images/og-image.jpg'),
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
            images: [absoluteUrl('/images/og-image.jpg')],
        },
        ...(googleVerification && { verification: { google: googleVerification } }),
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

    const [t, tf] = await Promise.all([
        getTranslations({ locale, namespace: 'meta' }),
        getTranslations({ locale, namespace: 'footer' }),
    ]);
    const schema = createClinicSchema({
        locale: locale as Locale,
        name: t('clinic'),
        description: t('description'),
        address: tf('address'),
    });

    return (
        <html
            lang={LANGUAGE_TAG[locale as Locale] ?? LANGUAGE_TAG.ko}
            className={`${marcellus.variable} ${cormorantGaramond.variable} ${astaSans.variable}`}
        >
            <body>
                <JsonLd data={schema} />
                <NextIntlClientProvider>
                    <CartProvider>{children}</CartProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
