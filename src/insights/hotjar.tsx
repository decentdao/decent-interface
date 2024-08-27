import Hotjar from '@hotjar/browser';

const hotjarSiteId = import.meta.env.VITE_APP_HOTJAR_SITE_ID;
const hotjarVersion = import.meta.env.VITE_APP_HOTJAR_VERSION;

if (hotjarSiteId !== undefined && hotjarVersion !== undefined) {
  console.count('initHotjar from hotjar file');
  Hotjar.init(hotjarSiteId, hotjarVersion);
}
