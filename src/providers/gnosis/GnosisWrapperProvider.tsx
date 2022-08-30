import { ReactNode, useMemo, useReducer } from 'react';
import useGnosisWrapperContract from './hooks/useGnosisWrapperContract';
import useGnosisSafeAddress from './hooks/useGnosisSafeAddress';
import { useGnosisApiServices } from './hooks/useGnosisApiServices';
import { Gnosis, GnosisActions, GnosisActionTypes } from './types';
import { GnosisWrapperContext } from './hooks/useGnosisWrapper';
import { useGnosisSigner } from './hooks/useGnosisSigner';

const initialState: Gnosis = {
  name: '',
  contractAddress: undefined,
  owners: [],
  isSigner: false,
  nonce: undefined,
  threshold: 0,
  isLoading: true,
};

const reducer = (state: Gnosis, action: GnosisActionTypes) => {
  switch (action.type) {
    case GnosisActions.UPDATE_GNOSIS_CONTRACT:
      return { ...state, ...action.payload };
    case GnosisActions.UPDATE_GNOSIS_SAFE_INFORMATION:
      return { ...state, ...action.payload, isLoading: false };
    case GnosisActions.UPDATE_SIGNER_AUTH:
      return { ...state, isSigner: action.payload };
    case GnosisActions.RESET:
      return initialState;
  }
};

export function GnosisWrapperProvider({
  moduleAddress,
  children,
}: {
  moduleAddress: string | null;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const gnosisWrapperContract = useGnosisWrapperContract(moduleAddress);

  useGnosisSafeAddress(gnosisWrapperContract, dispatch);
  useGnosisApiServices(state.contractAddress, dispatch);
  useGnosisSigner(state.owners, dispatch);
  const value = useMemo(
    () => ({
      state,
      createProposal: () => {},
      createPendingTx: false,
    }),
    [state]
  );
  return <GnosisWrapperContext.Provider value={value}>{children}</GnosisWrapperContext.Provider>;
}
