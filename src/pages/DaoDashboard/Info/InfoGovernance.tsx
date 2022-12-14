import { Box, Flex, Text } from '@chakra-ui/react';
import { Govern } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { BarLoader } from '../../../components/ui/loaders/BarLoader';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';

export function InfoGovernance() {
  const { t } = useTranslation('dashboard');
  const {
    gnosis: { safe },
    governance: { type, governanceToken, governanceIsLoading },
  } = useFractal();

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
        <Text color="grayscale.100">{type}</Text>
      </Flex>

      {governanceToken?.votingPeriod && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text color="chocolate.200">{t('titleVotingPeriod')}</Text>
          <Text color="grayscale.100">{governanceToken?.votingPeriod?.formatted}</Text>
        </Flex>
      )}
      {governanceToken?.quorumPercentage && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text color="chocolate.200">{t('titleQuorum')}</Text>
          <Text color="grayscale.100">{governanceToken?.quorumPercentage?.formatted}</Text>
        </Flex>
      )}
    </Box>
  );
}
