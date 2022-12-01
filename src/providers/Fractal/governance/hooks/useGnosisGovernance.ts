// import { useSubDAODeploy } from './useSubDAODeploy';

import { Dispatch, useEffect } from 'react';
import { useWeb3Provider } from '../../../Web3Data/hooks/useWeb3Provider';
import { IGnosis } from '../../types';
import { GovernanceActions, GovernanceAction } from '../actions';
import useGovernanceTokenData from './useGovernanceTokenData';

export const useGnosisGovernance = (
  { safe: { owners, address }, modules }: IGnosis,
  gonvernanceDispatch: Dispatch<GovernanceActions>
) => {
  const {
    state: { account },
  } = useWeb3Provider();

  // const { deploySubDao, deploySubDAOPending } = useSubDAODeploy();

  const governanceTokenData = useGovernanceTokenData(modules);

  useEffect(() => {
    if (!account || !address) {
      return;
    }

    gonvernanceDispatch({
      type: GovernanceAction.ADD_GOVERNANCE_DATA,
      payload: {
        createSubDAOFunc: () => {},
        isCreateSubDAOPending: false,
        isCreateProposalPending: false,
        createProposalFunc: () => {},
        isConnectedUserAuth: owners?.includes(account || ''),
        governanceIsLoading: false,
        governanceToken: governanceTokenData,
      },
    });
  }, [account, address, owners, gonvernanceDispatch, governanceTokenData]);
  return;
};
