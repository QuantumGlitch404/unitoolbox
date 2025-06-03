
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
      // Exclude 'canvas' from server-side bundle
      config.externals.push('canvas');
    }
    
    // To handle dynamic imports of pdf.worker.min.js correctly with Webpack 5
    // This ensures that the worker file path is resolved correctly.
    // This might not be strictly necessary if using the CDN path directly in client code,
    // but can help if pdfjs-dist tries to resolve it internally.
    // However, since we are setting workerSrc directly from CDN in client components,
    // this specific part for worker may not be needed, but externals for 'canvas' is key.
    // config.plugins.push(
    //   new webpack.NormalModuleReplacementPlugin(
    //     /pdf\.worker\.min\.js/,
    //     (resource: any) => {
    //       if (resource.context.includes('node_modules/pdfjs-dist/build')) {
    //         resource.request = require.resolve('pdfjs-dist/build/pdf.worker.min.js');
    //       }
    //     }
    //   )
    // );


    return config;
  },
};

export default nextConfig;
