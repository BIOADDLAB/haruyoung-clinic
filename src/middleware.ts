import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, getAdminAuthToken } from './app/admin/auth';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (pathname === '/admin/login') return NextResponse.next();
    if (pathname.startsWith('/admin')) {
        const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
        if (token !== getAdminAuthToken()) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
