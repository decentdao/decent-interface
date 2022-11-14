import { Button } from '@decent-org/fractal-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Proposal, ProposalState } from '../../providers/fractal/types';

export function ProposalAction({ proposal }: { proposal: Proposal }) {
  const [pending, setPending] = useState(false);
  const { t } = useTranslation();

  const handleClick = () => {
    // @todo - call proper contract func based on proposal state and user permission
    setPending(true);

    switch (proposal.state) {
      case ProposalState.Active:
      // Call Vote action - probably redirect to proposal details where CastVote component would handle proper vote casting
      case ProposalState.Pending:
      // Call proposal queueing action
      case ProposalState.Executing:
      // Call proposal execution action
    }

    setPending(false);
  };

  const label = useMemo(() => {
    switch (proposal.state) {
      case ProposalState.Active:
        return t('vote');
      case ProposalState.Pending:
        return t('queue');
      case ProposalState.Executing:
        return t('execute');
    }
  }, [proposal, t]);

  if (!label) {
    // This means that Proposal in state where there's no action to perform
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={pending}
    >
      {label}
    </Button>
  );
}
