'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME, getAdminAuthToken, isValidAdminCredentials } from './auth';

const MAX_AGE = 60 * 60 * 8;

export const loginAdmin = async (formData: FormData) => {
    const id = String(formData.get('id') ?? '');
    const password = String(formData.get('password') ?? '');
    if (!isValidAdminCredentials(id, password)) return { ok: false as const };

    const store = await cookies();
    store.set(ADMIN_COOKIE_NAME, getAdminAuthToken(), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: MAX_AGE,
    });
    return { ok: true as const };
};

export const logoutAdmin = async () => {
    const store = await cookies();
    store.set(ADMIN_COOKIE_NAME, '', { path: '/', maxAge: 0 });
    redirect('/admin/login');
};
