import { Box, Divider, Flex, Text, Button } from '@chakra-ui/react';
import { ArrowDown } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useProposals from '../../hooks/DAO/proposal/useProposals';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes, TxProposalState } from '../../providers/Fractal/types';
import { SortBy } from '../../types';
import { Sort } from '../ui/Sort';
import { OptionMenu } from '../ui/menus/OptionMenu';
import { ProposalsList } from './ProposalsList';

const FILTERS_USUL_BASE = [
  TxProposalState.Active,
  TxProposalState.TimeLocked,
  TxProposalState.Executing,
  TxProposalState.Executed,

  TxProposalState.Failed,
  TxProposalState.Canceled,
  TxProposalState.Rejected,
  TxProposalState.Module,
];

const FILTERS_USUL_CHILD = [
  TxProposalState.Active,
  TxProposalState.TimeLocked,
  TxProposalState.Executing,
  TxProposalState.Executed,

  TxProposalState.Failed,
  TxProposalState.Expired,
  TxProposalState.Canceled,
  TxProposalState.Rejected,
  TxProposalState.Module,
];

const FILTERS_MULTISIG_BASE = [
  TxProposalState.Active,
  TxProposalState.Executing,
  TxProposalState.Executed,

  TxProposalState.Rejected,
  TxProposalState.Module,
];

const FILTERS_MULTISIG_CHILD = [
  TxProposalState.Active,
  TxProposalState.Queueable,
  TxProposalState.Queued,
  TxProposalState.Executing,
  TxProposalState.Executed,

  TxProposalState.Expired,
  TxProposalState.Rejected,
  TxProposalState.Module,
];

export default function Proposals() {
  const {
    governance: { type, governanceIsLoading },
    gnosis: { guardContracts, isGnosisLoading },
  } = useFractal();

  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);
  const [filters, setFilters] = useState<TxProposalState[]>([]);
  const [allOptions, setAllOptions] = useState<TxProposalState[]>([]);

  const { t } = useTranslation(['proposal', 'common']);
  const { proposals, getProposalsTotal } = useProposals({ sortBy, filters });

  useEffect(() => {
    if (governanceIsLoading || isGnosisLoading) return;

    let options;
    switch (type) {
      case GovernanceTypes.GNOSIS_SAFE_USUL:
        if (guardContracts.vetoGuardContract) {
          options = FILTERS_USUL_CHILD;
        } else {
          options = FILTERS_USUL_BASE;
        }
        break;
      case GovernanceTypes.GNOSIS_SAFE:
      default:
        if (guardContracts.vetoGuardContract) {
          options = FILTERS_MULTISIG_CHILD;
        } else {
          options = FILTERS_MULTISIG_BASE;
        }
        break;
    }
    setAllOptions(options);
    setFilters(options);
  }, [governanceIsLoading, guardContracts.vetoGuardContract, isGnosisLoading, type]);

  const toggleFilter = (filter: TxProposalState) => {
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
