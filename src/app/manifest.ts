import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: '하루영의원',
        short_name: '하루영',
        description: '하루영의원 — 피부에 가장 편안한 휴식',
        start_url: '/',
        scope: '/',
        id: '/',
        display: 'standalone',
        background_color: '#fffbf6',
        theme_color: '#fffbf6',
        lang: 'ko',
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    };
}
