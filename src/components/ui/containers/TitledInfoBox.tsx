import { Box, Text, Show } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { CONTENT_MAXW } from '../../../constants/common';
import Divider from '../utils/Divider';

export function TitledInfoBox({
  width,
  title,
  titleTestId,
  children,
  bg,
}: {
  width: { [key: string]: string };
  title: string;
  titleTestId: string;
  children: ReactNode;
  bg?: string | { [key: string]: string };
}) {
  return (
    <Box
      width={width}
      py={{ base: '1rem', lg: '1.5rem' }}
      borderRadius={{ base: '0.75rem', lg: '0.5rem' }}
      bg={bg}
      maxW={CONTENT_MAXW}
      overflowX="scroll"
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
