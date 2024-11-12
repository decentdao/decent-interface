import { theme as defaultTheme, mergeThemeOverride } from '@chakra-ui/react';
import breakpoints from './breakpoints';
import colors from './colors';
import components from './components';
import styles from './global';
import textStyles from './textStyle';

// @todo Menu button must be removed from the default components, there is some overriding going on.
const filteredDefaultComponents = Object.fromEntries(
  Object.entries(defaultTheme.components).filter(([key]) => !['Menu'].includes(key)),
);
export const theme = mergeThemeOverride({
  // @note There are other properties that are not included in mergeThemeOverride
  ...defaultTheme,
  fonts: {
    heading: `'DM Sans Variable', sans-serif`,
    body: `'DM Sans Variable', sans-serif`,
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  shadows: {
    layeredShadowBorder:
      '0px 0px 0px 1px #100414, inset 0px 0px 0px 1px rgba(248, 244, 252, 0.04), inset 0px 1px 0px rgba(248, 244, 252, 0.04)',
  },
  styles,
  breakpoints,
  colors,
  textStyles,
  components: Object.assign(filteredDefaultComponents, components),
});
