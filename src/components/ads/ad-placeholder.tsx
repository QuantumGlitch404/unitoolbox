
"use client";

import React, { useEffect, useRef, useId, useState } from 'react';
// Card and CardContent were not used, so removed.
import { cn } from '@/lib/utils';

const adTypeDimensions: Record<string, { width: string; height: string }> = {
  banner: { width: '100%', height: '90px' },
  leaderboard: { width: '100%', height: '90px' },
  mediumRectangle: { width: '300px', height: '250px' },
  largeRectangle: { width: '336px', height: '280px' },
  square: { width: '250px', height: '250px' },
  skyscraper: { width: '160px', height: '600px' },
  smallSquare: { width: '200px', height: '200px' },
  native: { width: '100%', height: 'auto' },
};

interface AdPlaceholderProps {
  width?: string | number;
  height?: string | number;
  // label prop is kept for potential future use or aria-label, but not for visible text currently
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
  const uniqueAdScriptId = useId();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  // Adsterra Codes
  const nativeAdScriptSrc = "//pl26831149.profitableratecpm.com/908fcf666666a1f8ab3d42398e87b77e/invoke.js";
  const nativeAdContainerFixedId = "container-908fcf666666a1f8ab3d42398e87b77e";

  const banner728x90Key = '7b914269a04118556b63666b58b8fc11';
  const banner728x90InvokeSrc = `//www.highperformanceformat.com/${banner728x90Key}/invoke.js`;

  useEffect(() => {
    if (!hasMounted || !adContainerRef.current) return;

    const adContainer = adContainerRef.current;
    adContainer.innerHTML = ''; // Clear previous content first
    // Remove any scripts this instance might have added previously
    document.querySelectorAll(`script[data-adplaceholder-instance="${uniqueAdScriptId}"]`).forEach(s => s.remove());

    let atOptionsScriptElement: HTMLScriptElement | null = null;
    let invokeScriptElement: HTMLScriptElement | null = null;

    if (type === 'leaderboard' || type === 'banner') {
      adContainer.style.width = '728px';
      adContainer.style.height = '90px';
      adContainer.style.margin = '0 auto';

      atOptionsScriptElement = document.createElement('script');
      atOptionsScriptElement.type = 'text/javascript';
      atOptionsScriptElement.setAttribute('data-adplaceholder-instance', uniqueAdScriptId);
      // Set innerHTML for the atOptions configuration
      atOptionsScriptElement.innerHTML = `
        atOptions = {
            'key' : '${banner728x90Key}',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
        };
      `;
      adContainer.appendChild(atOptionsScriptElement);

      invokeScriptElement = document.createElement('script');
      invokeScriptElement.type = 'text/javascript';
      invokeScriptElement.src = banner728x90InvokeSrc;
      invokeScriptElement.async = true;
      invokeScriptElement.setAttribute('data-adplaceholder-instance', uniqueAdScriptId);
      adContainer.appendChild(invokeScriptElement);

    } else if (type === 'native' || type === 'mediumRectangle' || type === 'smallSquare') {
      const nativeContainerDiv = document.createElement('div');
      nativeContainerDiv.id = nativeAdContainerFixedId;
      adContainer.appendChild(nativeContainerDiv);

      invokeScriptElement = document.createElement('script');
      invokeScriptElement.async = true;
      invokeScriptElement.setAttribute('data-cfasync', 'false');
      invokeScriptElement.src = nativeAdScriptSrc;
      invokeScriptElement.setAttribute('data-adplaceholder-instance', uniqueAdScriptId);
      adContainer.appendChild(invokeScriptElement);
    }

    return () => {
      if (atOptionsScriptElement && atOptionsScriptElement.parentNode) {
        atOptionsScriptElement.parentNode.removeChild(atOptionsScriptElement);
      }
      if (invokeScriptElement && invokeScriptElement.parentNode) {
        invokeScriptElement.parentNode.removeChild(invokeScriptElement);
      }
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = ''; // Clear container on cleanup
      }
    };
  }, [type, hasMounted, uniqueAdScriptId, banner728x90Key, banner728x90InvokeSrc, nativeAdScriptSrc, nativeAdContainerFixedId]);


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
        margin: (type === 'leaderboard' || type === 'banner') ? '0 auto' : undefined,
        maxWidth: '100%',
      }}
      aria-label={label} // Use the label prop for accessibility if needed
    >
      {/* Content is now exclusively injected by useEffect. No initial children that depend on client-side state. */}
      {/* This ensures server and initial client render match. */}
    </div>
  );
}
