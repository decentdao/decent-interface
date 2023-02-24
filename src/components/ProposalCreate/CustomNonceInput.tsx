import { Flex, Text, Input, Tooltip } from '@chakra-ui/react';
import { SupportQuestion } from '@decent-org/fractal-ui';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useDefaultNonce from '../../hooks/DAO/useDefaultNonce';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../providers/Fractal/types';

export function CustomNonceInput({
  nonce,
  setNonce,
}: {
  nonce: number | undefined;
  setNonce: Dispatch<SetStateAction<number | undefined>>;
}) {
  const {
    governance: { type },
  } = useFractal();
  const defaultNonce = useDefaultNonce();
  const { t } = useTranslation(['proposal']);

  useEffect(() => {
    setNonce(defaultNonce);
  }, [defaultNonce, setNonce]);

  if (type !== GovernanceTypes.GNOSIS_SAFE_USUL) return null;

  return (
    <Flex>
      <Text
        textStyle="text-md-mono-regular"
        whiteSpace="nowrap"
        mt="1"
      >
        {t('customNonce', { ns: 'proposal' })}
      </Text>
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
      <Input
        value={nonce}
        onChange={e => setNonce(Number(e.target.value))}
        type="number"
        px="4"
        ml="4"
      />
    </Flex>
  );
}
