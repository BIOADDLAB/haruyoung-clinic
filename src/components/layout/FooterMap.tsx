'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { CLINIC, MAP_LINKS } from '@/data/site';

const MAP_BOX =
    'footer-map relative aspect-[5/3] w-full max-w-[520px] self-start overflow-hidden bg-[#d9d9d9] lg:w-[320px] lg:max-w-none lg:shrink-0';

const CLIENT_ID = 'txr62pe1k4';

const APP_LINKS = [
    { href: MAP_LINKS.kakao, src: '/images/kakaomap.png', labelKey: 'mapKakao' },
    { href: MAP_LINKS.google, src: '/images/googlemap.png', labelKey: 'mapGoogle' },
] as const;

function loadNaverMaps(clientId: string) {
    if (window.naver?.maps) return Promise.resolve();

    const previous = document.querySelector<HTMLScriptElement>('script[data-naver-maps]');
    if (previous) {
        return new Promise<void>((resolve, reject) => {
            if (window.naver?.maps) resolve();
            previous.addEventListener('load', () => resolve(), { once: true });
            previous.addEventListener('error', () => reject(new Error('naver maps')), { once: true });
        });
    }

    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
        script.async = true;
        script.dataset.naverMaps = '1';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('naver maps'));
        document.head.appendChild(script);
    });
}

export default function FooterMap() {
    const t = useTranslations('footer');
    const ta = useTranslations('a11y');
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = mapRef.current;
        if (!el) return;
        let cancelled = false;
        let map: { autoResize: () => void } | null = null;
        let resize: ResizeObserver | null = null;

        loadNaverMaps(CLIENT_ID)
            .then(() => {
                if (cancelled || !mapRef.current || !window.naver?.maps) return;
                const host = mapRef.current;
                const { maps } = window.naver;
                const position = new maps.LatLng(CLINIC.lat, CLINIC.lng);
                map = new maps.Map(host, {
                    center: position,
                    zoom: 16,
                    scaleControl: false,
                    mapDataControl: false,
                    logoControl: true,
                });
                new maps.Marker({
                    position,
                    map,
                    title: CLINIC.name,
                });
                map.autoResize();
                resize = new ResizeObserver(() => map?.autoResize());
                resize.observe(host);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
            resize?.disconnect();
        };
    }, []);

    return (
        <div className={MAP_BOX} role="region" aria-label={ta('mapAlt')}>
            {/* 네이버 지도가 이 칸을 채운다. React 자식을 넣으면 타일이 지워진다 */}
            <div ref={mapRef} className="absolute inset-0 h-full w-full" />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-end p-2.5">
                <ul className="pointer-events-auto flex gap-1.5">
                    {APP_LINKS.map((app) => (
                        <li key={app.href}>
                            <a
                                href={app.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block h-9 w-9 overflow-hidden rounded-[9px] bg-white shadow-[0_2px_8px_rgba(59,43,30,0.22)] lg:h-10 lg:w-10"
                            >
                                <Image
                                    src={app.src}
                                    alt={t(app.labelKey)}
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
