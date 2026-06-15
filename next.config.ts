import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // رفع المرفقات/المجلّدات يمرّ عبر server actions.
    // ملاحظة: على Vercel يبقى حدّ جسم الطلب ~4.5MB لكل عملية رفع مهما رفعنا هذا.
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
