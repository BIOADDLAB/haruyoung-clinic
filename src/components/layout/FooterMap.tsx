'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { CLINIC, MAP_LINKS } from '@/data/site';

const MAP_BOX =
    'footer-map relative aspect-[5/3] w-full max-w-[520px] self-start overflow-hidden bg-[#d9d9d9] lg:w-[320px] lg:max-w-none lg:shrink-0';

const CLIENT_ID = 'txr62pe1k4';

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
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        let cancelled = false;
        let map: { autoResize: () => void } | null = null;
        let resize: ResizeObserver | null = null;

        loadNaverMaps(CLIENT_ID)
            .then(() => {
                if (cancelled || !boxRef.current || !window.naver?.maps) return;
                const { maps } = window.naver;
                const position = new maps.LatLng(CLINIC.lat, CLINIC.lng);
                map = new maps.Map(boxRef.current, {
                    center: position,
                    zoom: 16,
                    scaleControl: false,
                    mapDataControl: false,
                    logoControl: true,
                });
                const marker = new maps.Marker({
                    position,
                    map,
                    title: CLINIC.name,
                });
                const openNaver = () => window.open(MAP_LINKS.naver, '_blank', 'noopener,noreferrer');
                maps.Event.addListener(marker, 'click', openNaver);
                maps.Event.addListener(map, 'click', openNaver);
                map.autoResize();
                resize = new ResizeObserver(() => map?.autoResize());
                resize.observe(boxRef.current);
            })
            .catch(() => {
                /* 스크립트 실패 시 아래 링크 폴백이 보인다 */
            });

        return () => {
            cancelled = true;
            resize?.disconnect();
            el.replaceChildren();
        };
    }, []);

    return (
        <div ref={boxRef} role="region" aria-label={ta('mapAlt')} className={MAP_BOX}>
            <a
                href={MAP_LINKS.naver}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-0 flex items-center justify-center text-caption font-semibold text-dark/70"
            >
                {t('mapNaver')}
            </a>
        </div>
    );
}
