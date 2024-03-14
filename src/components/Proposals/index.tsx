import { Box, Divider, Flex, Text, Button } from '@chakra-ui/react';
import { ArrowDown } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useProposals from '../../hooks/DAO/proposal/useProposals';
import { useFractal } from '../../providers/App/AppProvider';
import { SortBy, GovernanceType, FractalProposalState } from '../../types';
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
    node: { daoSnapshotURL },
    governance: { type },
    guardContracts,
  } = useFractal();

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
        if (guardContracts.freezeGuardContract) {
          options = FILTERS_MULTISIG_CHILD;
        } else {
          options = FILTERS_MULTISIG_BASE;
        }
        break;
    }
    if (daoSnapshotURL) {
      options = [...options, ...FILTERS_SNAPSHOT];
    }
    setAllOptions(options);
    setFilters(options);
  }, [daoSnapshotURL, guardContracts.freezeGuardContract, type]);

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
        gap={6}
        mb="1.5rem"
      >
        <OptionMenu
          trigger={
            <Box>
              {filterTitle} <ArrowDown boxSize="1.5rem" />
            </Box>
          }
          options={options}
          namespace="proposal"
          titleKey="filter"
          buttonAs={Button}
          buttonProps={{
            variant: 'tertiary',
            disabled: !proposals,
          }}
          closeOnSelect={false}
          showOptionSelected
          showOptionCount
        >
          <Box>
            <Flex justifyContent="space-between">
              <Button
                variant="text"
                paddingLeft={0}
                paddingRight={0}
                justifyContent="flex-start"
                onClick={() => setFilters(allOptions)}
              >
                <Text color="grayscale.100">{t('selectAll', { ns: 'common' })}</Text>
              </Button>
              <Button
                variant="text"
                paddingLeft={0}
                paddingRight={0}
                justifyContent="flex-end"
                onClick={() => setFilters([])}
              >
                <Text color="grayscale.100">{t('clear', { ns: 'common' })}</Text>
              </Button>
            </Flex>
            <Divider
              color="chocolate.700"
              my={4}
            />
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
