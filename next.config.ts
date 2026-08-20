import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        qualities: [75, 90, 92, 95],
        formats: ['image/avif', 'image/webp'],
    },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
