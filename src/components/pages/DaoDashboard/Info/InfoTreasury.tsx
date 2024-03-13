import { Box, Flex, Text } from '@chakra-ui/react';
import { Treasury } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { formatUSD } from '../../../../utils';
import { BarLoader } from '../../../ui/loaders/BarLoader';
import { useFormatCoins } from '../../DAOTreasury/hooks/useFormatCoins';

interface IDAOGovernance {}

export function InfoTreasury({}: IDAOGovernance) {
  const {
    node: { daoAddress },
    treasury: { assetsFungible },
  } = useFractal();

  const { t } = useTranslation('dashboard');
  const { totalFiatValue } = useFormatCoins(assetsFungible);

  if (!daoAddress) {
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
        gap="0.4rem"
        mb="0.5rem"
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
        {formatUSD(totalFiatValue)}
      </Text>
    </Box>
  );
}
