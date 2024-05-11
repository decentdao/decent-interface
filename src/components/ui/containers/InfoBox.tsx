import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

type InfoBoxProps = {
  minHeight?: string;
  background?: string;
  children: ReactNode;
} & BoxProps;

export function InfoBox({ minHeight = '10.6rem', children, ...rest }: InfoBoxProps) {
  return (
    <Box
      h="100%"
      minHeight={minHeight}
      p="1.5rem"
      mx="0.3rem"
      borderWidth="0.06rem"
      borderColor="neutral-3"
      borderRadius="0.5rem"
      {...rest}
    >
      {children}
    </Box>
  );
}
