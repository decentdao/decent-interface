import Hotjar from '@hotjar/browser';

export const initHotjar = () => {
  if (
    import.meta.env.VITE_APP_HOTJAR_VERSION === undefined ||
    import.meta.env.VITE_APP_HOTJAR_SITE_ID === undefined
  ) {
    // Do not initialize Hotjar if the site ID or version are not set, as this would be the case on all non-prod sites.
    return;
  }

  const hotjarSiteId = Number.parseInt(import.meta.env.VITE_APP_HOTJAR_SITE_ID);
  const hotjarVersion = Number.parseInt(import.meta.env.VITE_APP_HOTJAR_VERSION);

  if (Number.isNaN(hotjarSiteId) || Number.isNaN(hotjarVersion)) {
    throw new Error('Hotjar site ID and version must be numbers');
  }

  Hotjar.init(hotjarSiteId, hotjarVersion);
};
