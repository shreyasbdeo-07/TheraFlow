/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure environment variables are available server-side only
  // Never expose LLM_API_KEY or FIREBASE secrets to the browser
  serverRuntimeConfig: {
    LLM_API_KEY: process.env.LLM_API_KEY,
  },
  publicRuntimeConfig: {
    // Only put truly public config here
  },
};

module.exports = nextConfig;
