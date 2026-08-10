'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getMember } from '@/lib/members';
import type { Member } from '@/types/member';

/**
 * 로그인 상태와 회원 프로필을 함께 준다.
 * Firebase Auth 는 관리자 로그인과 같은 인스턴스를 쓰므로,
 * members 문서가 없으면 회원이 아니라고 본다 (관리자 계정 제외).
 */
export function useAuthMember() {
    const [member, setMember] = useState<Member | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let alive = true;

        const unsub = onAuthStateChanged(auth, (user: User | null) => {
            if (!user) {
                if (alive) {
                    setMember(null);
                    setReady(true);
                }
                return;
            }
            getMember(user)
                .then((m) => {
                    if (alive) {
                        setMember(m);
                        setReady(true);
                    }
                })
                .catch(() => {
                    if (alive) {
                        setMember(null);
                        setReady(true);
                    }
                });
        });

        return () => {
            alive = false;
            unsub();
        };
    }, []);

    return { member, ready };
}
