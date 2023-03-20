import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
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
  to?: string;
  children: ReactNode;
}) {
  const { push } = useRouter();
  return (
    <Box
      cursor={to ? 'pointer' : undefined}
      onClick={
        to
          ? () => {
              push(to);
            }
          : undefined
      }
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
