import { useRef, ReactText, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ToastContent } from '../../../components/ui/ToastContent';
import { useFractal } from '../../fractal/hooks/useFractal';
import { useGovenorModule } from './useGovenorModule';

/**
 * Validates a users ability to create a proposal
 */
export function useUserProposalValidation() {
  const {
    votingToken: {
      votingTokenData: { votingWeight, proposalTokenThreshold, isDelegatesSet },
    },
    governorModuleContract,
  } = useGovenorModule();
  const {
    dao: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();
  const thresholdToastId = useRef<ReactText>('');
  const [canUserCreateProposal, setCanUserCreateProposal] = useState(false);

  useEffect(() => {
    // disable while threshold and voting weight are loading
    if (
      votingWeight === undefined ||
      proposalTokenThreshold === undefined ||
      isDelegatesSet === undefined
    ) {
      setCanUserCreateProposal(false);
      return;
    }

    // disable if no votes have been delegated, prevents voting on fresh DAO before any delegation as occured.
    if (!isDelegatesSet) {
      if (!thresholdToastId.current) {
        thresholdToastId.current = toast(
          <ToastContent
            title="No Delegatees have been set"
            label="Delegate"
            action={() => {
              navigate(`/daos/${daoAddress}/modules/${governorModuleContract!.address}/delegate`);
            }}
          />,
          {
            autoClose: false,
            progress: 1,
          }
        );
      }
      setCanUserCreateProposal(false);
      return;
    } else {
      // dismiss toast
      toast.dismiss(thresholdToastId.current);
    }

    // disable if voting weight is less than proposal threshold
    if (!proposalTokenThreshold.isZero() && proposalTokenThreshold.lte(votingWeight)) {
      if (!thresholdToastId.current) {
        thresholdToastId.current = toast(
          <ToastContent
            title="Voting weight is less than the required threshold to create proposals"
            label="Delegate"
            action={() => {
              navigate(`/daos/${daoAddress}/modules/${governorModuleContract!.address}/delegate`);
            }}
          />,
          {
            autoClose: false,
            progress: 1,
          }
        );
      }
      setCanUserCreateProposal(false);
      return;
    } else {
      // dismiss toast
      toast.dismiss(thresholdToastId.current);
    }
    setCanUserCreateProposal(true);
  }, [
    proposalTokenThreshold,
    votingWeight,
    isDelegatesSet,
    daoAddress,
    governorModuleContract,
    navigate,
  ]);

  useEffect(() => {
    return () => {
      toast.dismiss(thresholdToastId.current);
    };
  }, []);

  return canUserCreateProposal;
}
