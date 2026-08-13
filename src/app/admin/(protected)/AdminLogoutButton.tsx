'use client';

import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { logoutAdmin } from '../actions';

export default function AdminLogoutButton({ className }: { className?: string }) {
    const [busy, setBusy] = useState(false);

    const logout = async () => {
        setBusy(true);
        try {
            await signOut(auth);
        } finally {
            await logoutAdmin();
        }
    };

    return (
        <button type="button" onClick={logout} disabled={busy} className={className}>
            {busy ? '로그아웃 중…' : '로그아웃'}
        </button>
    );
}
