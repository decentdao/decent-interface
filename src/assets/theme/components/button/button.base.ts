// Global Base button
import { defineStyle } from '@chakra-ui/react';

const baseStyle = defineStyle({
  alignItems: 'center',
  borderRadius: '0.5rem',
  boxShadow: 'none',
  display: 'flex',
  justifyContent: 'center',
  gap: '4px',
  transition: 'all ease-out 300ms',
  _disabled: {
    cursor: 'default',
  },
  _hover: {},
  _focus: {},
});

export default baseStyle;
