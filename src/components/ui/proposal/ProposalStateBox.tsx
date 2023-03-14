import { TxProposalState } from '../../../providers/Fractal/types';
import { Badge } from '../badges/Badge';

interface ProposalStateBoxProps {
  state: TxProposalState | null;
}

export default function TxProposalStateBox({ state }: ProposalStateBoxProps) {
  if (!state) return null;

  return (
    <Badge
      size="base"
      labelKey={state}
    />
  );
}
