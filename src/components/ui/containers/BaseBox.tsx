import { Box, BoxProps } from '@chakra-ui/react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';

export function BaseBox({ children, ...rest }: BoxProps) {
  return (
    <Box
      bg={BACKGROUND_SEMI_TRANSPARENT}
      p="1.5rem"
      borderRadius="0.5rem"
      {...rest}
    >
      {children}
    </Box>
  );
}
