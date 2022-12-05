import { Text, Flex, Box, Grid, GridItem, Button } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ProposalAction } from '../../components/Proposals/ProposalActions/ProposalAction';
import ProposalSummary from '../../components/Proposals/ProposalSummary';
import ProposalVotes from '../../components/Proposals/ProposalVotes';
import ContentBox from '../../components/ui/ContentBox';
import { EmptyBox } from '../../components/ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../components/ui/loaders/InfoBoxLoader';
import ProposalCreatedBy from '../../components/ui/proposal/ProposalCreatedBy';
import ProposalExecutableCode from '../../components/ui/proposal/ProposalExecutableCode';
import ProposalStateBox from '../../components/ui/proposal/ProposalStateBox';
import ProposalTime from '../../components/ui/proposal/ProposalTime';
import ProposalTitle from '../../components/ui/proposal/ProposalTitle';
import LeftArrow from '../../components/ui/svg/LeftArrow';
import useProposals from '../../providers/Fractal/hooks/useProposals';
import { TxProposal, UsulProposal } from '../../providers/Fractal/types';
import { DAO_ROUTES } from '../../routes/constants';

const MOCK_GOV_TOKEN_TOTAL_SUPPLY = BigNumber.from('3475000000000000000000');
const MOCK_GOV_TOKEN_DECIMALS = 18;
const MOCK_GOV_TOKEN_SYMBOL = 'FRCTL';

function ProposalDetails() {
  const params = useParams();

  const { proposals } = useProposals({});
  const [proposal, setProposal] = useState<TxProposal | UsulProposal | null>();
  const { t } = useTranslation(['proposal', 'sidebar']);

  useEffect(() => {
    if (proposals === undefined || params.proposalNumber === undefined) {
      setProposal(undefined);
      return;
    }

    const foundProposal = proposals.find(p => p.proposalNumber === params.proposalNumber);
    if (foundProposal === undefined) {
      setProposal(null);
      return;
    }
    setProposal(foundProposal);
  }, [proposals, params.proposalNumber]);

  if (proposal === undefined) {
    return <Text>{t('loadingProposals')}</Text>;
  }
  const usulProposal = proposal as UsulProposal;
  return (
    <Box>
      <Link to={DAO_ROUTES.proposals.relative(params.address)}>
        <Button
          paddingLeft={0}
          size="lg"
          variant="text"
        >
          <LeftArrow />
          {t('proposals', { ns: 'sidebar' })}
        </Button>
      </Link>
      {proposal === undefined ? (
        <Box mt={7}>
          <InfoBoxLoader />
        </Box>
      ) : proposal === null ? (
        <EmptyBox
          emptyText={t('noProposal')}
          m="2rem 0 0 0"
        />
      ) : (
        <Grid
          gap={4}
          templateColumns="repeat(3, 1fr)"
        >
          <GridItem colSpan={2}>
            {usulProposal.govTokenAddress && (
              <>
                <ContentBox bg="black.900-semi-transparent">
                  <Flex
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Flex
                      gap={4}
                      alignItems="center"
                    >
                      <ProposalStateBox state={proposal.state} />
                      <ProposalTime deadline={usulProposal.deadline} />
                    </Flex>
                    <Box
                      w="full"
                      mt={4}
                    >
                      <ProposalTitle proposal={proposal} />
                      <ProposalExecutableCode proposal={proposal} />
                    </Box>
                  </Flex>
                  <Box mt={4}>
                    <ProposalCreatedBy proposalProposer={usulProposal.proposer} />
                  </Box>
                </ContentBox>
                <ProposalVotes
                  proposal={usulProposal}
                  govTokenDecimals={MOCK_GOV_TOKEN_DECIMALS}
                  govTokenSymbol={MOCK_GOV_TOKEN_SYMBOL}
                  govTokenTotalSupply={MOCK_GOV_TOKEN_TOTAL_SUPPLY}
                />
              </>
            )}
          </GridItem>
          {usulProposal.govTokenAddress && (
            <GridItem colSpan={1}>
              <ProposalSummary
                proposal={usulProposal}
                govTokenTotalSupply={MOCK_GOV_TOKEN_TOTAL_SUPPLY}
              />
              <ProposalAction
                proposal={proposal}
                expandedView
              />
            </GridItem>
          )}
        </Grid>
      )}
    </Box>
  );
}

export default ProposalDetails;
