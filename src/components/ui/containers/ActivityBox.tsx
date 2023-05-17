import { Box, SlideFade } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { BaseBox } from './BaseBox';

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
      <BaseBox
        maxHeight="fit-content"
        minHeight="6.25rem"
        border={borderColor ? '1px' : undefined}
        borderColor={borderColor}
      >
        {children}
      </BaseBox>
    </SlideFade>
  );
}
