/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dgram: false,
        dns: false,
        fs: false,
        net: false,
        tls: false,
        "utf-8-validate": false,
        bufferutil: false,
        "supports-color": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
