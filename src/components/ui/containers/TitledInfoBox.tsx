import { Box, Text, Show, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { CONTENT_MAXW } from '../../../constants/common';
import Divider from '../utils/Divider';

export function TitledInfoBox({
  title,
  titleTestId,
  children,
  ...rest
}: {
  title: string;
  titleTestId: string;
  children: ReactNode;
} & BoxProps) {
  return (
    <Box
      py={{ base: '1rem', lg: '1.5rem' }}
      borderRadius={{ base: '0.75rem', lg: '0.5rem' }}
      maxW={CONTENT_MAXW}
      overflowX="scroll"
      {...rest}
    >
      <Text
        data-testid={titleTestId}
        textStyle="display-lg"
        px={{ base: '1rem', lg: '1.5rem' }}
      >
        {title}
      </Text>
      <Show above="md">
        <Divider
          my="1rem"
          variant="darker"
        />
      </Show>
      {children}
    </Box>
  );
}
