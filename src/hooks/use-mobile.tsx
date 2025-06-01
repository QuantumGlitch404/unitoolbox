
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Default to `false`. On the server, `window` is not available, so this effectively simulates a non-mobile state.
  // The first client render will also use `false` due to `hasMounted` being initially false.
  const [isMobile, setIsMobile] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    // Set hasMounted to true after the initial render, signaling client-side context is available.
    setHasMounted(true);

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Handler for when the media query match status changes
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    
    // Set the initial mobile state based on the media query *after* hasMounted is true
    setIsMobile(mql.matches);
    
    // Listen for changes
    mql.addEventListener("change", onChange);
    
    // Cleanup listener on component unmount
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array ensures this effect runs only once after initial mount

  // Return the server-consistent value (`false`) until mounted, then the actual client-side value.
  return hasMounted ? isMobile : false;
}
