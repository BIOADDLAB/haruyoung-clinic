import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * next/link · next/navigation 대신 이걸 쓴다.
 * 현재 언어가 URL 에 자동으로 붙는다.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
