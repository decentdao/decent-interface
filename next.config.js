/** @type {import('next').NextConfig} */
module.exports = {
  target: "serverless",
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    esmExternals: false,
    appDir: true
  }
}