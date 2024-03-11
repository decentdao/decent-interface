import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  return (
    <Box
      cursor={to ? 'pointer' : undefined}
      onClick={
        to
          ? () => {
            navigate(to);
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
