import { Box, Flex, Progress, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  value: number;
  unit?: string;
  valueLabel?: string;
  showValueWithinProgressBar?: boolean;
}
export default function ProgressBar({
  value,
  unit = '%',
  showValueWithinProgressBar = true,
  valueLabel,
}: ProgressBarProps) {
  return (
    <Box
      width="full"
      position="relative"
    >
      <Progress
        value={Math.min(value, 100)}
        height="24px"
        maxWidth="100%"
      />
      {showValueWithinProgressBar && value > 0 && (
        <Text
          display="inline-flex"
          alignItems="center"
          textStyle="text-sm-mono-semibold"
          color="gold.100"
          height="100%"
          position="absolute"
          top="0"
          left={value > 50 ? `calc(${Math.min(value - 5, 90)}% - 20px)` : value / 2}
        >
          {valueLabel || Math.min(value, 100)}
          {unit}
        </Text>
      )}
    </Box>
  );
}

interface QuorumProgressBarProps {
  helperText?: string;
  percentage: number;
  unit?: string;
  valueLabel?: string;
  reachedQuorum?: string;
  totalQuorum?: string;
}

export function QuorumProgressBar({
  percentage,
  unit,
  helperText,
  reachedQuorum,
  totalQuorum,
}: QuorumProgressBarProps) {
  const { t } = useTranslation('proposal');
  return (
    <Flex
      flexWrap="wrap"
      marginTop={2}
    >
      {reachedQuorum && totalQuorum && (
        <Flex
          width="100%"
          marginTop={2}
          marginBottom={3}
          justifyContent="space-between"
        >
          <Text textStyle="text-base-sans-regular">{t('quorum', { ns: 'common' })}</Text>
          <Text textStyle="text-base-sans-regular">
            {reachedQuorum}/{totalQuorum}
          </Text>
        </Flex>
      )}
      <ProgressBar
        value={Math.min(percentage, 100)}
        unit={unit}
        showValueWithinProgressBar={false}
      />
      {helperText && (
        <Text
          textStyle="text-sm-sans-regular"
          marginTop={3}
        >
          {helperText}
        </Text>
      )}
    </Flex>
  );
}
