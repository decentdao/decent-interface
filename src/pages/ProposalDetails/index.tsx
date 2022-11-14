import { Text, Flex, Box } from '@chakra-ui/react';
import { Button } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import CastVote from '../../components/Proposals/CastVote';
import ProposalCardDetailed from '../../components/Proposals/ProposalCardDetailed';
import ProposalVotes from '../../components/Proposals/ProposalVotes';
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
      <Link to={`/daos/${DAO_ROUTES.delegate.relative(params.address)}/proposals`}>
        <Button
          size="lg"
          variant="text"
        >
          <LeftArrow />
          {t('proposals', { ns: 'sidebar' })}
        </Button>
      </Link>
      <Box>
        <Box>
          <ProposalCardDetailed proposal={proposal} />
          <ProposalVotes proposal={proposal} />
        </Box>
        <Flex>
          <CastVote proposal={proposal} />
        </Flex>
      </Box>
    </Box>
  );
}

export default ProposalDetails;
