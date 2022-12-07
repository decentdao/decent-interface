import { Box, SlideFade } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function ActionBox({
  children,
  borderColor,
}: {
  children?: ReactNode;
  borderColor?: string;
}) {
  return (
    <SlideFade
      offsetY={'-100%'}
      in={true}
    >
      <Box
        maxHeight="8.125rem"
        bg="black.900-semi-transparent"
        px="1rem"
        borderRadius="0.5rem"
        border="4px"
        borderColor={borderColor}
      >
        {children}
      </Box>
    </SlideFade>
  );
}
