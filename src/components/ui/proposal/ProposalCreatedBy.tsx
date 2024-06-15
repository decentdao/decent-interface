import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DisplayAddress } from '../links/DisplayAddress';

function ProposalCreatedBy({ proposer }: { proposer: string }) {
  const { t } = useTranslation('proposal');
  return (
    <Box
      width="100%"
      mt={4}
    >
      <Text
        color="neutral-7"
        w="full"
      >
        {t('proposedBy')}
      </Text>
      <DisplayAddress
        address={proposer}
        pl={0}
        isTextLink
      />
    </Box>
  );
}

export default ProposalCreatedBy;
