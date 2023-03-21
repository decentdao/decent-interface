import { theme as decentTheme } from '@decent-org/fractal-ui';

export const theme = {
  ...decentTheme,
  styles: { global: { ...decentTheme.styles.global } },
};
