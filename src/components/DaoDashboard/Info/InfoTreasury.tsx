import { Box, Flex, Text } from '@chakra-ui/react';
import { Coins } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import { formatUSD } from '../../../utils';
import { BarLoader } from '../../ui/loaders/BarLoader';

export function InfoTreasury() {
  const {
    treasury: { totalUsdValue },
  } = useFractal();
  const { safe } = useDaoInfoStore();

  const { t } = useTranslation('dashboard');

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
        gap="0.4rem"
        mb="0.5rem"
      >
        <Coins size="1.5rem" />
        <Text textStyle="display-lg">{t('titleTreasury')}</Text>
      </Flex>

      <Text>{formatUSD(totalUsdValue)}</Text>
    </Box>
  );
}
