import { Box, Flex, Text } from '@chakra-ui/react';
import { Govern } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { AzuriousGovernance, StrategyType } from '../../../../types';
import { BarLoader } from '../../../ui/loaders/BarLoader';

export function InfoGovernance() {
  const { t } = useTranslation(['dashboard', 'daoCreate']);
  const {
    node: { daoAddress },
    governance,
  } = useFractal();

  if (!daoAddress || !governance.type) {
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

  const governanceAzurious =
    governance.type === StrategyType.GNOSIS_SAFE_USUL
      ? (governance as AzuriousGovernance)
      : undefined;

  return (
    <Box
      data-testid="dashboard-daoGovernance"
      textStyle="text-sm-sans-regular"
    >
      <Flex
        alignItems="center"
        gap="0.5rem"
        mb="1rem"
      >
        <Govern />
        <Text color="grayscale.100">{t('titleGovernance')}</Text>
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
      >
        <Text color="chocolate.200">{t('titleType')}</Text>
        <Text color="grayscale.100">
          {governance.type ? t(governance.type.toString(), { ns: 'daoCreate' }) : ''}
        </Text>
      </Flex>

      {governanceAzurious?.votesStrategy?.votingPeriod && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text color="chocolate.200">{t('titleVotingPeriod')}</Text>
          <Text color="grayscale.100">
            {governanceAzurious.votesStrategy.votingPeriod.formatted}
          </Text>
        </Flex>
      )}
      {governanceAzurious?.votesStrategy?.quorumPercentage && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text color="chocolate.200">{t('titleQuorum')}</Text>
          <Text color="grayscale.100">
            {governanceAzurious.votesStrategy.quorumPercentage.formatted}
          </Text>
        </Flex>
      )}
    </Box>
  );
}
