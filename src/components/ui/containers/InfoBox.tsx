import { Box, BoxProps } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';

type InfoBoxProps = {
  minHeight?: string;
  minWidth?: { [key: string]: string } | string;
  m?: string | number;
  to?: string;
  background?: string;
  children: ReactNode;
} & BoxProps;

export function InfoBox({
  minWidth = '100%',
  minHeight = '10.6rem',
  children,
  to,
  background,
  ...rest
}: InfoBoxProps) {
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
      bg={background || BACKGROUND_SEMI_TRANSPARENT}
      p="1rem"
      borderRadius="0.5rem"
      {...rest}
    >
      {children}
    </Box>
  );
}
