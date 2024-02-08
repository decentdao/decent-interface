import { Box, Flex, Progress, Text } from '@chakra-ui/react';
import { Check } from '@decent-org/fractal-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  value: number;
  children?: ReactNode;
  max?: number;
  unit?: string;
  showValueWithinProgressBar?: boolean;
}
export default function ProgressBar({
  value,
  children,
  max = 100,
  unit = '%',
  showValueWithinProgressBar = true,
}: ProgressBarProps) {
  return (
    <Box width="full">
      {((showValueWithinProgressBar && value > 0) || children) && (
        <Flex
          justifyContent="space-between"
          alignItems="center"
        >
          {children}
          {showValueWithinProgressBar && value > 0 && (
            <Text
              display="inline-flex"
              alignItems="center"
              height="100%"
              right="0"
            >
              {Math.min(value, 100)}
              {unit}
            </Text>
          )}
        </Flex>
      )}
      <Progress
        value={max !== 100 ? value : Math.min(value, 100)}
        max={max}
        maxWidth="100%"
      />
    </Box>
  );
}

interface QuorumProgressBarProps {
  helperText?: string;
  unit?: string;
  reachedQuorum: string;
  totalQuorum?: string;
}

export function QuorumProgressBar({
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
          alignItems="center"
        >
          <Text textStyle="text-base-sans-regular">{t('quorum', { ns: 'common' })}</Text>
          <Text textStyle="text-base-sans-regular">
            {parseInt(reachedQuorum) >= parseInt(totalQuorum) && (
              <Check
                color="green.500"
                mr={2}
              />
            )}
            {reachedQuorum}/{totalQuorum}
          </Text>
        </Flex>
      )}
      <ProgressBar
        value={parseInt(reachedQuorum)}
        max={totalQuorum ? parseInt(totalQuorum) : undefined}
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
