
import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap" rel="stylesheet" />
        
        {/* Adsterra PopUnder Script - Placed right before closing </head> tag */}
        <Script
          id="adsterra-popunder"
          strategy="afterInteractive" // Loads after page is interactive but good for head placement
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

        {/* Adsterra Social Bar Script - Placed right above closing </body> tag */}
        <Script
          id="adsterra-social-bar"
          strategy="lazyOnload" // Loads late, good for body-end scripts
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
