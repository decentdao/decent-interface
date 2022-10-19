import { theme as decentTheme } from '@decent-org/fractal-ui';
import web3ModalStyles from './web3modal';

export const theme = {
  ...decentTheme,
  styles: { global: { ...decentTheme.styles.global, ...web3ModalStyles } },
};
