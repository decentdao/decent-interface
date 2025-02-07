import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { WarningCircle } from '@phosphor-icons/react';

interface AlertBannerProps {
  message: string;
  variant: 'warning' | 'error' | 'info';
  layout: 'horizontal' | 'vertical';
}

export function AlertBanner({ message, variant, layout }: AlertBannerProps) {
  return (
    <Box
      width="100%"
      borderRadius="0.75rem"
      bg="neutral-3"
      p={6}
    >
      <Flex
        alignItems="center"
        gap={4}
      >
        <Icon
          as={WarningCircle}
          boxSize="1.5rem"
          color="lilac-0"
        />
        <Text
          color="lilac-0"
          textStyle="body-small"
        >
          {message}
        </Text>
      </Flex>
    </Box>
  );
}
