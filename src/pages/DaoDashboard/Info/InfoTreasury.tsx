import { Box, Flex, Text } from '@chakra-ui/react';
import { Treasury } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useTreasuryTotalUSD } from '../../Treasury/hooks/useTreasuryTotalUSD';

interface IDAOGovernance {}

export function InfoTreasury({}: IDAOGovernance) {
  const { t } = useTranslation('dashboard');

  return (
    <Box data-testid="dashboard-daoProposals">
      <Flex
        alignItems="center"
        gap="0.5rem"
        mb="1rem"
      >
        <Treasury />
        <Text
          textStyle="text-sm-sans-regular"
          color="grayscale.100"
        >
          {t('titleTreasury')}
        </Text>
      </Flex>

      <Text
        textStyle="text-lg-mono-semibold"
        color="grayscale.100"
      >
        {useTreasuryTotalUSD()}
      </Text>
    </Box>
  );
}
