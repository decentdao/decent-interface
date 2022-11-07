import { Box, SlideFade } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function ActivityBox({ children }: { children?: ReactNode }) {
  return (
    <SlideFade
      offsetY={'-100%'}
      in={true}
    >
      <Box
        maxHeight="8.125rem"
        h="6.25rem"
        bg="black.900-semi-transparent"
        p="1rem"
        borderRadius="0.5rem"
      >
        {children}
      </Box>
    </SlideFade>
  );
}
