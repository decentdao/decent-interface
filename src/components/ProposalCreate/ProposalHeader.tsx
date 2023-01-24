import { HStack, Text } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomNonceInput } from './CustomNonceInput';

export function ProposalHeader({
  isUsul,
  inputtedMetadata,
  metadataTitle,
  nonce,
  setNonce,
}: {
  isUsul: boolean | undefined;
  inputtedMetadata: boolean;
  metadataTitle: string;
  nonce: number | undefined;
  setNonce: Dispatch<SetStateAction<number | undefined>>;
}) {
  const { t } = useTranslation(['proposal']);

  if (inputtedMetadata && metadataTitle) {
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
          setNonce={setNonce}
        />
      )}
    </HStack>
  );
}
