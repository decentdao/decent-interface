import { FractalProposalState } from '../../../types';
import { Badge } from '../badges/Badge';

interface ProposalStateBoxProps {
  state: FractalProposalState | null;
}

export default function FractalProposalStateBox({ state }: ProposalStateBoxProps) {
  if (!state) return null;

  return (
    <Badge
      size="base"
      labelKey={state}
    />
  );
}
