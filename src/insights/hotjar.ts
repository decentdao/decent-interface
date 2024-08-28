import Hotjar from '@hotjar/browser';

export const initHotjar = () => {
  console.count("initHotjar");
  const hotjarSiteId = import.meta.env.VITE_APP_HOTJAR_SITE_ID;
  const hotjarVersion = import.meta.env.VITE_APP_HOTJAR_VERSION;

  if (hotjarSiteId !== undefined && hotjarVersion !== undefined) {
    Hotjar.init(hotjarSiteId, hotjarVersion);
  }
};
