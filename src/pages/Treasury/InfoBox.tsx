import { Box, Divider, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function InfoBox({
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
      bg="black.900-semi-transparent"
      p="1.5rem"
      borderRadius="0.5rem"
    >
      {title && (
        <Box>
          <Text
            data-testid={titleTestId}
            variant="infoRegular"
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
