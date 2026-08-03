import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyCkn1jYr3-SaLypMjmJjp7WYg9Xlr70rGQ',
    authDomain: 'haruyoungclinic.firebaseapp.com',
    projectId: 'haruyoungclinic',
    storageBucket: 'haruyoungclinic.firebasestorage.app',
    messagingSenderId: '463252084085',
    appId: '1:463252084085:web:c0f43e3ecd63a58fc82f3c',
    measurementId: 'G-CCFG7XW1C8',
};

// 이미 초기화됐으면 재사용 (Next.js 핫리로드/SSR 중복 초기화 에러 방지)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app); // 관리자 로그인
export const db = getFirestore(app); // 수가표·예약 데이터
export const storage = getStorage(app); // 시술 이미지

// Analytics는 브라우저에서만 (서버에서 호출하면 에러)
export const initAnalytics = async () => {
    if (typeof window === 'undefined') return null;
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    return (await isSupported()) ? getAnalytics(app) : null;
};
