import { SlideFade } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { StyledBox } from './StyledBox';

export function ActivityBox({
  children,
  borderColor,
}: {
  children?: ReactNode;
  borderColor?: string;
}) {
  return (
    <SlideFade
      offsetY={'-100%'}
      in={true}
    >
      <StyledBox
        maxHeight="fit-content"
        minHeight="6.25rem"
        border={borderColor ? '1px' : undefined}
        borderColor={borderColor}
      >
        {children}
      </StyledBox>
    </SlideFade>
  );
}
