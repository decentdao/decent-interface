import { Box, Flex, Progress, Text } from '@chakra-ui/react';
import ProgressBarDelimiter from './svg/ProgressBarDelimiter';

export default function ProgressBar({
  value,
  requiredValue,
}: {
  value: number;
  requiredValue?: number;
}) {
  return (
    <Box
      width="full"
      position="relative"
    >
      <Progress
        value={value}
        size="lg"
      />
      {value > 0 && (
        <Text
          display="inline-flex"
          alignItems="center"
          textStyle="text-sm-mono-semibold"
          color="gold.100"
          height="100%"
          position="absolute"
          top="0"
          left={`calc(${value - 5}% - 20px)`}
        >
          {value}%
        </Text>
      )}
      {!!(requiredValue && requiredValue > 0) && (
        <Box
          position="absolute"
          top="-10px"
          left={`${requiredValue}%`}
        >
          <ProgressBarDelimiter />
        </Box>
      )}
    </Box>
  );
}

interface ExtendedProgressBarProps {
  label: string;
  helperText: string;
  percentage: number;
  requiredPercentage: number;
}

export function ExtendedProgressBar({
  label,
  helperText,
  percentage,
  requiredPercentage,
}: ExtendedProgressBarProps) {
  return (
    <Flex
      flexWrap="wrap"
      marginTop={2}
    >
      <Text
        marginTop={2}
        marginBottom={3}
        textStyle="text-base-sans-regular"
      >
        {label}
      </Text>
      <ProgressBar
        value={percentage}
        requiredValue={requiredPercentage}
      />
      <Text
        textStyle="text-sm-sans-regular"
        marginTop={3}
      >
        {helperText}
      </Text>
    </Flex>
  );
}
