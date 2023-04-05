import { Box, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { useFractal } from '../../providers/App/AppProvider';
import { AzoriusGovernance, StrategyType } from '../../types';
import { BarLoader } from '../ui/loaders/BarLoader';

export function ProposalDetails() {
  const {
    node: { daoAddress, safe },
    governance,
  } = useFractal();
  const { type } = governance;
  const azoriusGovernance = governance as AzoriusGovernance;
  const { t } = useTranslation(['proposal']);
  return (
    <Box
      rounded="lg"
      p={4}
      bg={BACKGROUND_SEMI_TRANSPARENT}
    >
      {!type || !daoAddress || !safe ? (
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
          {type === StrategyType.GNOSIS_SAFE ? (
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
                <Text>{azoriusGovernance.votesStrategy.votingPeriod?.formatted}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="chocolate.200">{t('labelProposalQuorum')}</Text>
                <Text>{azoriusGovernance.votesStrategy?.quorumPercentage?.formatted}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="chocolate.200">{t('labelProposalTimelock')}</Text>
                <Text>{azoriusGovernance.votesStrategy?.timeLockPeriod?.formatted}</Text>
              </HStack>
            </>
          )}
        </VStack>
      )}
    </Box>
  );
}
