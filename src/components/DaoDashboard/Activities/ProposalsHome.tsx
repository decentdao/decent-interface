import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useCanUserCreateProposal } from '../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import {
  AzoriusGovernance,
  DecentGovernance,
  FractalProposal,
  FractalProposalState,
  GovernanceType,
  SortBy,
} from '../../../types';
import ProposalCard from '../../Proposals/ProposalCard/ProposalCard';
import NoDataCard from '../../ui/containers/NoDataCard';
import { InfoBoxLoader } from '../../ui/loaders/InfoBoxLoader';
import { ModalType } from '../../ui/modals/ModalProvider';
import { useDecentModal } from '../../ui/modals/useDecentModal';
import { Sort } from '../../ui/utils/Sort';
import { ActivityFreeze } from './ActivityFreeze';
import useProposalsSortedAndFiltered from '../../../hooks/DAO/proposal/useProposals';
import { useTranslation } from 'react-i18next';
import { ProposalsList } from '../../Proposals/ProposalsList';

export function ProposalsHome() {
  const {
    guardContracts: { freezeVotingContractAddress },
    guard,
    governance: { type, loadingProposals, allProposalsLoaded },
  } = useFractal();
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);
  const [filters, setFilters] = useState<FractalProposalState[]>([]);

  const { proposals, getProposalsTotal } = useProposalsSortedAndFiltered({ sortBy, filters });

  const { governance, guardContracts } = useFractal();
  const { safe } = useDaoInfoStore();

  const { addressPrefix } = useNetworkConfig();
  const azoriusGovernance = governance as AzoriusGovernance;
  const delegate = useDecentModal(ModalType.DELEGATE);
  const wrapTokenOpen = useDecentModal(ModalType.WRAP_TOKEN);

  const canDelegate = useMemo(() => {
    if (azoriusGovernance.type === GovernanceType.AZORIUS_ERC20) {
      const decentGovernance = azoriusGovernance as DecentGovernance;

      const lockedTokenBalance = decentGovernance?.lockedVotesToken?.balance;
      const hasLockedTokenBalance = lockedTokenBalance ? lockedTokenBalance > 0n : undefined;

      const votesTokenBalance = azoriusGovernance?.votesToken?.balance;
      const hasVotesTokenBalance = votesTokenBalance ? votesTokenBalance > 0n : undefined;
      return hasVotesTokenBalance || hasLockedTokenBalance;
    }
    return false;
  }, [azoriusGovernance]);
  const { canUserCreateProposal } = useCanUserCreateProposal();

  const FILTERS_AZORIUS = [
    FractalProposalState.ACTIVE,
    FractalProposalState.TIMELOCKED,
    FractalProposalState.EXECUTABLE,
    FractalProposalState.EXECUTED,

    FractalProposalState.FAILED,
    FractalProposalState.EXPIRED,
  ];

  const FILTERS_MULTISIG_BASE = [
    FractalProposalState.ACTIVE,
    FractalProposalState.EXECUTABLE,
    FractalProposalState.EXECUTED,

    FractalProposalState.REJECTED,
  ];

  const FILTERS_MULTISIG_CHILD = [
    FractalProposalState.ACTIVE,
    FractalProposalState.TIMELOCKABLE,
    FractalProposalState.TIMELOCKED,
    FractalProposalState.EXECUTABLE,
    FractalProposalState.EXECUTED,

    FractalProposalState.REJECTED,
    FractalProposalState.EXPIRED,
  ];

  const FILTERS_SNAPSHOT = [FractalProposalState.CLOSED, FractalProposalState.PENDING];

  const { daoSnapshotENS } = useDaoInfoStore();
  const [allOptions, setAllFilterOptions] = useState<FractalProposalState[]>([]);

  const { t } = useTranslation(['proposal', 'common']);

  // Update filter options
  useEffect(() => {
    if (!type) return;

    let filterOptions;
    switch (type) {
      case GovernanceType.AZORIUS_ERC20:
      case GovernanceType.AZORIUS_ERC721:
        filterOptions = FILTERS_AZORIUS;
        break;
      case GovernanceType.MULTISIG:
      default:
        if (guardContracts.freezeGuardContractAddress) {
          filterOptions = FILTERS_MULTISIG_CHILD;
        } else {
          filterOptions = FILTERS_MULTISIG_BASE;
        }
        break;
    }

    if (daoSnapshotENS) {
      filterOptions = [...filterOptions, ...FILTERS_SNAPSHOT];
    }
    setAllFilterOptions(filterOptions);
    setFilters(filterOptions);
  }, [daoSnapshotENS, guardContracts.freezeGuardContractAddress, type]);

  const toggleFilter = (filter: FractalProposalState) => {
    setFilters(prevState => {
      if (prevState.includes(filter)) {
        return prevState.filter(state => state !== filter);
      } else {
        return [...prevState, filter];
      }
    });
  };

  const options = allOptions.map(state => ({
    optionKey: state,
    count: getProposalsTotal(state),
    onClick: () => toggleFilter(state),
    isSelected: filters.includes(state),
  }));

  const filterTitle =
    filters.length === 1
      ? t(filters[0])
      : filters.length === allOptions.length
        ? t('filterProposalsAllSelected')
        : filters.length === 0 // No filters selected means no filtering applied
          ? t('filterProposalsNoneSelected')
          : t('filterProposalsNSelected', { count: filters.length });

  return (
    <Box>
      {/* SORT AND FILTER BUTTONS */}
      <Flex
        justifyContent="flex-start"
        alignItems="center"
        mx="0.5rem"
        my="1rem"
      >
        <Sort
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </Flex>

      <Flex
        flexDirection="column"
        gap="1rem"
      >
        {/* FREEZE ACTIVITY CARD */}
        {freezeVotingContractAddress &&
          guard.freezeProposalVoteCount !== null &&
          guard.freezeProposalVoteCount > 0n && <ActivityFreeze />}

        {/* PROPOSAL LIST */}
        <ProposalsList proposals={proposals} />
      </Flex>
    </Box>
  );
}
