import { Box, Flex, Icon, Show, Button } from '@chakra-ui/react';
import { CaretDown, Funnel } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { useProposalsSortedAndFiltered } from '../../../hooks/DAO/proposal/useProposals';
import { useCanUserCreateProposal } from '../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfigStore } from '../../../providers/NetworkConfig/useNetworkConfigStore';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import {
  AzoriusGovernance,
  DecentGovernance,
  FractalProposalState,
  GovernanceType,
  SortBy,
} from '../../../types';
import { ProposalsList } from '../../Proposals/ProposalsList';
import { CreateProposalMenu } from '../../ui/menus/CreateProposalMenu';
import { OptionMenu } from '../../ui/menus/OptionMenu';
import { ModalType } from '../../ui/modals/ModalProvider';
import { useDecentModal } from '../../ui/modals/useDecentModal';
import { Sort } from '../../ui/utils/Sort';
import { ActivityFreeze } from './ActivityFreeze';

export function ProposalsHome() {
  const {
    guardContracts: { freezeVotingContractAddress },
    guard,
    governance: { type },
  } = useFractal();

  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);
  const [filters, setFilters] = useState<FractalProposalState[]>([]);

  const { proposals, getProposalsTotal } = useProposalsSortedAndFiltered({ sortBy, filters });

  const { governance, guardContracts } = useFractal();
  const { safe } = useDaoInfoStore();

  const { addressPrefix } = useNetworkConfigStore();
  const azoriusGovernance = governance as AzoriusGovernance;
  const delegate = useDecentModal(ModalType.DELEGATE);

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

  const { subgraphInfo } = useDaoInfoStore();
  const [allOptions, setAllFilterOptions] = useState<FractalProposalState[]>([]);

  const { t } = useTranslation(['proposal', 'common']);

  // Update filter options
  useEffect(() => {
    if (!type) return;

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

    if (subgraphInfo?.daoSnapshotENS) {
      filterOptions = [...filterOptions, ...FILTERS_SNAPSHOT];
    }
    setAllFilterOptions(filterOptions);
    setFilters(filterOptions);
  }, [subgraphInfo?.daoSnapshotENS, guardContracts.freezeGuardContractAddress, type]);

  const toggleFilter = (filter: FractalProposalState) => {
    setFilters(prevState => {
      if (prevState.includes(filter)) {
        return prevState.filter(state => state !== filter);
      } else {
        return [...prevState, filter];
      }
    });
  };

  const filterOptions = allOptions.map(state => ({
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
      <Flex
        flexDirection="column"
        gap="1rem"
      >
        {/* DELEGATE AND CREATE PROPOSAL BUTTONS (mobile version) */}
        <Show below="md">
          <Flex
            mx="0.5rem"
            gap={3}
          >
            {canDelegate && (
              <Button
                onClick={delegate}
                variant="secondary"
                size="sm"
                w="100%"
              >
                {t('delegate', { ns: 'common' })}
              </Button>
            )}
            {canUserCreateProposal && safe?.address && (
              <Link
                style={{ width: '100%' }}
                to={DAO_ROUTES.proposalNew.relative(addressPrefix, safe.address)}
              >
                <Button
                  size="sm"
                  minW={0}
                  w="100%"
                >
                  {t('createProposal')}
                </Button>
              </Link>
            )}
          </Flex>
        </Show>

        {/* FREEZE ACTIVITY CARD */}
        {freezeVotingContractAddress &&
          guard.freezeProposalVoteCount !== null &&
          guard.freezeProposalVoteCount > 0n && <ActivityFreeze />}

        <Flex
          justifyContent="space-between"
          alignItems="center"
          mx="0.5rem"
        >
          {/* SORT AND FILTER BUTTONS */}
          <Flex gap={3}>
            <OptionMenu
              trigger={
                <Flex
                  alignItems="center"
                  justifyContent="space-between"
                  gap="0.25rem"
                >
                  <Icon as={Funnel} /> {filterTitle} <Icon as={CaretDown} />
                </Flex>
              }
              options={filterOptions}
              namespace="proposal"
              titleKey="filter"
              buttonAs={Button}
              buttonProps={{
                variant: 'tertiary',
                paddingLeft: '0.5rem',
                paddingRight: '0.5rem',
                paddingTop: '0.25rem',
                paddingBottom: '0.25rem',
                disabled: !proposals,
              }}
              closeOnSelect={false}
              showOptionSelected
              showOptionCount
            >
              <Box>
                <Flex
                  px="0.5rem"
                  justifyContent="space-between"
                  gap="1.5rem"
                >
                  <Button
                    variant="tertiary"
                    size="sm"
                    mt="0.5rem"
                    onClick={() => setFilters(allOptions)}
                  >
                    {t('selectAll', { ns: 'common' })}
                  </Button>
                  <Button
                    variant="tertiary"
                    size="sm"
                    mt="0.5rem"
                    onClick={() => setFilters([])}
                  >
                    {t('clear', { ns: 'common' })}
                  </Button>
                </Flex>
              </Box>
            </OptionMenu>

            <Sort
              sortBy={sortBy}
              setSortBy={setSortBy}
              buttonProps={{ disabled: !proposals.length }}
            />
          </Flex>

          {/* DELEGATE AND CREATE PROPOSAL BUTTONS (non-mobile) */}
          <Show above="md">
            <Flex gap={6}>
              {canDelegate && (
                <Button
                  onClick={delegate}
                  variant="secondary"
                  border={0}
                  size="md"
                >
                  {t('delegate', { ns: 'common' })}
                </Button>
              )}
              {canUserCreateProposal && safe?.address && (
                <CreateProposalMenu safeAddress={safe.address} />
              )}
            </Flex>
          </Show>
        </Flex>

        <ProposalsList proposals={proposals} />
      </Flex>
    </Box>
  );
}
