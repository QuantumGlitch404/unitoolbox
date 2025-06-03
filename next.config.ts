
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // This is to prevent 'canvas' module errors during Vercel build
    // pdfjs-dist might try to conditionally require it for server-side rendering,
    // but we only use it client-side where the browser's Canvas API is available.
    if (isServer) {
      // Exclude 'canvas' from server-side bundle more forcefully
      // by aliasing it to false. This tells Webpack it's an empty module.
      if (!config.resolve) {
        config.resolve = {};
      }
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }
      config.resolve.alias.canvas = false;

      // As an alternative or additional measure, externals can also be used:
      // config.externals = [...(config.externals || []), 'canvas'];
      
      // The NormalModuleReplacementPlugin is another option but aliasing to false is often simpler for full stubbing.
      // config.plugins.push(
      //   new webpack.NormalModuleReplacementPlugin(
      //     /canvas/,
      //     (resource: any) => {
      //       resource.request = false; 
      //     }
      //   )
      // );
    }
    
    return config;
  },
};

export default nextConfig;
