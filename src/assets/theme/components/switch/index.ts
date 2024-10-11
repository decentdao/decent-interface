import { defineStyleConfig } from '@chakra-ui/react';
import baseStyle from './switch.base';
import sizes from './switch.sizes';
import variants from './switch.variants';

const Switch = defineStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    size: 'sm',
    variant: 'primary',
  },
});

export default Switch;
