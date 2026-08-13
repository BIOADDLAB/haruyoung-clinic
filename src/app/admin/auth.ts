import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'haruyoung_admin_session';

const ADMIN_ID = 'admin';
const ADMIN_PASSWORD_HASH = '0058d0235f9e3c434a044c456f80777c3607ab2199dfca7378c38672ae238606';
const ADMIN_SESSION_TOKEN = createHash('sha256')
    .update(`${ADMIN_ID}:${ADMIN_PASSWORD_HASH}:haruyoung-admin-session-v2`)
    .digest('hex');

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

const safelyEqual = (left: string, right: string) => {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export const isValidAdminCredentials = (id: string, password: string) =>
    safelyEqual(id, ADMIN_ID) && safelyEqual(hash(password), ADMIN_PASSWORD_HASH);

export const getAdminAuthToken = () => ADMIN_SESSION_TOKEN;

export const isValidAdminAuthToken = (token?: string) => Boolean(token && safelyEqual(token, ADMIN_SESSION_TOKEN));
