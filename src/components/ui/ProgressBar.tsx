import { Box, Progress, Text } from '@chakra-ui/react';

export default function ProgressBar({ value }: { value: number }) {
  return (
    <Box
      width="full"
      position="relative"
    >
      <Progress
        value={value}
        colorScheme="drab"
        bg="drab.700"
        size="lg"
        height="24px"
        borderRadius="12px"
      />
      {value > 0 && (
        <Text
          color="gold.100"
          position="absolute"
          top="0"
          left={`calc(${value - 5}% - 12px)`}
        >
          {value}%
        </Text>
      )}
    </Box>
  );
}
