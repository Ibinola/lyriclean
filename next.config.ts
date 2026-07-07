import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { webpack }) => {
    config.plugins?.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, "");
        },
      ),
    );
    if (!config.resolve) config.resolve = {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      https: false,
      express: false,
      "image-size": false,
    };
    return config;
  },
};

export default nextConfig;
