import { Box, Button as ChakraButton, Divider, Flex, Text } from '@chakra-ui/react';
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
    onClick: () => toggleFilter(state),
    isSelected: filters.includes(state),
  }));

  const { t } = useTranslation(['proposal', 'common']);
  const { proposals } = useProposals({ sortBy, filters });

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
          closeOnSelect={false}
          buttonAs={ChakraButton} // Using "raw" Chakra Button here cause our own will not accept additional props passed via buttonProps
          buttonProps={{
            variant: 'outline',
            border: '1px solid',
            borderColor: 'gold.500',
            color: 'gold.500',
            disabled: !proposals,
          }}
          showOptionSelected
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
              {t('createFirstProposal')}
            </Button>
          </Link>
        </EmptyBox>
      )}
    </Box>
  );
}
