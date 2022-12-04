import { Dispatch, useEffect, useCallback } from 'react';
import { IGnosis } from '../../types';
import { GovernanceAction, GovernanceActions } from '../actions';
import { GovernanceTypes, IGovernance } from './../types';
interface IUseSafeMultisigTxs {
  governance: IGovernance;
  gnosis: IGnosis;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export const useSafeMultisigTxs = ({
  governance: { type },
  gnosis: {
    safeService,
    safe: { address },
  },
  governanceDispatch,
}: IUseSafeMultisigTxs) => {
  const getMultisigTx = useCallback(async () => {
    if (!safeService || type === GovernanceTypes.GNOSIS_SAFE_USUL || !address) {
      // @todo add reset here for multisig transactions to clear state
      return;
    }
    const multiSigTransactions = await safeService?.getMultisigTransactions(address);

    governanceDispatch({
      type: GovernanceAction.UPDATE_TX_PROPOSALS,
      payload: {
        txProposals: [],
        passed: 0,
        pending: 0,
      },
    });
  }, [safeService, address, type, governanceDispatch]);

  useEffect(() => {
    getMultisigTx();
  }, [getMultisigTx]);
};
