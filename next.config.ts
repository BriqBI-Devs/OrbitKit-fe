import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      ...(isDevelopment
        ? [
            {
              protocol: "http" as const,
              hostname: "localhost",
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
