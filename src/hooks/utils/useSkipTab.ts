import { useEffect } from 'react';

const useSkipTab = (sectionId: string) => {
  useEffect(() => {
    const section = document.getElementById(sectionId);

    if (!section) return;

    const updateTabIndex = () => {
      const focusableElements = section.querySelectorAll('a, button, input, [tabindex]');
      focusableElements.forEach(el => {
        el.setAttribute('tabindex', '-1');
      });
    };

    // Initial call to set tabindex
    updateTabIndex();

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(() => {
      updateTabIndex();
    });

    // Start observing the target node for configured mutations
    observer.observe(section, {
      childList: true, // observe direct children changes
      subtree: true, // observe all descendants
    });

    // Clean up by disconnecting the observer
    return () => {
      observer.disconnect();
    };
  }, [sectionId]);
};

export default useSkipTab;
