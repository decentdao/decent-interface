import { Box, Flex, Text } from '@chakra-ui/react';
import { Scroll } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import {
  FractalProposal,
  FractalProposalState,
  GovernanceType,
  SnapshotProposal,
} from '../../../../types';
import { BarLoader } from '../../../ui/loaders/BarLoader';

const isSnapshotProposal = (proposal: FractalProposal) => {
  const snapshotProposal = proposal as SnapshotProposal;
  return !!snapshotProposal.snapshotProposalId;
};

export function InfoProposals() {
  const { t } = useTranslation('dashboard');
  const {
    node: { daoAddress },
    governance: { proposals, type },
  } = useFractal();

  const totalProposals = useMemo(() => {
    if (!proposals) {
      return '...';
    }

    switch (type) {
      case GovernanceType.MULTISIG: {
        return proposals.length.toString();
      }
      case GovernanceType.AZORIUS_ERC20:
      case GovernanceType.AZORIUS_ERC721: {
        const nonSnapshotProposals = proposals.filter(proposal => !isSnapshotProposal(proposal));
        const highestNonSnapshotProposalId = nonSnapshotProposals.reduce((p, c) => {
          const propId = Number(c.proposalId);
          if (propId > p) {
            return propId;
          }
          return p;
        }, 0);
        const snapshotProposalCount = proposals.length - nonSnapshotProposals.length;
        return (highestNonSnapshotProposalId + snapshotProposalCount).toString();
      }
      default: {
        return '0';
      }
    }
  }, [proposals, type]);

  if (!daoAddress || !type) {
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

  const active = !proposals
    ? 0
    : proposals.filter(
        proposal =>
          proposal.state === FractalProposalState.ACTIVE ||
          proposal.state === FractalProposalState.EXECUTABLE,
      ).length;

  return (
    <Box data-testid="dashboard-daoProposals">
      <Flex
        alignItems="center"
        gap="0.4rem"
        mb="0.5rem"
      >
        <Scroll size="1.5rem" />
        <Text textStyle="display-lg">{t('titleProposals')}</Text>
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
        gap="0.5rem"
      >
        <Text color="neutral-7">{t('titleTotal')}</Text>
        <Text>{totalProposals}</Text>
      </Flex>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
        gap="0.5rem"
      >
        <Text color="neutral-7">{t('titlePending')}</Text>
        <Text>{active}</Text>
      </Flex>
    </Box>
  );
}
