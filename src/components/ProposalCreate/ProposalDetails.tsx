import { Box, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../types';
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
      bg={BACKGROUND_SEMI_TRANSPARENT}
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
                <Text>{governanceToken?.quorumPercentage?.formatted}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="chocolate.200">{t('labelProposalTimelock')}</Text>
                <Text>{governanceToken?.timeLockPeriod?.formatted}</Text>
              </HStack>
            </>
          )}
        </VStack>
      )}
    </Box>
  );
}
