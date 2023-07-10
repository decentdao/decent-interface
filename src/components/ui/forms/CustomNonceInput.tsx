import { Flex, Text, Input, HStack, VStack } from '@chakra-ui/react';
import { Gear } from '@decent-org/fractal-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceSelectionType } from '../../../types';
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
  const { t } = useTranslation(['proposal', 'common']);
  const errorMessage =
    nonce !== undefined && safe && nonce < safe.nonce ? t('customNonceError') : undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  if (
    governance.type === GovernanceSelectionType.AZORIUS_ERC20 ||
    governance.type === GovernanceSelectionType.AZORIUS_ERC721
  )
    return null;

  return revealed ? (
    <VStack alignItems="start">
      <HStack
        fontSize="14px"
        justifyContent="flex-end"
        alignSelf="flex-end"
      >
        <Flex
          ref={containerRef}
          alignItems="center"
          gap={2}
        >
          <Text
            textStyle="text-md-sans-regular"
            whiteSpace="nowrap"
            me="1"
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
            whiteSpace="pre-wrap"
          >
            {errorMessage}
          </Text>
        </Flex>
      )}
    </VStack>
  ) : (
    <HStack
      onClick={() => setRevealed(true)}
      _hover={{ color: 'gold.500-hover' }}
      cursor="pointer"
    >
      <Input
        w="0"
        marginEnd="-2.5rem"
        visibility="hidden"
        opacity="0"
      />
      <Gear />
      <Text>{t('advanced', { ns: 'common' })}</Text>
    </HStack>
  );
}
