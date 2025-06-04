
"use client";

import React, { useEffect, useRef, useId } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Script from 'next/script';

const adTypeDimensions: Record<string, { width: string; height: string }> = {
  banner: { width: '100%', height: '90px' }, // Will be overridden by 728x90 ad
  leaderboard: { width: '100%', height: '90px' }, // Will be overridden by 728x90 ad
  mediumRectangle: { width: '300px', height: '250px' },
  largeRectangle: { width: '336px', height: '280px' },
  square: { width: '250px', height: '250px' },
  skyscraper: { width: '160px', height: '600px' },
  smallSquare: { width: '200px', height: '200px' },
  native: { width: '100%', height: 'auto' }, // Native ads can be flexible
};

interface AdPlaceholderProps {
  width?: string | number;
  height?: string | number;
  label?: string;
  className?: string;
  type?: keyof typeof adTypeDimensions;
}

export function AdPlaceholder({
  width: customWidth,
  height: customHeight,
  label = "Advertisement",
  className,
  type = 'banner',
}: AdPlaceholderProps) {
  const dimensions = adTypeDimensions[type] || adTypeDimensions.banner;
  const styleWidth = customWidth ?? dimensions.width;
  const styleHeight = customHeight ?? dimensions.height;
  const uniqueAdId = useId(); // Generate a unique ID for script tags if needed

  // Adsterra Codes
  const nativeAdContainerId = "container-908fcf666666a1f8ab3d42398e87b77e";
  const nativeAdScriptSrc = "//pl26831149.profitableratecpm.com/908fcf666666a1f8ab3d42398e87b77e/invoke.js";
  
  const banner728x90Key = '7b914269a04118556b63666b58b8fc11';
  const banner728x90InvokeSrc = `//www.highperformanceformat.com/${banner728x90Key}/invoke.js`;

  const bannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((type === 'leaderboard' || type === 'banner') && bannerContainerRef.current) {
      const container = bannerContainerRef.current;
      // Clear previous scripts if any, to avoid multiple initializations on re-renders
      container.innerHTML = '';

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
      container.appendChild(atOptionsScript);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = banner728x90InvokeSrc;
      invokeScript.async = true;
      container.appendChild(invokeScript);

      // Set explicit size for the container of 728x90 ad
      container.style.width = '728px';
      container.style.height = '90px';
      container.style.margin = '0 auto'; // Center it
    }
  }, [type, banner728x90Key, banner728x90InvokeSrc]);

  const renderAdContent = () => {
    switch (type) {
      case 'leaderboard':
      case 'banner':
        // This div will be populated by the useEffect logic
        return <div ref={bannerContainerRef} className={`adsterra-banner-728x90-container-${uniqueAdId}`} />;
      
      case 'mediumRectangle':
      case 'smallSquare':
      case 'native':
        // Note: Using the same nativeAdContainerId for all these types means
        // only one of them will work correctly if multiple are on the same page.
        // For distinct native ads, you'd need different Adsterra ad unit codes & container IDs.
        return (
          <>
            <Script
              id={`adsterra-native-invoke-${uniqueAdId}`} // Unique ID for the script tag itself
              strategy="afterInteractive"
              async={true}
              data-cfasync="false" 
              src={nativeAdScriptSrc}
            />
            <div id={nativeAdContainerId}></div> {/* Adsterra targets this specific ID */}
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
      style={{ 
        width: (type === 'leaderboard' || type === 'banner') ? 'auto' : styleWidth, // Allow 728x90 container to self-size or be centered
        height: (type === 'leaderboard' || type === 'banner') ? 'auto' : styleHeight,
        minHeight: (type === 'leaderboard' || type === 'banner') ? '90px' : styleHeight, // Ensure min height for banners
        maxWidth: '100%', // Ensure ad placeholders don't overflow their parent
      }}
      aria-label={label}
    >
      {renderAdContent()}
    </div>
  );
}
