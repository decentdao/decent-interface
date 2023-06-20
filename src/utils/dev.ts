export const isProd = () => {
  return process.env.NEXT_PUBLIC_SITE_URL === 'https://app.fractalframework.xyz/';
};
