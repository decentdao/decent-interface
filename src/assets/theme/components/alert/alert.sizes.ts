import { alertAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle } = createMultiStyleConfigHelpers(alertAnatomy.keys);

const base = definePartsStyle({
  title: {
    px: '1rem',
  },
  description: {
    px: '1rem',
  },
  container: {},
  icon: {
    '& > svg': {
      boxSize: '1.25rem',
    },
  },
});

const lg = definePartsStyle({
  title: {
    px: '1rem',
    h: '4.5rem',
  },
  description: {
    px: '1rem',
    h: '4.5rem',
  },
  container: {},
  icon: {
    '& > svg': {
      boxSize: '1.5rem',
    },
  },
});

const sizes = {
  base,
  lg,
};

export default sizes;
