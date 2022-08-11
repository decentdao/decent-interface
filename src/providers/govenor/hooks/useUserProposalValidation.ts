import { useRef, ReactText, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useGovenorModule } from './useGovenorModule';

export function useUserProposalValidation() {
  const {
    votingToken: {
      votingTokenData: { votingWeight, proposalTokenThreshold, isDelegatesSet },
    },
  } = useGovenorModule();
  const thresholdToastId = useRef<ReactText>('');

  const canUserCreateProposal = useMemo(() => {
    // disable while threshold and voting weight are loading
    if (votingWeight === undefined || proposalTokenThreshold === undefined) {
      return false;
    }

    // disable if no votes have been delegated, prevents voting on fresh DAO before any delegation as occured.
    if (!isDelegatesSet) {
      if (!thresholdToastId.current) {
        thresholdToastId.current = toast('No Delegatees have been set', {
          autoClose: false,
          progress: 1,
        });
      }
      return false;
    } else {
      // dismiss toast
      toast.dismiss(thresholdToastId.current);
    }

    // disable if voting weight is less than proposal threshold
    if (!proposalTokenThreshold.isZero() && proposalTokenThreshold.lte(votingWeight)) {
      if (!thresholdToastId.current) {
        thresholdToastId.current = toast(
          'Voting weight is less than the required threshold to create proposals',
          {
            autoClose: false,
            progress: 1,
          }
        );
      }
      return false;
    } else {
      // dismiss toast
      toast.dismiss(thresholdToastId.current);
    }
    return true;
  }, [proposalTokenThreshold, votingWeight, isDelegatesSet]);

  return [canUserCreateProposal];
}
