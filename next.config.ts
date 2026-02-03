import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '161.97.167.73',
        port: '8001',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
