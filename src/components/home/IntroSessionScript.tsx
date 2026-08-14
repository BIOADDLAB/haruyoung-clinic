'use client';

import { INTRO_DISPLAY_PROPERTY, INTRO_STORAGE_KEY } from '@/lib/intro';

const INTRO_SESSION_SCRIPT = `
try {
    const root = document.documentElement;
    const seen = window.sessionStorage.getItem('${INTRO_STORAGE_KEY}') === '1';
    if (seen) root.style.setProperty('${INTRO_DISPLAY_PROPERTY}', 'none');
    else root.style.removeProperty('${INTRO_DISPLAY_PROPERTY}');
} catch {}
`;

export default function IntroSessionScript() {
    return (
        <script
            type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: INTRO_SESSION_SCRIPT }}
        />
    );
}
