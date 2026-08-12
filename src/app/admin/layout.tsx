import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../globals.css';

/**
 * 관리자 레이아웃.
 * /admin 은 언어 라우팅 밖이라 [locale]/layout.tsx 가 감싸지 않는다.
 * html · body 를 여기서 직접 그려야 한다.
 *
 * 관리자는 한국어 전용이므로 lang 을 ko 로 고정한다.
 */
export const metadata: Metadata = {
    title: '하루영의원 관리자',
    robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko">
            <body>{children}</body>
        </html>
    );
}
