import { Box, Divider, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';

export function TitledInfoBox({
  minWidth,
  title,
  titleTestId,
  children,
}: {
  minWidth?: { [key: string]: string };
  title?: string;
  titleTestId?: string;
  children?: ReactNode;
}) {
  return (
    <Box
      flexGrow={1}
      minWidth={minWidth}
      bg={BACKGROUND_SEMI_TRANSPARENT}
      p="1.5rem"
      borderRadius="0.5rem"
    >
      {title && (
        <Box>
          <Text
            data-testid={titleTestId}
            textStyle="text-base-sans-regular"
            color="grayscale.100"
            marginBottom="0.75rem"
          >
            {title}
          </Text>
          <Divider color="chocolate.700" />
        </Box>
      )}
      {children}
    </Box>
  );
}
