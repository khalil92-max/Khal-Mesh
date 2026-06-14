import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // مرفقات قد تكون كبيرة نسبياً عند الرفع عبر server actions
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
