/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirects for URL changes
  async redirects() {
    return [
      {
        source: '/agency/:slug',
        destination: '/find-agency/:slug',
        permanent: true,
      },
    ];
  },
  
  // Image optimization configuration
  images: {
    // Allow external image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Allow any localhost for development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    // Enable image optimization
    unoptimized: false,
    // Only use supported image formats
    formats: ['image/webp', 'image/avif'],
  },
  
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add path resolution for @ alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
