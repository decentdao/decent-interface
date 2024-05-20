import { SlideFade } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { StyledBox } from './StyledBox';

export function ActivityBox({
  children,
  borderColor = 'transparent',
  ...rest
}: {
  children?: ReactNode;
  borderColor?: string;
}) {
  return (
    <SlideFade
      offsetY="-100%"
      in
    >
      <StyledBox
        maxHeight="fit-content"
        minHeight="6.25rem"
        border="1px"
        borderColor={borderColor}
        _hover={{ bg: 'neutral-3' }}
        _active={{ bg: 'neutral-2', border: '1px solid', borderColor: 'neutral-3' }}
        {...rest}
      >
        {children}
      </StyledBox>
    </SlideFade>
  );
}
