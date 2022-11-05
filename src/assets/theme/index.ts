import { extendTheme } from '@chakra-ui/react';
import { theme as decentTheme } from '@decent-org/fractal-ui';
import web3ModalStyles from './web3modal';

const baseTheme = {
  ...decentTheme,
  styles: {
    global: {
      ...decentTheme.styles.global,
      ...web3ModalStyles,
      '.chakra-divider': {
        borderColor: 'chocolate.400',
      },
    },
  },
};
export const theme = extendTheme(
  {
    components: {
      Text: {
        variants: {
          infoLarge: {
            textStyle: 'text-lg-mono-regular',
            color: 'grayscale.100',
          },
          infoRegular: {
            textStyle: 'text-base-sans-regular',
            color: 'grayscale.100',
          },
          infoSmall: {
            textStyle: 'text-sm-sans-regular',
            color: 'chocolate.200',
          },
        },
      },
    },
  },
  baseTheme
);
