import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { ArrowDown, Button } from '@decent-org/fractal-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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

  const { t } = useTranslation(['proposal', 'common']);
  const { proposals, getProposalsTotal } = useProposals({ sortBy, filters });

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
    count: getProposalsTotal(state),
    onClick: () => toggleFilter(state),
    isSelected: filters.includes(state),
  }));

  const filterTitle =
    filters.length === 1
      ? t(filters[0])
      : filters.length === allStates.length || filters.length === 0 // No filters selected means no filtering applied
      ? t('filterProposalsAllSelected')
      : t('filterProposalsNSelected', { count: filters.length });

  return (
    <Box>
      <Flex gap={6}>
        <OptionMenu
          trigger={
            <Box>
              {filterTitle} <ArrowDown />
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
                <Text
                  color="grayscale.100"
                  fontStyle="text-sm-mono-regular"
                >
                  {t('selectAll', { ns: 'common' })}
                </Text>
              </Button>
              <Button
                variant="text"
                paddingLeft={0}
                paddingRight={0}
                justifyContent="flex-end"
                onClick={() => setFilters([])}
              >
                <Text
                  color="grayscale.100"
                  fontStyle="text-sm-mono-regular"
                >
                  {t('clear', { ns: 'common' })}
                </Text>
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
      {proposals === undefined ? (
        <Box mt={7}>
          <InfoBoxLoader />
        </Box>
      ) : proposals.length > 0 ? (
        proposals.map(proposal => (
          <ProposalCard
            key={proposal.proposalNumber.toNumber()}
            proposal={proposal}
          />
        ))
      ) : (
        <EmptyBox
          emptyText={t('emptyProposals')}
          m="2rem 0 0 0"
        >
          <Link to="new">
            <Button
              variant="text"
              textStyle="text-xl-mono-bold"
            >
              {t('createProposal')}
            </Button>
          </Link>
        </EmptyBox>
      )}
    </Box>
  );
}
