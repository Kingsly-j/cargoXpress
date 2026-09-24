import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/site/index.html" },
        { source: "/:page(about|services|contact|international-transport|track-transport|personal-delivery|ocean-transport|warehouse-facility|emergency-transport|projects|project-details|testimonials|team-details|faq|blog)", destination: "/site/:page.html" },
      ],
    };
  },
};

export default nextConfig;
