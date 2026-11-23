import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Playwright / local agents hitting 127.0.0.1 during development.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
