/** @type {import('next').NextConfig} */
module.exports = {
  output: undefined,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    esmExternals: false,
    appDir: true,
  },
};
