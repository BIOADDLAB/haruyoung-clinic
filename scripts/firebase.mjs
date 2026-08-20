/**
 * 스크립트 공용 Firebase 연결.
 *
 * Firestore 규칙이 request.auth 를 보므로, 쓰기 스크립트는 signInAdmin() 을 먼저 부른다.
 * 관리자 로그인 계정은 사이트 관리자페이지에서 쓰는 것과 같다.
 *
 *   ADMIN_FIREBASE_PASSWORD='관리자비밀번호' npm run seed
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const ADMIN_EMAIL = 'admin@haruyoung.local';

export const app = initializeApp({
    apiKey: 'AIzaSyCkn1jYr3-SaLypMjmJjp7WYg9Xlr70rGQ',
    authDomain: 'haruyoungclinic.firebaseapp.com',
    projectId: 'haruyoungclinic',
    storageBucket: 'haruyoungclinic.firebasestorage.app',
    messagingSenderId: '463252084085',
    appId: '1:463252084085:web:c0f43e3ecd63a58fc82f3c',
});

export const db = getFirestore(app);

export async function signInAdmin() {
    const password = process.env.ADMIN_FIREBASE_PASSWORD;
    if (!password) {
        console.error(
            '환경변수 ADMIN_FIREBASE_PASSWORD 가 없습니다.\n' +
                "  ADMIN_FIREBASE_PASSWORD='관리자비밀번호' npm run seed",
        );
        process.exit(1);
    }

    try {
        await signInWithEmailAndPassword(getAuth(app), ADMIN_EMAIL, password);
    } catch {
        console.error(`Firebase 로그인 실패. ${ADMIN_EMAIL} 비밀번호를 확인해주세요.`);
        process.exit(1);
    }
}
