import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Ép kiểu 'any' để TypeScript không bắt bẻ thuộc tính mới này
    allowedDevOrigins: ['127.0.0.1', 'localhost'],
  } as any, 
};

export default nextConfig;