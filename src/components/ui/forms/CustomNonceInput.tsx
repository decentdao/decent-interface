import { Flex, Text, Input, HStack, VStack } from '@chakra-ui/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceModuleType } from '../../../types';
import SupportTooltip from '../badges/SupportTooltip';

export function CustomNonceInput({
  nonce,
  onChange,
}: {
  nonce: number | undefined;
  onChange: (nonce?: number) => void;
}) {
  const {
    governance,
    node: { safe },
  } = useFractal();
  const { t } = useTranslation(['proposal']);
  const errorMessage = nonce && safe && nonce < safe.nonce ? t('customNonceError') : undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  if (governance.type === GovernanceModuleType.AZORIUS) return null;

  return (
    <VStack alignItems="start">
      <HStack fontSize="14px">
        <Flex
          ref={containerRef}
          alignItems="center"
          gap={2}
        >
          <Text
            textStyle="text-md-sans-regular"
            whiteSpace="nowrap"
            mt="1"
          >
            {t('customNonce', { ns: 'proposal' })}
          </Text>
          <SupportTooltip
            containerRef={containerRef}
            label={t('customNonceTooltip', { ns: 'proposal' })}
            mx="2"
            mt="1"
          />
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
          fontSize="14px"
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
