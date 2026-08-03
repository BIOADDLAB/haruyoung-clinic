import type { Metadata } from 'next';
import { Marcellus, Cormorant_Garamond, Asta_Sans } from 'next/font/google';
import './globals.css';

const marcellus = Marcellus({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-marcellus',
});

// 임시 애플 가라몬드 대체, 사용처 적음
const cormorantGaramond = Cormorant_Garamond({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-cormorant-garamond',
});

const astaSans = Asta_Sans({
    subsets: ['latin'],
    variable: '--font-asta-sans',
});

// #TODO: 도메인 확정되면 실제 주소로 교체
const SITE_URL = 'https://haruyoung.vercel.app/';
const TITLE = '하루영의원 | 하루의 쉼표가 만드는 영원한 시간';
const DESCRIPTION =
    '하루영의원은 바쁜 일상 속 잠시 멈춰 선 시간처럼, 피부에 가장 편안한 휴식을 선사합니다. 오직 당신만을 위해 설계된 맞춤 케어로 자연스러운 아름다움이 오래도록 이어지도록 설계합니다.';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: TITLE, template: '%s | 하루영의원' },
    description: DESCRIPTION,
    alternates: { canonical: '/' },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: SITE_URL,
        siteName: '하루영의원',
        type: 'website',
        locale: 'ko_KR',
        images: [
            {
                url: '/images/og-image.jpg',
                width: 1200,
                height: 630,
                alt: '하루영의원 - 오직 당신만을 위해 설계된 특별한 피부 휴식',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/images/og-image.jpg'],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" className={`${marcellus.variable} ${cormorantGaramond.variable} ${astaSans.variable}`}>
            <body>{children}</body>
        </html>
    );
}
