import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "magenta-gigantic-sole-994.mypinata.cloud",
      },
    ],
  },
};

export default nextConfig;
