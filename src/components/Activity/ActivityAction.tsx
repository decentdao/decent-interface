import { Flex } from '@chakra-ui/react';
import { TxProposal } from '../../providers/Fractal/types';
import { ProposalAction } from '../Proposals/ProposalActions/ProposalAction';
import ProposalTime from '../ui/proposal/ProposalTime';

export default function ActivityAction({ activity }: { activity: TxProposal }) {
  return (
    <Flex
      gap={4}
      alignItems="center"
    >
      <ProposalTime proposal={activity} />
      <ProposalAction proposal={activity} />
    </Flex>
  );
}
