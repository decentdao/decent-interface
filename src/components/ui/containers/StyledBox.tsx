import { Box, BoxProps } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

interface StyledBoxProps extends BoxProps {
  to?: string;
}

export function StyledBox({ children, to, ...rest }: StyledBoxProps) {
  return (
    <Box
      as={to ? Link : undefined}
      to={to}
      bg="neutral-2"
      p="1.5rem"
      borderRadius="0.5rem"
      {...rest}
    >
      {children}
    </Box>
  );
}
