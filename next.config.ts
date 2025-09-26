import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API 라우트를 사용하기 위해 static export 비활성화
  // output: 'export', // 주석 처리
  // distDir: 'out', // 주석 처리
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // assetPrefix: process.env.NODE_ENV === 'production' ? './' : '', // 주석 처리
};

export default nextConfig;
