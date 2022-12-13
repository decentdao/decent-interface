import { Box, SlideFade } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';

export function ActivityBox({ children }: { children?: ReactNode }) {
  return (
    <SlideFade
      offsetY={'-100%'}
      in={true}
    >
      <Box
        maxHeight="fit-content"
        minHeight="6.25rem"
        bg={BACKGROUND_SEMI_TRANSPARENT}
        p="1rem"
        borderRadius="0.5rem"
      >
        {children}
      </Box>
    </SlideFade>
  );
}
