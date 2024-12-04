// Global Base button
import { defineStyle } from '@chakra-ui/react';

const baseStyle = defineStyle({
  container: {
    borderRadius: '9999px',
  },
  track: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    borderRadius: '9999px',
    transition: 'all ease-out 300ms',
  },
  thumb: {
    borderRadius: '9999px',
    border: '1px solid',
    transition: 'all ease-out 300ms',
    marginLeft: '6px',
  },
});

export default baseStyle;
