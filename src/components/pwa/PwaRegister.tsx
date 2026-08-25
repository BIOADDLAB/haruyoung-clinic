'use client';

import { useEffect } from 'react';

/** 홈 화면 추가(PWA)용 서비스 워커. 관리자 페이지에는 올리지 않는다 */
export default function PwaRegister() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }, []);

    return null;
}
