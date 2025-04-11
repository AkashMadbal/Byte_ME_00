/** @type {import('next').NextConfig} */
const nextConfig = {
  // We're using Turbopack now, so we don't need webpack configuration
  // If you need to switch back to webpack, uncomment this section
  /*
  webpack: (config, { isServer }) => {
    // Only include the mongodb module on the server side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        os: false,
        path: false,
        stream: false,
        crypto: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
        url: false,
        querystring: false,
        buffer: false,
        assert: false,
      };
    }
    return config;
  },
  */
  // Ensure MongoDB client-side encryption is only used on the server
  serverExternalPackages: ['mongodb'],

  // Configure Turbopack (stable API)
  turbopack: {},
};

module.exports = nextConfig;
