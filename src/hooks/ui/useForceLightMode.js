/**
 * ============================================
 * USE FORCE LIGHT MODE HOOK
 * ============================================
 * 
 * Purpose: Forces the application to always display in light mode
 * Features:
 * - Removes 'dark' class from HTML element
 * - Adds 'force-light' class for CSS overrides
 * - Watches for class changes and re-applies forced light mode
 * - Cleans up mutation observer on unmount
 * 
 * Use Cases:
 * - Pages or components that should always appear in light mode
 * - Public/landing pages where dark mode is not desired
 * - PDF generation or print-friendly views
 * 
 * Dependencies:
 * - React hooks (useEffect)
 * 
 * Usage:
 * useForceLightMode();
 * ============================================
 */

import { useEffect } from 'react';

/**
 * ============================================
 * USE FORCE LIGHT MODE HOOK
 * ============================================
 * 
 * Forces the document to stay in light mode
 * by removing the 'dark' class and adding a
 * 'force-light' class for CSS overrides.
 * 
 * @returns {void}
 * 
 * @example
 * // In a component that should always be light
 * function PublicPage() {
 *   useForceLightMode();
 *   return <div>Always light mode</div>;
 * }
 * ============================================
 */
export function useForceLightMode() {
  useEffect(() => {
    const html = document.documentElement;
    let observer = null;

    /**
     * ============================================
     * FORCE LIGHT FUNCTION
     * ============================================
     * 
     * Removes the 'dark' class and adds the 'force-light' class
     * to ensure the page is displayed in light mode
     */
    const forceLight = () => {
      // Remove dark class
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
      }
      // Add a marker class for CSS overrides
      if (!html.classList.contains('force-light')) {
        html.classList.add('force-light');
      }
    };

    // Run immediately on mount
    forceLight();

    /**
     * ============================================
     * MUTATION OBSERVER
     * ============================================
     * 
     * Watches for changes to the HTML class attribute
     * If the 'dark' class is re-added, it is immediately removed
     * to maintain light mode
     */
    observer = new MutationObserver(() => {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
      }
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });

    /**
     * ============================================
     * CLEANUP
     * ============================================
     * 
     * Disconnects the mutation observer on unmount
     * Note: The 'dark' class state is not restored as we don't
     * know the original state before forcing light mode.
     */
    return () => {
      if (observer) observer.disconnect();
      // Restore dark if it was present before (optional)
      // but we don't know original state, so keep as is.
    };
  }, []);
}

export default useForceLightMode;