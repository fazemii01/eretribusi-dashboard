import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendHost = process.env.BACKEND_API_URL || 'http://127.0.0.1:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendHost}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

