// next.config.mjs
/** @type {import('next').NextConfig} */

import { URL } from 'node:url';

const patterns = [
  // Local dev file server
  { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
  { protocol: 'http', hostname: '127.0.0.1', port: '5000', pathname: '/uploads/**' },
];

// Optionally add your env-based assets host (e.g. https://api.yourdomain.com)
const base = process.env.NEXT_PUBLIC_ASSETS_BASE_URL;
if (base) {
  try {
    const u = new URL(base);
    patterns.push({
      protocol: u.protocol.replace(':', ''), // 'http' | 'https'
      hostname: u.hostname,                  // api.yourdomain.com
      port: u.port || undefined,             // '' means default 80/443
      pathname: '/uploads/**',               // adjust if your files live elsewhere
    });
  } catch (e) {
    console.warn('Invalid NEXT_PUBLIC_ASSETS_BASE_URL, skipping images whitelist:', base);
  }
}

const nextConfig = {
  images: {
    remotePatterns: patterns,
    // If you ever want the simpler hostname allowlist instead:
    // domains: ['localhost', '127.0.0.1', 'api.yourdomain.com'],
  },
  reactStrictMode: true,
};

export default nextConfig;
