import { HStack, Spacer, Text, Tooltip } from '@chakra-ui/react';
import { Alert } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { TOOLTIP_MAXW } from '../../constants/common';
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
  const { t } = useTranslation('proposal');

  return (
    <HStack mb={4}>
      <Text
        textStyle="text-xl-mono-medium"
        marginEnd="0.5rem"
      >
        {metadataTitle ? metadataTitle : t('proposal')}
      </Text>
      {!isAzorius && (
        <Tooltip
          label={t('multisigMetadataWarning')}
          maxW={TOOLTIP_MAXW}
          placement="top"
        >
          <Alert
            w="1.75rem"
            h="1.75rem"
          />
        </Tooltip>
      )}
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
