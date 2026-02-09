import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone for Azure App Service (supports dynamic routes)
  output: "standalone",
  reactStrictMode: true,
  
  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
