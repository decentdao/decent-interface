import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import baseStyle from './input.base';
import sizes from './input.sizes';

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(inputAnatomy.keys);

const Input = defineMultiStyleConfig({
  baseStyle,
  sizes,
  defaultProps: {
    size: 'base',
  },
});

export default Input;
