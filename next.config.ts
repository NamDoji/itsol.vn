import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  // Allow large CV file uploads (base64 encoded)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
