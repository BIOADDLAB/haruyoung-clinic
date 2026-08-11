import type { ReactNode } from 'react';

/**
 * 루트 레이아웃.
 * html · body 는 [locale]/layout.tsx 가 언어에 맞춰 그린다.
 * 관리자(/admin)는 언어 라우팅 밖이라 여기서 바로 내려간다.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
