import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname:
          process.env.NEXT_PUBLIC_CDN_URL?.replace('https://', '') || '',
      },
    ],
  },
};

export default nextConfig;
