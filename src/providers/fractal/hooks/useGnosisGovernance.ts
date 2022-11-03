import { Dispatch, useEffect } from 'react';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { GnosisSafe, GovernanceActions } from '../types';
import { GovernanceAction } from './../constants/actions';
import { useSubDAODeploy } from './useSubDAODeploy';

export const useGnosisGovernance = (
  { owners, address }: GnosisSafe,
  gonvernanceDispatch: Dispatch<GovernanceActions>
) => {
  const {
    state: { account },
  } = useWeb3Provider();

  const { deploySubDao, deploySubDAOPending } = useSubDAODeploy();

  useEffect(() => {
    if (!account || !address) {
      return;
    }

    gonvernanceDispatch({
      type: GovernanceAction.ADD_GOVERNANCE_DATA,
      payload: {
        createSubDAOFunc: deploySubDao,
        isCreateSubDAOPending: deploySubDAOPending,
        isCreateProposalPending: false,
        createProposalFunc: () => {},
        isConnectedUserAuth: owners?.includes(account || ''),
        governanceIsLoading: false,
      },
    });
  }, [account, address, owners, deploySubDao, deploySubDAOPending, gonvernanceDispatch]);
  return;
};
