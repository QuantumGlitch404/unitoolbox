
"use client";

import React, { useEffect, useRef, useId } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const adTypeDimensions: Record<string, { width: string; height: string }> = {
  banner: { width: '100%', height: '90px' },
  leaderboard: { width: '100%', height: '90px' },
  mediumRectangle: { width: '300px', height: '250px' },
  largeRectangle: { width: '336px', height: '280px' },
  square: { width: '250px', height: '250px' },
  skyscraper: { width: '160px', height: '600px' },
  smallSquare: { width: '200px', height: '200px' },
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
  const scriptContainerRef = useRef<HTMLDivElement>(null); // Separate ref for scripts if needed

  // Adsterra Codes
  const nativeAdScriptSrc = "//pl26831149.profitableratecpm.com/908fcf666666a1f8ab3d42398e87b77e/invoke.js";
  const nativeAdContainerFixedId = "container-908fcf666666a1f8ab3d42398e87b77e"; // This ID is for the Native Banner
  
  const banner728x90Key = '7b914269a04118556b63666b58b8fc11';
  const banner728x90InvokeSrc = `//www.highperformanceformat.com/${banner728x90Key}/invoke.js`;

  useEffect(() => {
    const adContainer = adContainerRef.current;
    if (!adContainer) return;

    // Clear previous ad content
    adContainer.innerHTML = '';
    
    // Remove any old script tags that might have been added by this component instance
    const oldScripts = document.querySelectorAll(`script[data-adplaceholder-id="${adContainer.id}"]`);
    oldScripts.forEach(s => s.remove());

    let mainScript: HTMLScriptElement | null = null;
    let optionsScript: HTMLScriptElement | null = null;

    if (type === 'leaderboard' || type === 'banner') {
      adContainer.style.width = '728px';
      adContainer.style.height = '90px';
      adContainer.style.margin = '0 auto';

      optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.setAttribute('data-adplaceholder-id', adContainer.id);
      optionsScript.innerHTML = `
        atOptions = {
            'key' : '${banner728x90Key}',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
        };
      `;
      adContainer.appendChild(optionsScript);

      mainScript = document.createElement('script');
      mainScript.type = 'text/javascript';
      mainScript.src = banner728x90InvokeSrc;
      mainScript.async = true;
      mainScript.setAttribute('data-adplaceholder-id', adContainer.id);
      adContainer.appendChild(mainScript);

    } else if (type === 'native' || type === 'mediumRectangle' || type === 'smallSquare') {
      // Native Banner (4:1)
      // The Native Banner script creates its own container, so we ensure the target div is present
      // The provided script for Native Banner seems to expect a div with a specific ID.
      // We should render this div, but if this placeholder is used multiple times on a page,
      // HTML IDs must be unique. Adsterra might handle this, or it could be an issue.
      // For simplicity, we'll create the specific div if it doesn't exist.
      
      // The div with ID "container-908fcf666666a1f8ab3d42398e87b77e" should be directly in the HTML.
      // The script will then populate it.
      // We just need to make sure the invoke.js script is loaded.
      
      // Check if the specific container div already exists within our placeholder
      let nativeTargetDiv = adContainer.querySelector(`#${nativeAdContainerFixedId}`) as HTMLDivElement;
      if (!nativeTargetDiv) {
        nativeTargetDiv = document.createElement('div');
        nativeTargetDiv.id = nativeAdContainerFixedId;
        adContainer.appendChild(nativeTargetDiv);
      }

      // Check if the script is already added to the head to avoid duplicates
      if (!document.querySelector(`script[src="${nativeAdScriptSrc}"]`)) {
        mainScript = document.createElement('script');
        mainScript.async = true;
        mainScript.setAttribute('data-cfasync', 'false');
        mainScript.src = nativeAdScriptSrc;
        mainScript.setAttribute('data-adplaceholder-id', adContainer.id); // Mark our script
        document.head.appendChild(mainScript); // Native banner script often goes in head
      } else {
        // If script already exists, Adsterra might have a way to re-invoke or refresh for a new container.
        // This part is Adsterra-specific. For now, assume their script handles multiple divs if configured.
        // Or, their `invoke.js` might be designed to find all divs with that ID.
        // If using a fixed ID, only one instance on the page will work.
        // A better approach for multiple native ads would be unique spot IDs from Adsterra.
      }
    }

    return () => {
      // Cleanup: remove scripts when component unmounts or type changes
      // This is important to prevent memory leaks or multiple ad initializations
      if (mainScript && mainScript.parentNode) {
        mainScript.parentNode.removeChild(mainScript);
      }
      if (optionsScript && optionsScript.parentNode) {
        optionsScript.parentNode.removeChild(optionsScript);
      }
      // The div with the fixed ID for native banner should also be cleaned if this placeholder created it
      // and no other placeholder instance for native banner is active on the page.
      // This becomes tricky if multiple placeholders use the same fixed ID.
      // A simpler approach for now is to let the main adContainer.innerHTML = '' handle removal.
    };
  }, [type, banner728x90Key, banner728x90InvokeSrc, nativeAdScriptSrc, nativeAdContainerFixedId]);

  return (
    <div
      ref={adContainerRef}
      id={`ad-placeholder-instance-${useId()}`} // Unique ID for each placeholder instance for script tracking
      className={cn(
        `flex items-center justify-center bg-muted/10 border-dashed border-muted-foreground/20 rounded-lg shadow-sm overflow-hidden ad-placeholder-${type}`,
        className
      )}
      style={{
        width: (type === 'leaderboard' || type === 'banner') ? '728px' : styleWidth,
        height: (type === 'leaderboard' || type === 'banner') ? '90px' : styleHeight,
        minHeight: (type === 'leaderboard' || type === 'banner') ? '90px' : (type === 'native' || type === 'mediumRectangle' || type ==='smallSquare') ? '100px' : styleHeight, // Min height for native-like ads
        margin: (type === 'leaderboard' || type === 'banner') ? '0 auto' : undefined,
        maxWidth: '100%',
      }}
      aria-label={label}
    >
      {/* Fallback content if Adsterra fails to load an ad, or before it loads */}
      {/* The native ad requires a specific div with ID, ensure it's here if needed */}
      {(type === 'native' || type === 'mediumRectangle' || type === 'smallSquare') && (
        <div id={nativeAdContainerFixedId} className="w-full h-full">
          {/* Adsterra script will fill this div */}
        </div>
      )}
       {/* Visual placeholder for non-native/non-728x90 types, or when no ad loads */}
      {type !== 'leaderboard' && type !== 'banner' && type !=='native' && type !== 'mediumRectangle' && type !== 'smallSquare' && (
         <CardContent className="p-2 text-center flex flex-col items-center justify-center h-full">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground/70">{`${styleWidth} x ${styleHeight}`}</p>
          </CardContent>
      )}
    </div>
  );
}
