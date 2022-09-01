import { GnosisActions, GnosisActionTypes } from './../types/actions';
import { useWeb3Provider } from './../../../contexts/web3Data/hooks/useWeb3Provider';
import { useEffect } from 'react';
export function useGnosisSigner(owners: string[], dispatch: React.Dispatch<GnosisActionTypes>) {
  const {
    state: { account },
  } = useWeb3Provider();
  useEffect(() => {
    if (!account) {
      return;
    }
    dispatch({ type: GnosisActions.UPDATE_SIGNER_AUTH, payload: owners.includes(account) });
  }, [account, owners, dispatch]);
}
