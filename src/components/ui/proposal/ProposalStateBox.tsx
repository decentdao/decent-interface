import { ProposalState } from '../../../providers/fractal/types/usul';
import { Badge } from '../badges/Badge';

interface ProposalStateBoxProps {
  state: ProposalState;
}

export default function ProposalStateBox({ state }: ProposalStateBoxProps) {
  return (
    <Badge
      size="base"
      labelKey={state}
    />
  );
}
