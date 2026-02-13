/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Enable SWC minification
  swcMinify: true,

  // Experimental optimizations for faster dev & build
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      '@supabase/ssr',
    ],
  },

  // Faster builds
  typescript: {
    // Type checking in a separate process
    tsconfigPath: './tsconfig.json',
  },
};

export default nextConfig;
