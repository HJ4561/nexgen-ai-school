import { useState, useEffect } from 'react';

/**
 * useMediaQuery
 * 
 * A hook that returns a boolean indicating if the current viewport matches
 * the given media query string.
 * 
 * @param {string} query - CSS media query string (e.g., '(max-width: 640px)')
 * @returns {boolean} true if the query matches, false otherwise.
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 640px)');
 * const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Set initial value
    setMatches(media.matches);

    const listener = (event) => setMatches(event.matches);
    // Modern API
    media.addEventListener('change', listener);
    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export default useMediaQuery;