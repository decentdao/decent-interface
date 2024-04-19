import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';
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
  ...rest
}: InfoBoxProps) {
  const navigate = useNavigate();
  return (
    <Box
      cursor={to ? 'pointer' : undefined}
      onClick={to ? () => navigate(to) : undefined}
      minWidth={minWidth}
      h="100%"
      minHeight={minHeight}
      p="1.5rem"
      mx="1.5rem"
      borderWidth="0.06rem"
      borderColor="neutral-3"
      borderRadius="0.5rem"
      {...rest}
    >
      {children}
    </Box>
  );
}
