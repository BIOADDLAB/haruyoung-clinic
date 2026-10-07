import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * 운영 Firebase 설정.
 * .env.local 에 NEXT_PUBLIC_FIREBASE_* 가 있으면 그 값(테스트 프로젝트)을 우선 사용한다.
 * 운영 배포(Vercel)에는 해당 env 가 없으므로 항상 아래 운영 값으로 동작한다.
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyCkn1jYr3-SaLypMjmJjp7WYg9Xlr70rGQ',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'haruyoungclinic.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'haruyoungclinic',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'haruyoungclinic.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '463252084085',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:463252084085:web:c0f43e3ecd63a58fc82f3c',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-CCFG7XW1C8',
};

// 이미 초기화됐으면 재사용 (Next.js 핫리로드/SSR 중복 초기화 에러 방지)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * App Check — AI Logic(Gemini) 요청에 Fraud Defense(reCAPTCHA Enterprise) 토큰을 붙여
 * 발급받지 않은 클라이언트의 호출을 막는다. reCAPTCHA 클래식(v3)은 구글이 지원 중단해서
 * 후속 기술인 Fraud Defense 를 쓴다. 다른 Firebase 서비스(Firestore 등)보다 먼저,
 * 모듈이 로드되는 시점에 바로 초기화해야 한다. 브라우저에서만 동작하며, 서버 렌더링 중에는
 * 건너뛴다.
 *
 * 로컬 개발은 디버그 토큰을 쓴다. 처음 실행하면 브라우저 콘솔에 토큰이 한 번 출력되는데,
 * Firebase 콘솔 > App Check > 앱 > 디버그 토큰 관리에 그 값을 등록해야 요청이 통과한다.
 *
 * NEXT_PUBLIC_RECAPTCHA_SITE_KEY 가 없으면(설정 전) App Check 없이 동작한다 — 이 경우
 * App Check 가 "적용됨"으로 설정된 API 는 전부 요청이 거부되니 배포 전 반드시 값을 넣는다.
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export const appCheck =
    typeof window !== 'undefined' && RECAPTCHA_SITE_KEY
        ? initializeAppCheck(app, {
              provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
              isTokenAutoRefreshEnabled: true,
          })
        : null;

if (typeof window !== 'undefined' && !RECAPTCHA_SITE_KEY) {
    console.warn(
        '[firebase] NEXT_PUBLIC_RECAPTCHA_SITE_KEY 가 없어 App Check 를 초기화하지 않았습니다. ' +
            'App Check 가 "적용됨"으로 설정된 API(AI Logic 등)는 요청이 거부됩니다.',
    );
}

export const auth = getAuth(app); // 관리자 로그인
export const db = getFirestore(app); // 수가표·예약 데이터
export const storage = getStorage(app); // 시술 이미지

// Analytics는 브라우저에서만 (서버에서 호출하면 에러)
export const initAnalytics = async () => {
    if (typeof window === 'undefined') return null;
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    return (await isSupported()) ? getAnalytics(app) : null;
};
