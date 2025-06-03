
"use client";

import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Script from 'next/script';

const adTypeDimensions: Record<string, { width: string; height: string }> = {
  banner: { width: '100%', height: '90px' },
  leaderboard: { width: '100%', height: '90px' }, // Often 728x90 on desktop
  mediumRectangle: { width: '300px', height: '250px' },
  largeRectangle: { width: '336px', height: '280px' },
  square: { width: '250px', height: '250px' },
  skyscraper: { width: '160px', height: '600px' },
  smallSquare: { width: '200px', height: '200px' },
};

interface AdPlaceholderProps {
  width?: string | number;
  height?: string | number;
  label?: string;
  className?: string;
  type?: keyof typeof adTypeDimensions | 'native'; // Added 'native' type
}

export function AdPlaceholder({
  width: customWidth,
  height: customHeight,
  label = "Advertisement",
  className,
  type = 'banner', // Default to banner if no type is provided
}: AdPlaceholderProps) {
  const dimensions = adTypeDimensions[type] || adTypeDimensions.banner;
  const styleWidth = customWidth ?? dimensions.width;
  const styleHeight = customHeight ?? dimensions.height;

  const nativeAdContainerId = "container-908fcf666666a1f8ab3d42398e87b77e";
  const nativeAdScriptSrc = "//pl26831149.profitableratecpm.com/908fcf666666a1f8ab3d42398e87b77e/invoke.js";
  const banner728x90Key = '7b914269a04118556b63666b58b8fc11';
  const banner728x90InvokeSrc = `//www.highperformanceformat.com/${banner728x90Key}/invoke.js`;

  // Ref for the container div of the 728x90 banner, if needed by its script
  const banner728x90ContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For Banner 728x90, the atOptions script needs to be executed.
    // The invoke.js script will then use these options.
    // We create and append the atOptions script dynamically if the container is present.
    if ((type === 'leaderboard' || type === 'banner') && banner728x90ContainerRef.current) {
        const atOptionsScript = document.createElement('script');
        atOptionsScript.type = 'text/javascript';
        atOptionsScript.innerHTML = `
            atOptions = {
                'key' : '${banner728x90Key}',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
            };
        `;
        // Prepend atOptions script so it's defined before invoke.js runs
        banner728x90ContainerRef.current.prepend(atOptionsScript);
    }

    // For Native Banner, the invoke.js script targets a div with a specific ID.
    // We ensure that script is loaded. The div is rendered in the JSX.
    // No special useEffect logic needed for the native banner script if using next/script
    // as long as the div#id exists when it runs.
    // If this placeholder is used multiple times for native ads on the same page,
    // the fixed ID 'container-908fcf666666a1f8ab3d42398e87b77e' will cause issues.
    // Only the first instance of this ID on the page will likely work correctly.
    if (type === 'mediumRectangle' || type === 'smallSquare' || type === 'native') {
        // console.warn("AdPlaceholder: Native Banner (4:1) uses a fixed container ID. Only one instance per page will function correctly.");
    }

  }, [type, banner728x90Key]);

  const renderAdContent = () => {
    switch (type) {
      case 'leaderboard':
      case 'banner':
        return (
          <div ref={banner728x90ContainerRef} className="adsterra-banner-728x90-container">
            {/* atOptions script is prepended in useEffect */}
            <Script strategy="lazyOnload" src={banner728x90InvokeSrc} />
          </div>
        );
      case 'mediumRectangle':
      case 'smallSquare':
      case 'native': // Added a generic 'native' type
        return (
          <>
            <Script async={true} data-cfasync="false" strategy="lazyOnload" src={nativeAdScriptSrc} />
            <div id={nativeAdContainerId}></div>
          </>
        );
      default:
        // Fallback to visual placeholder box if type doesn't match an ad code
        return (
          <CardContent className="p-2 text-center flex flex-col items-center justify-center h-full">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {typeof styleWidth === 'string' && styleWidth.includes('px') && typeof styleHeight === 'string' && styleHeight.includes('px') && (
              <p className="text-xs text-muted-foreground/70">{`${styleWidth} x ${styleHeight}`}</p>
            )}
            {type && (
              <p className="text-xs text-muted-foreground/50 mt-0.5">({type} placeholder)</p>
            )}
          </CardContent>
        );
    }
  };

  return (
    <div
      className={cn(
        `flex items-center justify-center bg-muted/10 border-dashed border-muted-foreground/20 rounded-lg shadow-sm overflow-hidden`,
        className
      )}
      style={{ width: styleWidth, height: styleHeight, minHeight: styleHeight }}
      aria-label={label}
    >
      {renderAdContent()}
    </div>
  );
}
