import { Box, Flex, Text } from '@chakra-ui/react';
import { Govern } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { AzoriusGovernance, StrategyType } from '../../../../types';
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

  const governanceAzorius =
    governance.type === StrategyType.GNOSIS_SAFE_USUL
      ? (governance as AzoriusGovernance)
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
        <Text
          textStyle="text-sm-sans-regular"
          color="grayscale.100"
        >
          {t('titleGovernance')}
        </Text>
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
      >
        <Text
          textStyle="text-base-sans-regular"
          color="chocolate.200"
        >
          {t('titleType')}
        </Text>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {governance.type ? t(governance.type.toString(), { ns: 'daoCreate' }) : ''}
        </Text>
      </Flex>

      {governanceAzorius?.votesStrategy?.votingPeriod && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('titleVotingPeriod')}
          </Text>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {governanceAzorius.votesStrategy.votingPeriod.formatted}
          </Text>
        </Flex>
      )}
      {governanceAzorius?.votesStrategy?.quorumPercentage && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('titleQuorum')}
          </Text>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {governanceAzorius.votesStrategy.quorumPercentage.formatted}
          </Text>
        </Flex>
      )}
    </Box>
  );
}
