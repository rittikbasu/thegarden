/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: false,
  },
  images: {
    domains: ["ik.imagekit.io"],
  },
};

module.exports = nextConfig;
