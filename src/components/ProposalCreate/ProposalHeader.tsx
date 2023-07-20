import { HStack, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CustomNonceInput } from '../ui/forms/CustomNonceInput';

export function ProposalHeader({
  isAzorius,
  metadataTitle,
  nonce,
  setNonce,
}: {
  isAzorius?: boolean;
  metadataTitle?: string;
  nonce?: number;
  setNonce: (nonce?: number) => void;
}) {
  const { t } = useTranslation(['proposal']);

  return (
    <HStack mb={4}>
      <Text textStyle="text-xl-mono-medium">
        {metadataTitle ? metadataTitle : t('proposal', { ns: 'proposal' })}
      </Text>
      <Spacer />
      {!isAzorius && (
        <CustomNonceInput
          nonce={nonce}
          onChange={setNonce}
        />
      )}
    </HStack>
  );
}
