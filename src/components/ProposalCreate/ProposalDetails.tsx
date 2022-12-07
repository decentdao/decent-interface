import { Box, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { GovernanceTypes } from '../../providers/Fractal/governance/types';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { BarLoader } from '../ui/loaders/BarLoader';

export function ProposalDetails() {
  const {
    gnosis: { safe, isGnosisLoading },
    governance: { type, governanceToken, governanceIsLoading },
  } = useFractal();

  const { t } = useTranslation(['proposal']);
  return (
    <Box
      rounded="lg"
      p={4}
      bg="black.900-semi-transparent"
    >
      {governanceIsLoading || isGnosisLoading ? (
        <Flex
          h="149px"
          width="100%"
          alignItems="center"
          justifyContent="center"
        >
          <BarLoader />
        </Flex>
      ) : (
        <VStack
          spacing={3}
          align="left"
        >
          <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
          <Divider color="chocolate.700" />
          {type === GovernanceTypes.GNOSIS_SAFE ? (
            <HStack justifyContent="space-between">
              <Text color="chocolate.200">{t('labelProposalSigners')}</Text>
              <Text>
                {safe.threshold}/{safe.owners?.length}
              </Text>
            </HStack>
          ) : (
            <>
              <HStack justifyContent="space-between">
                <Text color="chocolate.200">{t('labelProposalVotingPeriod')}</Text>
                <Text>{governanceToken?.votingPeriod?.formatted}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="chocolate.200">{t('labelProposalQuorum')}</Text>
                <Text>{governanceToken?.quorum?.formatted}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="chocolate.200">{t('labelProposalExecutionDelay')}</Text>
                <Text>{governanceToken?.timeLockPeriod?.formatted}</Text>
              </HStack>
            </>
          )}
        </VStack>
      )}
    </Box>
  );
}
