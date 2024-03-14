export const isProd = () => {
  return import.meta.env.VITE_APP_SITE_URL === 'https://app.fractalframework.xyz/';
};
