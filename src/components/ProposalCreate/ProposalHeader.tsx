import { HStack, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useDefaultNonce from '../../hooks/DAO/useDefaultNonce';
import { CustomNonceInput } from '../ui/forms/CustomNonceInput';

export function ProposalHeader({
  isUsul,
  metadataTitle,
  nonce,
  setNonce,
}: {
  isUsul?: boolean;
  metadataTitle?: string;
  nonce: number;
  setNonce: (nonce?: number) => void;
}) {
  const { t } = useTranslation(['proposal']);
  const defaultNonce = useDefaultNonce();
  useEffect(() => {
    if (defaultNonce && nonce === undefined) {
      setNonce(defaultNonce);
    }
  }, [defaultNonce, nonce, setNonce]);

  return (
    <HStack justifyContent="space-between">
      <Text
        textStyle="text-xl-mono-medium"
        mb={4}
      >
        {metadataTitle ? metadataTitle : t('proposal', { ns: 'proposal' })}
      </Text>
      {!isUsul && (
        <CustomNonceInput
          nonce={nonce}
          onChange={setNonce}
          defaultNonce={defaultNonce}
        />
      )}
    </HStack>
  );
}
