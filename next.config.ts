import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images : {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                pathname: '/seed/**',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/**',
            },
        ]
    }

};
export default nextConfig;
