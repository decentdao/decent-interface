import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';

export const INFOBOX_HEIGHT_REM = 10.5;
export const INFOBOX_PADDING_REM = 1;

export function InfoBox({
  minWidth = '100%',
  minHeight = INFOBOX_HEIGHT_REM + 'rem',
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
      p={INFOBOX_PADDING_REM + 'rem'}
      borderRadius="0.5rem"
      {...rest}
    >
      {children}
    </Box>
  );
}
