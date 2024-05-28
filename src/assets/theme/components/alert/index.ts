import { alertAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import baseStyle from './alert.base';
import sizes from './alert.sizes';
import variants from './alert.variants';
const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(alertAnatomy.keys);

const Alert = defineMultiStyleConfig({
  baseStyle,
  sizes,
  variants,
  defaultProps: {
    size: 'lg',
    variant: 'info',
  },
});

export default Alert;
