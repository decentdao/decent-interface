import { Box, SlideFade } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function ActivityBox({
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
        minHeight="6.25rem"
        bg="black.900-semi-transparent"
        p="1rem"
        borderRadius="0.5rem"
        border={borderColor ? '1px' : undefined}
        borderColor={borderColor}
      >
        {children}
      </Box>
    </SlideFade>
  );
}
