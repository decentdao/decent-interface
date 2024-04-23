import { Box, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Divider from '../utils/Divider';
import { StyledBox } from './StyledBox';

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
    <StyledBox
      flexGrow={1}
      minWidth={minWidth}
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
          <Divider />
        </Box>
      )}
      {children}
    </StyledBox>
  );
}
