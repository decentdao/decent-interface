import { defineStyleConfig } from '@chakra-ui/react';

import baseStyle from './iconButton.base';
import sizes from './iconButton.sizes';
import variants from './iconButton.variants';

const IconButton = defineStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    size: 'icon-md',
    variant: 'primary',
  },
});

export default IconButton;
