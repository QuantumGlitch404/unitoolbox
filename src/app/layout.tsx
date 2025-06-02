import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'UniToolBox',
  description: 'Your Ultimate All-in-One Toolkit',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Apply dark theme by default (className="dark" on <html>) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap" rel="stylesheet" />

        {/*
          Example of where to place an ad network script (e.g., Google AdSense Auto Ads).
          Replace with your actual script from your ad provider.
          Make sure to use the next/script component for optimal loading.
          For example:
          import Script from 'next/script';
          ...
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
            crossOrigin="anonymous"
            strategy="afterInteractive" // Or "lazyOnload"
          />
        */}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
