import { Box, Flex, Text } from '@chakra-ui/react';
import { Scroll } from '@phosphor-icons/react';
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

const nonSnapshotProposals = (proposals: FractalProposal[]) => {
  return proposals.filter(proposal => !isSnapshotProposal(proposal));
};

const totalProposals = (proposals: FractalProposal[] | null, type: GovernanceType | undefined) => {
  if (!proposals) {
    return undefined;
  }

  switch (type) {
    case GovernanceType.MULTISIG: {
      return proposals.length;
    }
    case GovernanceType.AZORIUS_ERC20:
    case GovernanceType.AZORIUS_ERC721: {
      const nonSnapshot = nonSnapshotProposals(proposals);
      const highestNonSnapshotProposalId = nonSnapshot.reduce((p, c) => {
        const propId = Number(c.proposalId);
        if (propId > p) {
          return propId;
        }
        return p;
      }, 0);
      const snapshotProposalCount = proposals.length - nonSnapshot.length;
      return highestNonSnapshotProposalId + snapshotProposalCount;
    }
    default: {
      return 0;
    }
  }
};

const isActiveProposal = (proposal: FractalProposal) => {
  return (
    proposal.state === FractalProposalState.ACTIVE ||
    proposal.state === FractalProposalState.EXECUTABLE
  );
};

const filterForActiveProposals = (proposals: FractalProposal[]) => {
  return proposals.filter(proposal => isActiveProposal(proposal));
};

const anyNonActiveProposals = (proposals: FractalProposal[]) => {
  return proposals.filter(proposal => !isActiveProposal(proposal)).length > 0;
};

const activeProposals = (proposals: FractalProposal[] | null, type: GovernanceType | undefined) => {
  if (!proposals) {
    return undefined;
  }

  switch (type) {
    case GovernanceType.MULTISIG: {
      return filterForActiveProposals(proposals).length;
    }
    case GovernanceType.AZORIUS_ERC20:
    case GovernanceType.AZORIUS_ERC721: {
      const nonSnapshot = nonSnapshotProposals(proposals);
      const snapshotProposalCount = proposals.length - nonSnapshot.length;
      const activeNonSnapshotProposals = filterForActiveProposals(nonSnapshot);
      const anyNonActive = anyNonActiveProposals(nonSnapshot);

      console.log({ nonSnapshot, snapshotProposalCount, activeNonSnapshotProposals, anyNonActive });

      const totalNonSnapshotProposalsCount = totalProposals(nonSnapshot, type);

      if (anyNonActive) {
        // If we're here, we've loaded proposals to a point where at least one is not active,
        // which means the chances are pretty darn low that there are any more
        // active proposals after this one. So return a value!
        return activeNonSnapshotProposals.length;
      } else {
        // Getting here means that all of the loaded proposals so far are active.
        if (totalNonSnapshotProposalsCount === activeNonSnapshotProposals.length) {
          // If we're here, then all of the proposals on this Safe are active!
          return activeNonSnapshotProposals.length;
        } else {
          // In here, proposals are still loading and all of them so far are active.
          return undefined;
        }
      }
    }
    default: {
      return 0;
    }
  }
};

export function InfoProposals() {
  const { t } = useTranslation('dashboard');
  const {
    node: { daoAddress },
    governance: { proposals, type },
  } = useFractal();

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

  const totalProposalsValue = totalProposals(proposals, type);
  const totalProposalsDisplay =
    totalProposalsValue === undefined ? '...' : totalProposalsValue.toString();

  const activeProposalsValue = activeProposals(proposals, type);
  const activeProposalsDisplay =
    activeProposalsValue === undefined ? '...' : activeProposalsValue.toString();

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
        <Text>{totalProposalsDisplay}</Text>
      </Flex>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
        gap="0.5rem"
      >
        <Text color="neutral-7">{t('titlePending')}</Text>
        <Text>{activeProposalsDisplay}</Text>
      </Flex>
    </Box>
  );
}
