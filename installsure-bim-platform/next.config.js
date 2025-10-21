/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs': 'pdfjsLib'
    });
    return config;
  },
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig
