import { Box, Button, Flex, Icon } from '@chakra-ui/react';
import { CaretDown, Funnel } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useProposals from '../../hooks/DAO/proposal/useProposals';
import { useFractal } from '../../providers/App/AppProvider';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import { FractalProposalState, GovernanceType, SortBy } from '../../types';
import { OptionMenu } from '../ui/menus/OptionMenu';
import { Sort } from '../ui/utils/Sort';
import { ProposalsList } from './ProposalsList';

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

export default function Proposals() {
  const {
    governance: { type },
    guardContracts,
  } = useFractal();
  const { daoSnapshotENS } = useDaoInfoStore();

  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);
  const [filters, setFilters] = useState<FractalProposalState[]>([]);
  const [allOptions, setAllOptions] = useState<FractalProposalState[]>([]);

  const { t } = useTranslation(['proposal', 'common']);
  const { proposals, getProposalsTotal } = useProposals({ sortBy, filters });

  useEffect(() => {
    if (!type) return;

    let options;
    switch (type) {
      case GovernanceType.AZORIUS_ERC20:
      case GovernanceType.AZORIUS_ERC721:
        options = FILTERS_AZORIUS;
        break;
      case GovernanceType.MULTISIG:
      default:
        if (guardContracts.freezeGuardContractAddress) {
          options = FILTERS_MULTISIG_CHILD;
        } else {
          options = FILTERS_MULTISIG_BASE;
        }
        break;
    }
    if (daoSnapshotENS) {
      options = [...options, ...FILTERS_SNAPSHOT];
    }
    setAllOptions(options);
    setFilters(options);
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
    <>
      <Flex
        gap={3}
        mb="1.5rem"
      >
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
          options={options}
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
          buttonProps={{ disabled: !proposals }}
        />
      </Flex>

      <ProposalsList proposals={proposals} />
    </>
  );
}
