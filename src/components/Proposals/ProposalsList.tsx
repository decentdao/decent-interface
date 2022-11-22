import { Box, Button, Flex } from '@chakra-ui/react';
import { ArrowDown } from '@decent-org/fractal-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useProposals from '../../providers/fractal/hooks/useProposals';
import { ProposalState } from '../../providers/fractal/types';
import { SortBy } from '../../types';
import { OptionMenu } from '../menus/OptionMenu';
import { Sort } from '../ui/Sort';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProposalCard from './ProposalCard';

export default function ProposalsList() {
  const allStates = Object.values(ProposalState);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);
  const [filters, setFilters] = useState<ProposalState[]>(allStates);
  const toggleFilter = (filter: ProposalState) => {
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
    function: () => toggleFilter(state),
    isSelected: filters.includes(state),
  }));

  const { t } = useTranslation(['proposal', 'common']);
  const { proposals } = useProposals({ sortBy });

  if (proposals === undefined) {
    return <InfoBoxLoader />;
  }

  if (proposals.length === 0) {
    return <EmptyBox emptyText={t('emptyProposals')} />;
  }

  return (
    <Box>
      <Flex gap={6}>
        <OptionMenu
          trigger={
            <Box>
              {t('filterProposals')} <ArrowDown />
            </Box>
          }
          options={options}
          namespace="proposal"
          titleKey="filter"
          buttonAs={Button}
          buttonProps={{
            variant: 'outline',
            border: '1px solid',
            borderColor: 'gold.500',
            color: 'gold.500',
          }}
          showOptionSelected
        />
        <Sort
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </Flex>
      {proposals.map(proposal => (
        <ProposalCard
          key={proposal.proposalNumber.toNumber()}
          proposal={proposal}
        />
      ))}
    </Box>
  );
}
