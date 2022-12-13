import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';

export function InfoBox({
  minWidth = '100%',
  minHeight = '10.5rem',
  children,
  ...rest
}: {
  minHeight?: string;
  minWidth?: { [key: string]: string } | string;
  m?: string | number;
  children: ReactNode;
}) {
  return (
    <Box
      minWidth={minWidth}
      h="100%"
      minHeight={minHeight}
      bg={BACKGROUND_SEMI_TRANSPARENT}
      p="1rem"
      borderRadius="0.5rem"
      {...rest}
    >
      {children}
    </Box>
  );
}
