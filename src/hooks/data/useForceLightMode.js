import { useEffect } from 'react';

export function useForceLightMode() {
  useEffect(() => {
    const html = document.documentElement;
    let observer = null;

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

    // Run immediately
    forceLight();

    // Watch for changes that might re-add 'dark'
    observer = new MutationObserver(() => {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
      }
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });

    // Cleanup
    return () => {
      if (observer) observer.disconnect();
      // Restore dark if it was present before (optional)
      // but we don't know original state, so keep as is.
    };
  }, []);
}

export default useForceLightMode;