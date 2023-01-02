import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { Link, To } from 'react-router-dom';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';

export function InfoBox({
  minWidth = '100%',
  minHeight = '10.5rem',
  children,
  to,
  ...rest
}: {
  minHeight?: string;
  minWidth?: { [key: string]: string } | string;
  m?: string | number;
  to?: To;
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
      {!to ? children : <Link to={to}>{children}</Link>}
    </Box>
  );
}
