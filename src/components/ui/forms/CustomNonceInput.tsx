import { Flex, Text, Input, HStack, VStack } from '@chakra-ui/react';
import { Gear } from '@decent-org/fractal-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import SupportTooltip from '../badges/SupportTooltip';

export function CustomNonceInput({
  nonce,
  onChange,
}: {
  nonce: number | undefined;
  onChange: (nonce?: number) => void;
}) {
  const {
    node: { safe },
    readOnly: { dao },
  } = useFractal();
  const { t } = useTranslation(['proposal', 'common']);
  const errorMessage =
    nonce !== undefined && safe && nonce < safe.nonce ? t('customNonceError') : undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  if (dao?.isAzorius) return null;

  return revealed ? (
    <VStack alignItems="start">
      <HStack fontSize="14px">
        <Flex ref={containerRef}>
          <Text
            textStyle="text-md-sans-regular"
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
