
"use client";

import React, { useEffect, useRef, useId } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const adTypeDimensions: Record<string, { width: string; height: string }> = {
  banner: { width: '100%', height: '90px' }, // Will be overridden by 728x90 Adsterra script
  leaderboard: { width: '100%', height: '90px' }, // Will be overridden by 728x90 Adsterra script
  mediumRectangle: { width: '300px', height: '250px' }, // For Native Banner, this is a suggested size
  largeRectangle: { width: '336px', height: '280px' },
  square: { width: '250px', height: '250px' },
  skyscraper: { width: '160px', height: '600px' },
  smallSquare: { width: '200px', height: '200px' }, // For Native Banner, this is a suggested size
  native: { width: '100%', height: 'auto' }, // Native can be flexible
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
  
  const adContainerRef = useRef<HTMLDivElement>(null);
  const uniqueAdScriptId = useId(); // Unique ID for script elements

  // Adsterra Codes
  const nativeAdScriptSrc = "//pl26831149.profitableratecpm.com/908fcf666666a1f8ab3d42398e87b77e/invoke.js";
  const nativeAdContainerFixedId = "container-908fcf666666a1f8ab3d42398e87b77e"; 
  
  const banner728x90Key = '7b914269a04118556b63666b58b8fc11';
  const banner728x90InvokeSrc = `//www.highperformanceformat.com/${banner728x90Key}/invoke.js`;

  useEffect(() => {
    const adContainer = adContainerRef.current;
    if (!adContainer) return;

    // Clear previous ad content and scripts added by this instance
    adContainer.innerHTML = '';
    const oldScripts = document.querySelectorAll(`script[data-adplaceholder-instance="${uniqueAdScriptId}"]`);
    oldScripts.forEach(s => s.remove());

    let atOptionsScript: HTMLScriptElement | null = null;
    let invokeScript: HTMLScriptElement | null = null;
    let nativeContainerDiv: HTMLDivElement | null = null;

    if (type === 'leaderboard' || type === 'banner') {
      adContainer.style.width = '728px'; // Force size for this specific banner
      adContainer.style.height = '90px';
      adContainer.style.margin = '0 auto'; // Center it

      // 1. Create and append the atOptions script
      atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.setAttribute('data-adplaceholder-instance', uniqueAdScriptId);
      atOptionsScript.innerHTML = `
        atOptions = {
            'key' : '${banner728x90Key}',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
        };
      `;
      adContainer.appendChild(atOptionsScript);

      // 2. Create and append the invoke.js script
      invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = banner728x90InvokeSrc;
      invokeScript.async = true;
      invokeScript.setAttribute('data-adplaceholder-instance', uniqueAdScriptId);
      adContainer.appendChild(invokeScript);

    } else if (type === 'native' || type === 'mediumRectangle' || type === 'smallSquare') {
      // For Native Banner (4:1), which you want to use for mediumRect and smallSquare
      // The script expects a div with a specific ID to exist.
      
      // Create the container div if it's not already there (it shouldn't be due to innerHTML clear)
      nativeContainerDiv = document.createElement('div');
      nativeContainerDiv.id = nativeAdContainerFixedId;
      adContainer.appendChild(nativeContainerDiv);

      // Create and append the Native Banner invoke.js script
      // Check if a similar script isn't already loaded globally to avoid issues,
      // though Adsterra's script might be idempotent.
      // For safety, we ensure this instance tries to load its script.
      if (!document.querySelector(`script[src="${nativeAdScriptSrc}"][data-adplaceholder-instance="${uniqueAdScriptId}"]`)) {
        invokeScript = document.createElement('script');
        invokeScript.async = true;
        invokeScript.setAttribute('data-cfasync', 'false');
        invokeScript.src = nativeAdScriptSrc;
        invokeScript.setAttribute('data-adplaceholder-instance', uniqueAdScriptId);
        adContainer.appendChild(invokeScript); // Append to adContainer to keep it local
      }
    }

    return () => {
      // Cleanup: remove dynamically added scripts if the component unmounts or type changes
      if (atOptionsScript && atOptionsScript.parentNode) {
        atOptionsScript.parentNode.removeChild(atOptionsScript);
      }
      if (invokeScript && invokeScript.parentNode) {
        invokeScript.parentNode.removeChild(invokeScript);
      }
      // The nativeContainerDiv will be removed when adContainer.innerHTML is cleared on next effect run
    };
  }, [type, adContainerRef, uniqueAdScriptId, banner728x90Key, banner728x90InvokeSrc, nativeAdScriptSrc, nativeAdContainerFixedId]);

  return (
    <div
      ref={adContainerRef}
      className={cn(
        `flex items-center justify-center bg-muted/10 border-dashed border-muted-foreground/20 rounded-lg shadow-sm overflow-hidden ad-placeholder-${type}`,
        className
      )}
      style={{
        width: (type === 'leaderboard' || type === 'banner') ? '728px' : styleWidth,
        height: (type === 'leaderboard' || type === 'banner') ? '90px' : styleHeight,
        minHeight: (type === 'leaderboard' || type === 'banner') ? '90px' : 
                     (type === 'native' || type === 'mediumRectangle' || type ==='smallSquare') ? '100px' : styleHeight,
        margin: (type === 'leaderboard' || type === 'banner') ? '0 auto' : undefined, // Centering for 728x90
        maxWidth: '100%',
      }}
      aria-label={label}
    >
      {/* Fallback content or initial structure if Adsterra doesn't immediately fill */}
      {/* The native ad requires the specific div, which is added by useEffect if 'native' type */}
      {/* For non-script types, or as a very basic fallback before scripts run: */}
      {(type !== 'leaderboard' && type !== 'banner' && !(type === 'native' || type === 'mediumRectangle' || type === 'smallSquare')) && (
         <CardContent className="p-2 text-center flex flex-col items-center justify-center h-full">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground/70">{`${styleWidth} x ${styleHeight}`}</p>
          </CardContent>
      )}
       {/* Initial loading text for slots that expect Adsterra scripts to fill them */}
      {isLoadingInitially() && (
         <div className="p-2 text-center flex flex-col items-center justify-center h-full">
          <p className="text-xs text-muted-foreground">Loading Ad...</p>
        </div>
      )}
    </div>
  );

  // Helper function to determine if we should show "Loading Ad..."
  function isLoadingInitially() {
    if (typeof window === 'undefined') return false; // Don't show on server
    if (type === 'leaderboard' || type === 'banner') return true;
    if (type === 'native' || type === 'mediumRectangle' || type === 'smallSquare') return true;
    return false;
  }
}
