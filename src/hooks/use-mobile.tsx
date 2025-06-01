
"use client";

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export interface UseMobileResult {
  isMobile: boolean;
  hasMounted: boolean;
}

export function useIsMobile(): UseMobileResult {
  const [isMobile, setIsMobile] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    
    setIsMobile(mql.matches);
    
    mql.addEventListener("change", onChange);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return { isMobile: hasMounted ? isMobile : false, hasMounted };
}
