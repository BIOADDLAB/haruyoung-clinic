import type { MetadataRoute } from 'next';
import { MENU_CATEGORIES } from '@/constants/categories';
import { routing } from '@/i18n/routing';
import { getLanguageAlternates, getLocalizedUrl } from '@/lib/seo';

const STATIC_PATHS = ['/', '/about', '/promotion', '/reservation', '/precautions', '/privacy', '/terms'];
const TREATMENT_PATHS = MENU_CATEGORIES.map(({ slug }) => `/treatments/${slug}`);

export default function sitemap(): MetadataRoute.Sitemap {
    return [...STATIC_PATHS, ...TREATMENT_PATHS].flatMap((path) =>
        routing.locales.map((locale) => ({
            url: getLocalizedUrl(locale, path),
            alternates: { languages: getLanguageAlternates(path) },
        })),
    );
}
