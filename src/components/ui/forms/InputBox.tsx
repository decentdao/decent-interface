import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

function InputBox({ children }: { children: ReactNode }) {
  return (
    <Box
      bg="black.500"
      rounded="lg"
      my="4"
      p="1.5rem"
    >
      {children}
    </Box>
  );
}

export default InputBox;
