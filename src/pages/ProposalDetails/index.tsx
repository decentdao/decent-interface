import { Text, Flex, Box, Grid, GridItem } from '@chakra-ui/react';
import { Button } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import CastVote from '../../components/Proposals/CastVote';
import ProposalVotes from '../../components/Proposals/ProposalVotes';
import ContentBox from '../../components/ui/ContentBox';
import StatusBox from '../../components/ui/StatusBox';
import ProposalCreatedBy from '../../components/ui/proposal/ProposalCreatedBy';
import ProposalTime from '../../components/ui/proposal/ProposalTime';
import ProposalTitle from '../../components/ui/proposal/ProposalTitle';
import LeftArrow from '../../components/ui/svg/LeftArrow';
import useProposals from '../../providers/fractal/hooks/useProposals';
import { Proposal } from '../../providers/fractal/types';
import { DAO_ROUTES } from '../../routes/constants';

function ProposalDetails() {
  const params = useParams();

  const { proposals } = useProposals();
  const [proposal, setProposal] = useState<Proposal>();
  const { t } = useTranslation(['proposal', 'sidebar']);

  useEffect(() => {
    if (proposals === undefined || params.proposalNumber === undefined) {
      setProposal(undefined);
      return;
    }

    const proposalNumber = parseInt(params.proposalNumber);
    const foundProposal = proposals.find(p => p.proposalNumber.toNumber() === proposalNumber);
    if (foundProposal === undefined) {
      setProposal(undefined);
      return;
    }
    setProposal(foundProposal);
  }, [proposals, params.proposalNumber]);

  if (proposal === undefined) {
    return <Text>{t('loadingProposals')}</Text>;
  }

  return (
    <Box mt="3rem">
      <Link to={DAO_ROUTES.proposals.relative(params.address)}>
        <Button
          size="lg"
          variant="text"
        >
          <LeftArrow />
          {t('proposals', { ns: 'sidebar' })}
        </Button>
      </Link>
      <Grid
        gap={4}
        templateColumns="repeat(3, 1fr)"
      >
        <GridItem colSpan={2}>
          <ContentBox>
            <Flex
              alignItems="center"
              flexWrap="wrap"
            >
              <Flex
                gap={4}
                alignItems="center"
              >
                <StatusBox state={proposal.state} />
                {proposal.deadline && <ProposalTime deadline={proposal.deadline} />}
              </Flex>
              <Box
                w="full"
                mt={4}
              >
                <ProposalTitle proposal={proposal} />
              </Box>
            </Flex>
            <Box mt={4}>
              <ProposalCreatedBy proposalProposer={proposal.proposer} />
            </Box>
          </ContentBox>
          <ProposalVotes proposal={proposal} />
        </GridItem>
        <GridItem colSpan={1}>
          <CastVote proposal={proposal} />
        </GridItem>
      </Grid>
    </Box>
  );
}

export default ProposalDetails;
