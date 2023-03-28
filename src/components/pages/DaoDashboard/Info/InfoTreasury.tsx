import { Box, Flex, Text } from '@chakra-ui/react';
import { Treasury } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { BarLoader } from '../../../ui/loaders/BarLoader';
import { useTreasuryTotalUSD } from '../../DAOTreasury/hooks/useTreasuryTotalUSD';

interface IDAOGovernance {}

export function InfoTreasury({}: IDAOGovernance) {
  const { t } = useTranslation('dashboard');
  const totalUSD = useTreasuryTotalUSD();

  const {
    node: { safe },
  } = useFractal();

  if (!safe?.address) {
    return (
      <Flex
        h="8.5rem"
        width="100%"
        alignItems="center"
        justifyContent="center"
      >
        <BarLoader />
      </Flex>
    );
  }

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
        {totalUSD}
      </Text>
    </Box>
  );
}
