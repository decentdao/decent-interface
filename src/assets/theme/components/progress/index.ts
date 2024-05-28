import { progressAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import baseStyle from './progress.base';
import sizes from './progress.size';

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(progressAnatomy.keys);

const Progress = defineMultiStyleConfig({
  baseStyle,
  sizes,
  defaultProps: {
    size: 'base',
  },
});

export default Progress;
