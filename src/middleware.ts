import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
    // 관리자·API·정적 파일은 언어 라우팅에서 제외한다
    matcher: ['/((?!api|admin|_next|_vercel|images|videos|.*\\..*).*)'],
};
