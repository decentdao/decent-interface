import { TxProposalState } from '../../../providers/Fractal/types';
import { Badge } from '../badges/Badge';

interface ProposalStateBoxProps {
  state: TxProposalState;
}

export default function TxProposalStateBox({ state }: ProposalStateBoxProps) {
  return (
    <Badge
      size="base"
      labelKey={state}
    />
  );
}
