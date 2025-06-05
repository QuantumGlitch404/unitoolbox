
import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://unitoolbox.vercel.app'),
  title: {
    default: 'UniToolBox - Your Ultimate All-in-One Toolkit',
    template: '%s | UniToolBox',
  },
  description: 'UniToolBox offers a comprehensive suite of free online tools for images, documents, text processing, media conversion, AI assistance, and utilities. Boost your productivity today!',
  keywords: ['online tools', 'free tools', 'image editor', 'document converter', 'pdf tools', 'text utilities', 'ai tools', 'media converter', 'unit converter', 'password generator', 'developer tools', 'productivity'],
  openGraph: {
    title: 'UniToolBox - Your Ultimate All-in-One Toolkit',
    description: 'Discover a wide range of free online tools to simplify your digital tasks.',
    url: 'https://unitoolbox.vercel.app',
    siteName: 'UniToolBox',
    images: [
      {
        url: 'https://placehold.co/1200x630.png?text=UniToolBox', // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: 'UniToolBox - All-in-One Toolkit',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UniToolBox - Your Ultimate All-in-One Toolkit',
    description: 'The best free online tools for all your digital needs. Image editing, document conversion, AI, and more.',
    // images: ['https://placehold.co/1200x630.png?text=UniToolBox'], // Replace with your actual Twitter image URL
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico', // Ensure you have a favicon.ico in your public folder
    // apple: '/apple-touch-icon.png', // Example for Apple touch icon
  },
  manifest: '/site.webmanifest', // Example: ensure you have a web app manifest
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Adsterra Verification */}
        <meta name="ppck-ver" content="e1ff2af4cc3c6d70735eaa632607be02" />
        
        {/* AdSense Verification Meta Tag & Site-Level Script for Auto Ads */}
        <meta name="google-adsense-account" content="ca-pub-7031136340185694" />
        {/* Use a standard HTML script tag for the main AdSense script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7031136340185694"
          crossOrigin="anonymous"
        ></script>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap" rel="stylesheet" />
        
        {/* Adsterra PopUnder Script - Placed before closing </head> */}
        <Script
          id="adsterra-popunder-script" 
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '//pl26831125.profitableratecpm.com/64/c9/b2/64c9b266abb4946d4e09e1ed39cf8760.js';
                document.head.appendChild(script);
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <AppLayout>{children}</AppLayout>
        <Toaster />

        {/* Adsterra Social Bar Script - Placed before closing </body> */}
        <Script
          id="adsterra-social-bar-script" 
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '//pl26831079.profitableratecpm.com/87/e1/8a/87e18add19e515ff8b82df0f5e14081f.js';
                document.body.appendChild(script);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
