import { Box, Flex, Text } from '@chakra-ui/react';
import { Govern } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { BarLoader } from '../../../components/ui/loaders/BarLoader';
import { useTimeHelpers } from '../../../hooks/utils/useTimeHelpers';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';

export function InfoGovernance() {
  const { t } = useTranslation('dashboard');
  const {
    gnosis: { safe },
    governance: { type, governanceToken, governanceIsLoading },
  } = useFractal();

  const { getTimeDuration } = useTimeHelpers();

  if (!safe.address || governanceIsLoading) {
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

  const votingPeriod = getTimeDuration(Number(governanceToken?.votingPeriod));
  const quorum = governanceToken?.quorum ? `${Number(governanceToken.quorum) * 100}%` : null;

  return (
    <Box data-testid="dashboard-daoGovernance">
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
          {type}
        </Text>
      </Flex>

      {votingPeriod && (
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
            {votingPeriod}
          </Text>
        </Flex>
      )}
      {quorum && (
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
            {quorum}
          </Text>
        </Flex>
      )}
    </Box>
  );
}
