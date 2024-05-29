import { theme as defaultTheme, mergeThemeOverride } from '@chakra-ui/react';
import breakpoints from './breakpoints';
import colors from './colors';
import components from './components';
import styles from './global';
import textStyles from './textStyle';

// @todo Menu button must be removed from the default components, there is some overriding going on.
const filteredDefaultComponents = Object.fromEntries(
  Object.entries(defaultTheme.components).filter(([key]) => !["Menu"].includes(key))
)
export const theme = mergeThemeOverride({
  ...defaultTheme,
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles,
  breakpoints,
  colors,
  textStyles,
  components: Object.assign(filteredDefaultComponents, components),
});
console.log('🚀 ~ theme', theme);
