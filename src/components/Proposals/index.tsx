import { Box, Divider, Flex, Text, Button } from '@chakra-ui/react';
import { ArrowDown } from '@decent-org/fractal-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useProposals from '../../hooks/DAO/proposal/useProposals';
import { TxProposalState } from '../../providers/Fractal/types';
import { SortBy } from '../../types';
import { Sort } from '../ui/Sort';
import { OptionMenu } from '../ui/menus/OptionMenu';
import { ProposalsList } from './ProposalsList';

export default function Proposals() {
  const allStates = Object.values(TxProposalState);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);
  const [filters, setFilters] = useState<TxProposalState[]>(allStates);

  const { t } = useTranslation(['proposal', 'common']);
  const { proposals, getProposalsTotal } = useProposals({ sortBy, filters });

  const toggleFilter = (filter: TxProposalState) => {
    setFilters(prevState => {
      if (prevState.includes(filter)) {
        return prevState.filter(state => state !== filter);
      } else {
        return [...prevState, filter];
      }
    });
  };

  const options = allStates.map(state => ({
    optionKey: state,
    count: getProposalsTotal(state),
    onClick: () => toggleFilter(state),
    isSelected: filters.includes(state),
  }));

  const filterTitle =
    filters.length === 1
      ? t(filters[0])
      : filters.length === allStates.length
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
                onClick={() => setFilters(allStates)}
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
