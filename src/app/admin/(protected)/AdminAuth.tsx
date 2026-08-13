'use client';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ADMIN_FIREBASE_EMAIL } from '../firebase-auth';
import { auth } from '@/lib/firebase';

/**
 * 관리자 화면의 Firestore 접근용 Firebase 로그인.
 *
 * 관리자 인증은 쿠키(미들웨어)로 이미 끝났다.
 * 다만 Firestore 규칙이 request.auth 를 보므로 Firebase Auth 세션이 따로 필요하다.
 */
export default function AdminAuth({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            if (user?.email === ADMIN_FIREBASE_EMAIL) {
                setReady(true);
                return;
            }

            if (user) void signOut(auth);
            router.replace('/admin/login');
        });
    }, [router]);

    if (!ready) return <div className="text-sm text-neutral-500">관리자 인증 확인 중...</div>;

    return <>{children}</>;
}
