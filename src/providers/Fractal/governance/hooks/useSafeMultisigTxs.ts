import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { Dispatch, useEffect, useCallback } from 'react';
import { useParseSafeTxs } from '../../../../hooks/utils/useParseSafeTxs';
import { useSafeActivitiesWithState } from '../../../../hooks/utils/useSafeActivitiesWithState';
import { IGnosis } from '../../types';
import { GovernanceAction, GovernanceActions } from '../actions';
import {
  IGovernance,
  TxProposalState,
  GovernanceTypes,
  ActivityEventType,
  MultisigProposal,
  VetoGuardType,
} from './../types';
interface IUseSafeMultisigTxs {
  governance: IGovernance;
  gnosis: IGnosis;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export const useSafeMultisigTxs = ({
  governance: { type },
  gnosis: {
    transactions,
    safeService,
    safe,
    guardContracts: { vetoGuardContract, vetoGuardType },
  },
  governanceDispatch,
}: IUseSafeMultisigTxs) => {
  const parsedActivities = useParseSafeTxs(transactions, safe);
  const parsedActivitiesWithState = useSafeActivitiesWithState(
    parsedActivities,
    vetoGuardType === VetoGuardType.MULTISIG
      ? (vetoGuardContract?.asSigner as VetoGuard)
      : undefined
  );

  const getMultisigTx = useCallback(async () => {
    if (!safeService || !safe.address || !type) {
      return;
    }
    if (!parsedActivitiesWithState.length) {
      return;
    }

    const multisigTxs = (parsedActivitiesWithState as MultisigProposal[]).filter(
      tx => tx.eventType === ActivityEventType.Governance
    );

    const passedProposals = multisigTxs.reduce(
      (prev, proposal) => (proposal.state === TxProposalState.Executed ? prev + 1 : prev),
      0
    );

    const activeProposals = multisigTxs.reduce(
      (prev, proposal) =>
        proposal.state === TxProposalState.Active || proposal.state === TxProposalState.Executing
          ? prev + 1
          : prev,
      0
    );

    governanceDispatch({
      type: GovernanceAction.UPDATE_PROPOSALS,
      payload: {
        txProposals: multisigTxs,
        passed: passedProposals,
        active: activeProposals,
      },
    });
  }, [safeService, safe.address, type, parsedActivitiesWithState, governanceDispatch]);

  useEffect(() => {
    if (type === GovernanceTypes.GNOSIS_SAFE) {
      getMultisigTx();
    }
  }, [getMultisigTx, type]);
};
