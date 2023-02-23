import { Flex, Text, Input, Tooltip } from '@chakra-ui/react';
import { SupportQuestion } from '@decent-org/fractal-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useUsul from '../../hooks/DAO/proposal/useUsul';
import useDefaultNonce from '../../hooks/DAO/useDefaultNonce';

export function CustomNonceInput({
  nonce,
  onChange,
}: {
  nonce: number | undefined;
  onChange: (nonce?: number) => void;
}) {
  const { usulContract } = useUsul();
  const defaultNonce = useDefaultNonce();
  const { t } = useTranslation(['proposal']);

  useEffect(() => {
    onChange(defaultNonce);
  }, [defaultNonce, onChange]);

  if (!!usulContract) return null;

  return (
    <Flex display="inline-flex">
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
        onChange={e => onChange(Number(e.target.value))}
        type="number"
        px="4"
        ml="4"
      />
    </Flex>
  );
}
