import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output mode for optimal production builds
  output: "standalone",

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // React configuration
  reactStrictMode: false,

  // Experimental features for Next.js 16.1
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "lucide-react",
      "framer-motion",
    ],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // Webpack configuration for better performance
  webpack: (config, { isServer }) => {
    // Optimize for production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_APP_VERSION: "16.1.0",
  },
};

export default nextConfig;
