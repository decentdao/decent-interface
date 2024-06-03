import { defineStyleConfig } from '@chakra-ui/react';
import baseStyle from './button.base';
import sizes from './button.sizes';
import variants from './button.variants';

const Button = defineStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    size: 'base',
    variant: 'primary',
  },
});

export default Button;
