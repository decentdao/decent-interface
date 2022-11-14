import { Button } from '@decent-org/fractal-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Proposal, ProposalState } from '../../providers/fractal/types';

interface ProposalActionProps {
  proposal: Proposal;
}

export function ProposalAction({ proposal }: ProposalActionProps) {
  const [pending, setPending] = useState(false);
  const { t } = useTranslation();

  const handleClick = () => {
    // @todo - call proper contract func based on proposal state and user permission
    setPending(true);

    if (proposal.state === ProposalState.Pending) {
      // Call vote
    }

    setPending(false);
  };

  const label = useMemo(() => {
    if (proposal.state === ProposalState.Active) {
      return t('vote');
    } else if (proposal.state === ProposalState.Pending) {
      return t('execute');
    } else if (proposal.state === ProposalState.Executing) {
      return t('queue');
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
