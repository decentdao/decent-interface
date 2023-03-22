import { HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CustomNonceInput } from '../ui/forms/CustomNonceInput';

export function ProposalHeader({
  isUsul,
  metadataTitle,
  nonce,
  setNonce,
}: {
  isUsul?: boolean;
  metadataTitle?: string;
  nonce?: number;
  setNonce: (nonce?: number) => void;
}) {
  const { t } = useTranslation(['proposal']);

  if (!!metadataTitle) {
    return (
      <Text
        textStyle="text-xl-mono-medium"
        mb={4}
      >
        {metadataTitle}
      </Text>
    );
  }

  return (
    <HStack justifyContent="space-between">
      <Text
        textStyle="text-xl-mono-medium"
        mb={4}
      >
        {t('proposal', { ns: 'proposal' })}
      </Text>
      {!isUsul && (
        <CustomNonceInput
          nonce={nonce}
          onChange={setNonce}
        />
      )}
    </HStack>
  );
}
