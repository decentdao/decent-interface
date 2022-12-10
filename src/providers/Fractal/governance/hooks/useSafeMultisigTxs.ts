import { Dispatch, useEffect, useCallback } from 'react';
import { useParseSafeTxs } from '../../../../hooks/utils/useParseSafeTxs';
import { IGnosis } from '../../types';
import { GovernanceAction, GovernanceActions } from '../actions';
import {
  IGovernance,
  TxProposalState,
  GovernanceTypes,
  ActivityEventType,
  MultisigProposal,
} from './../types';
interface IUseSafeMultisigTxs {
  governance: IGovernance;
  gnosis: IGnosis;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export const useSafeMultisigTxs = ({
  governance: { type },
  gnosis: { transactions, safeService, safe },
  governanceDispatch,
}: IUseSafeMultisigTxs) => {
  const parsedActivities = useParseSafeTxs(transactions, safe);

  const getMultisigTx = useCallback(async () => {
    if (!safeService || !safe.address || !type) {
      return;
    }

    if (!parsedActivities.length) {
      return;
    }

    const multisigTxs = (parsedActivities as MultisigProposal[]).filter(
      tx => tx.eventType === ActivityEventType.Governance
    );

    const passedProposals = multisigTxs.reduce(
      (prev, proposal) => (proposal.state === TxProposalState.Executed ? prev + 1 : prev),
      0
    );

    const pendingProposals = multisigTxs.reduce(
      (prev, proposal) =>
        proposal.state === TxProposalState.Active || proposal.state === TxProposalState.Pending
          ? prev + 1
          : prev,
      0
    );

    governanceDispatch({
      type: GovernanceAction.UPDATE_PROPOSALS,
      payload: {
        txProposals: multisigTxs,
        passed: passedProposals,
        pending: pendingProposals,
      },
    });
  }, [safeService, safe.address, governanceDispatch, type, parsedActivities]);

  useEffect(() => {
    if (type === GovernanceTypes.GNOSIS_SAFE) {
      getMultisigTx();
    }
  }, [getMultisigTx, type]);
};
