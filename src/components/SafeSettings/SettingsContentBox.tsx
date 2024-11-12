import { BoxProps } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { NEUTRAL_2_84 } from '../../constants/common';
import { StyledBox } from '../ui/containers/StyledBox';

export function SettingsContentBox({ children, ...props }: PropsWithChildren<BoxProps>) {
  return (
    <StyledBox
      w="100%"
      borderTopLeftRadius={{ base: '0.75rem', md: '0' }}
      borderBottomLeftRadius={{ base: '0.75rem', md: '0' }}
      bg={NEUTRAL_2_84}
      {...props}
    >
      {children}
    </StyledBox>
  );
}
