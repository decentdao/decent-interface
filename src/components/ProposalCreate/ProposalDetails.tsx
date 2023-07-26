import { Box, Divider, Flex, HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { useFractal } from '../../providers/App/AppProvider';
import { AzoriusGovernance, GovernanceSelectionType } from '../../types';
import ContentBoxTitle from '../ui/containers/ContentBox/ContentBoxTitle';
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
        <Box>
          <ContentBoxTitle>{t('proposalSummaryTitle')}</ContentBoxTitle>
          <Divider
            color="chocolate.700"
            mt="1rem"
            mb="1rem"
          />
          {type === GovernanceSelectionType.MULTISIG ? (
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
                <Text>{azoriusGovernance.votingStrategy?.votingPeriod?.formatted}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="chocolate.200">{t('labelProposalQuorum')}</Text>
                <Text>
                  {azoriusGovernance.votingStrategy?.quorumPercentage?.formatted ||
                    azoriusGovernance.votingStrategy?.quorumThreshold?.formatted}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="chocolate.200">{t('labelProposalTimelock')}</Text>
                <Text>{azoriusGovernance.votingStrategy?.timeLockPeriod?.formatted}</Text>
              </HStack>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
