/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the experimental.turbo if you're not using it
  experimental: {
    // Remove 'turbo' if it's there, or keep only what you need
  },
  // Add this to fix the workspace warning
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;