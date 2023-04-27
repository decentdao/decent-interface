import { Flex, Text, Input, Tooltip, HStack, VStack, Portal } from '@chakra-ui/react';
import { SupportQuestion } from '@decent-org/fractal-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { StrategyType } from '../../../types';

export function CustomNonceInput({
  nonce,
  onChange,
  defaultNonce,
}: {
  nonce: number | undefined;
  defaultNonce: number | undefined;
  onChange: (nonce?: number) => void;
}) {
  const { governance } = useFractal();
  const { t } = useTranslation(['proposal']);
  const errorMessage =
    nonce && defaultNonce && nonce < defaultNonce ? t('customNonceError') : undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  if (governance.type === StrategyType.GNOSIS_SAFE_AZORIUS) return null;

  return (
    <VStack alignItems="start">
      <HStack>
        <Flex ref={containerRef}>
          <Text
            textStyle="text-md-mono-regular"
            whiteSpace="nowrap"
            mt="1"
          >
            {t('customNonce', { ns: 'proposal' })}
          </Text>
          <Portal containerRef={containerRef}>
            <Tooltip
              label={t('customNonceTooltip', { ns: 'proposal' })}
              maxW="18rem"
              placement="top"
            >
              <SupportQuestion
                boxSize="1.5rem"
                minWidth="auto"
                mx="2"
                mt="1"
              />
            </Tooltip>
          </Portal>
        </Flex>
        <Input
          value={nonce}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
          type="number"
          width="6rem"
        />
      </HStack>
      {errorMessage && (
        <Flex
          width="100%"
          mt={2}
        >
          <Text
            color="alert-red.normal"
            textStyle="text-md-sans-regular"
          >
            {errorMessage}
          </Text>
        </Flex>
      )}
    </VStack>
  );
}
