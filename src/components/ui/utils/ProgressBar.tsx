import { Box, Flex, Progress, Text, Icon } from '@chakra-ui/react';
import { Check } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  value: number;
  customValueComponent?: ReactNode;
  max?: number;
  unit?: string;
  label: string;
  labelWidth?: string;
  bg?: string;
}
export default function ProgressBar({
  value,
  customValueComponent,
  max = 100,
  unit = '%',
  label,
  labelWidth,
  bg,
}: ProgressBarProps) {
  return (
    <Box
      width="full"
      position="relative"
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        position="absolute"
        zIndex={2}
        top={0}
        width={labelWidth ? labelWidth : value > 16 ? `${Math.min(value, 100)}%` : '20%'}
        px="1rem"
        py="2px"
        height="24px"
      >
        <Text textStyle="label-small">{label}</Text>
        {customValueComponent ? (
          <>{customValueComponent}</>
        ) : (
          <Text
            textStyle="label-small"
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
      <Progress
        value={max !== 100 ? value : Math.min(value, 100)}
        max={max}
        maxWidth="100%"
        bg={bg}
      />
    </Box>
  );
}

interface QuorumProgressBarProps {
  helperText?: string;
  unit?: string;
  reachedQuorum: number;
  totalQuorum?: number;
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
      <ProgressBar
        value={reachedQuorum}
        max={totalQuorum}
        unit={unit}
        label={t('quorum', { ns: 'common' })}
        bg="neutral-4"
        labelWidth="100%"
        customValueComponent={
          totalQuorum ? (
            <Text textStyle="label-small">
              {reachedQuorum >= totalQuorum && (
                <Icon
                  color="lilac-0"
                  mr={2}
                  as={Check}
                />
              )}
              {reachedQuorum} / {totalQuorum}
            </Text>
          ) : undefined
        }
      />
      {helperText && (
        <Text
          textStyle="body-base"
          color="neutral-7"
          marginTop={3}
        >
          {helperText}
        </Text>
      )}
    </Flex>
  );
}
