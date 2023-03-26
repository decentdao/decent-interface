import { Flex, Text, Input, Tooltip } from '@chakra-ui/react';
import { SupportQuestion } from '@decent-org/fractal-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useUsul from '../../../hooks/DAO/proposal/useUsul';
import useDefaultNonce from '../../../hooks/DAO/useDefaultNonce';

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
  const errorMessage =
    (nonce || nonce === 0) && (defaultNonce || defaultNonce === 0) && nonce < defaultNonce
      ? t('customNonceError')
      : undefined;

  useEffect(() => {
    if (defaultNonce !== nonce) {
      onChange(defaultNonce);
    }
  }, [defaultNonce, nonce, onChange]);

  if (!!usulContract) return null;

  return (
    <Flex
      display="inline-flex"
      flexWrap="wrap"
    >
      <Flex
        display="inline-flex"
        alignItems="center"
      >
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
      </Flex>
      <Input
        value={nonce}
        onChange={e => onChange(Number(e.target.value))}
        type="number"
        px="4"
        ml="4"
        width="auto"
        min={defaultNonce || 1}
      />
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
    </Flex>
  );
}
