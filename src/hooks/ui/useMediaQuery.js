/**
 * ============================================
 * USE MEDIA QUERY HOOK
 * ============================================
 * 
 * Purpose: React hook for responsive design using CSS media queries
 * Features:
 * - Returns boolean indicating if viewport matches media query
 * - Reacts to window resize events
 * - Cleanup on unmount
 * - Supports any valid CSS media query
 * 
 * Use Cases:
 * - Responsive component rendering based on screen size
 * - Conditional rendering for mobile/tablet/desktop
 * - Dynamic layout adjustments
 * 
 * Dependencies:
 * - React hooks (useState, useEffect)
 * 
 * Usage:
 * const isMobile = useMediaQuery('(max-width: 640px)');
 * const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * ============================================
 */

import { useState, useEffect } from 'react';

/**
 * ============================================
 * USE MEDIA QUERY HOOK
 * ============================================
 * 
 * A hook that returns a boolean indicating if the current viewport matches
 * the given media query string.
 * 
 * @param {string} query - CSS media query string (e.g., '(max-width: 640px)')
 * @returns {boolean} true if the query matches, false otherwise.
 * 
 * @example
 * // Mobile detection
 * const isMobile = useMediaQuery('(max-width: 640px)');
 * 
 * // Tablet detection
 * const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
 * 
 * // Desktop detection
 * const isDesktop = useMediaQuery('(min-width: 1025px)');
 * 
 * // Dark mode preference
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * 
 * // Conditional rendering
 * {isMobile ? <MobileView /> : <DesktopView />}
 * ============================================
 */
export function useMediaQuery(query) {
  /**
   * ============================================
   * STATE MANAGEMENT
   * ============================================
   * 
   * Tracks whether the media query currently matches
   * Initialized to false, updated on mount and resize
   */
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    /**
     * ============================================
     * MEDIA QUERY LISTENER SETUP
     * ============================================
     * 
     * 1. Creates a MediaQueryList object
     * 2. Sets initial state based on current viewport
     * 3. Adds change listener for resize events
     * 4. Cleans up listener on unmount
     */
    const media = window.matchMedia(query);
    
    // Set initial value based on current viewport
    setMatches(media.matches);

    // Listener for viewport changes
    const listener = (event) => setMatches(event.matches);
    
    // Modern API (preferred)
    media.addEventListener('change', listener);
    
    // Cleanup on unmount
    return () => media.removeEventListener('change', listener);
  }, [query]); // Re-run when query changes

  return matches;
}

export default useMediaQuery;