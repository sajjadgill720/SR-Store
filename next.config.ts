import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  headers() {
    return ['/orders/:path*', '/checkout/:path*', '/account/:path*', '/auth/:path*', '/admin/:path*', '/api/auth/:path*', '/api/orders/:path*', '/api/downloads/:path*'].map(source => ({
      source,
      headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
