import { ReactNode, useMemo, useReducer } from 'react';
import { useGnosisApiServices } from './hooks/useGnosisApiServices';
import { Gnosis, GnosisActions, GnosisActionTypes } from './types';
import { useGnosisSigner } from './hooks/useGnosisSigner';
import { GnosisContext } from './hooks/useGnosis';

const initialState: Gnosis = {
  name: '',
  safeAddress: undefined,
  owners: [],
  isSigner: false,
  nonce: undefined,
  threshold: 0,
  isLoading: true,
  treasuryAssetsFungible: [],
  treasuryAssetsNonFungible: [],
};

const reducer = (state: Gnosis, action: GnosisActionTypes) => {
  switch (action.type) {
    case GnosisActions.UPDATE_GNOSIS_CONTRACT:
      return { ...state, ...action.payload };
    case GnosisActions.UPDATE_GNOSIS_SAFE_INFORMATION:
      return { ...state, ...action.payload, isLoading: false };
    case GnosisActions.UPDATE_GNOSIS_SAFE_ASSETS:
      return { ...state, ...action.payload, isLoading: false };
    case GnosisActions.UPDATE_SIGNER_AUTH:
      return { ...state, isSigner: action.payload };
    case GnosisActions.RESET:
      return initialState;
  }
};

export function GnosisProvider({
  safeAddress,
  children,
}: {
  safeAddress: string | undefined;
  children: ReactNode;
}) {
  initialState.safeAddress = safeAddress;
  const [state, dispatch] = useReducer(reducer, initialState);

  useGnosisApiServices(state.safeAddress, dispatch);
  useGnosisSigner(state.owners, dispatch);
  const value = useMemo(
    () => ({
      state,
      createProposal: () => {},
      createPendingTx: false,
    }),
    [state]
  );
  return <GnosisContext.Provider value={value}>{children}</GnosisContext.Provider>;
}
