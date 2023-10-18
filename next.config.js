/** @type {import('next').NextConfig} */
module.exports = {
  output: undefined,
  webpack(config) {
    config.resolve.fallback = {
      fs: false,
    };

    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  experimental: {
    esmExternals: false,
    appDir: true,
  },
};
