'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ADMIN_FIREBASE_EMAIL, ADMIN_FIREBASE_PW } from '../auth';
import { auth } from '@/lib/firebase';

/**
 * 관리자 화면의 Firestore 접근용 Firebase 로그인.
 *
 * 관리자 인증은 쿠키(미들웨어)로 이미 끝났다.
 * 다만 Firestore 규칙이 request.auth 를 보므로 Firebase Auth 세션이 따로 필요하다.
 */
export default function AdminAuth({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;

        // 이미 로그인돼 있으면 건너뛴다. 두 경우 모두 비동기로 흘려야
        // effect 안에서 동기 setState 가 일어나지 않는다
        const run = auth.currentUser
            ? Promise.resolve()
            : signInWithEmailAndPassword(auth, ADMIN_FIREBASE_EMAIL, ADMIN_FIREBASE_PW).then(() => undefined);

        run.then(() => alive && setReady(true)).catch(
            () => alive && setError('Firebase 인증에 실패했습니다. 콘솔에서 관리자 계정을 확인해주세요.'),
        );

        return () => {
            alive = false;
        };
    }, []);

    if (error) return <div className="text-sm text-red-500">{error}</div>;
    if (!ready) return <div className="text-sm text-neutral-500">불러오는 중...</div>;

    return <>{children}</>;
}
