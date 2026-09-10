/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static export: no server, no database, no runtime cost.
  // Every byte of user state lives in the browser (see src/lib/store.ts).
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
  trailingSlash: true,
};

export default nextConfig;
