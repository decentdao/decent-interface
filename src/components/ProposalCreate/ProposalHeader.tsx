import { Grid, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CustomNonceInput } from '../ui/forms/CustomNonceInput';

export function ProposalHeader({
  isAzorius,
  metadataTitle,
  nonce,
  setNonce,
  defaultNonce,
}: {
  isAzorius?: boolean;
  metadataTitle?: string;
  nonce: number;
  setNonce: (nonce?: number) => void;
  defaultNonce: number | undefined;
}) {
  const { t } = useTranslation(['proposal']);

  return (
    <Grid
      gridTemplateColumns="repeat(2, 1fr)"
      w="full"
    >
      <Text
        textStyle="text-xl-mono-medium"
        mb={4}
      >
        {metadataTitle ? metadataTitle : t('proposal', { ns: 'proposal' })}
      </Text>
      {!isAzorius && (
        <CustomNonceInput
          nonce={nonce}
          onChange={setNonce}
          defaultNonce={defaultNonce}
        />
      )}
    </Grid>
  );
}
