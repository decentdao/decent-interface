import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

export default function StatusBox({ children }: { children: ReactNode }) {
  return (
    <Box
      px="8px"
      py="2px"
      height="22px"
      display="inline-flex"
      alignItems="center"
      bg="sand.700"
      borderRadius="7px"
      color="black"
    >
      {children}
    </Box>
  );
}
