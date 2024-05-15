import { Box, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
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
  bg?: string;
}) {
  return (
    <Box
      flexGrow={1}
      width={width}
      p="1.5rem"
      borderRadius="0.5rem"
      bg={bg}
    >
      <Text
        data-testid={titleTestId}
        textStyle="display-lg"
      >
        {title}
      </Text>
      <Divider
        my="1rem"
        variant="darker"
      />
      {children}
    </Box>
  );
}
