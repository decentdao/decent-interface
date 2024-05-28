import { defineStyleConfig } from '@chakra-ui/react';
import baseStyle from './textarea.base';
import sizes from './textarea.sizes';

const Textarea = defineStyleConfig({
  variants: { base: baseStyle },
  sizes,
  defaultProps: {
    size: 'base',
    variant: 'base',
  },
});

export default Textarea;
