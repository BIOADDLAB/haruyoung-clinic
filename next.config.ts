import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        // Next 16 은 여기 등록된 값만 quality prop 으로 허용한다
        qualities: [75, 90, 95],
        formats: ['image/avif', 'image/webp'],
    },
};

export default nextConfig;
