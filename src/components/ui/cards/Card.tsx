import { Box, BoxProps } from '@chakra-ui/react';

export function Card({ children, ...rest }: BoxProps) {
  return (
    <Box
      backgroundColor="neutral-2"
      _hover={{ backgroundColor: 'neutral-3' }}
      _active={{ backgroundColor: 'neutral-2', border: '1px solid', borderColor: 'neutral-3' }}
      transition="all ease-out 300ms"
      p={{ base: '1rem', lg: '1.5rem' }}
      borderRadius="0.5rem"
      border="1px solid"
      borderColor="neutral-3"
      cursor={rest.onClick ? 'pointer' : 'default'}
      {...rest}
    >
      {children}
    </Box>
  );
}
