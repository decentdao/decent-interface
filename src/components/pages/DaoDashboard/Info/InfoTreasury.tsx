import { Box, Flex, Text } from '@chakra-ui/react';
import { Coins } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { formatUSD } from '../../../../utils';
import { BarLoader } from '../../../ui/loaders/BarLoader';

interface IDAOGovernance {}

export function InfoTreasury({}: IDAOGovernance) {
  const {
    node: { daoAddress },
    treasury: { assetsFungible },
  } = useFractal();

  const { t } = useTranslation('dashboard');
  const totalFiatValue = useMemo(
    () => assetsFungible.reduce((prev, curr) => prev + curr.usdValue, 0),
    [assetsFungible],
  );

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
        <Coins size="1.5rem" />
        <Text textStyle="display-lg">{t('titleTreasury')}</Text>
      </Flex>

      <Text>{formatUSD(totalFiatValue)}</Text>
    </Box>
  );
}
