import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'api.rejimde.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/clans',
        destination: '/circles',
        permanent: true,
      },
      {
        source: '/clans/:slug',
        destination: '/circles/:slug',
        permanent: true,
      },
      {
        source: '/clans/create',
        destination: '/circles/create',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;