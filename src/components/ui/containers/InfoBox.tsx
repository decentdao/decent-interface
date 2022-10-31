import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function InfoBox({
  minWidth = '100%',
  children,
}: {
  minWidth?: { [key: string]: string } | string;
  children?: ReactNode;
}) {
  return (
    <Box
      minWidth={minWidth}
      h="100%"
      bg="black.900-semi-transparent"
      p="1rem"
      borderRadius="0.5rem"
    >
      {children}
    </Box>
  );
}
