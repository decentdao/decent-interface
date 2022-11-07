import { Dispatch, useEffect } from 'react';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { IGnosis, GovernanceActions } from '../types';
import { GovernanceAction } from './../constants/actions';
import useGovernanceTokenData from './useGovernanceTokenData';
import { useSubDAODeploy } from './useSubDAODeploy';

export const useGnosisGovernance = (
  { safe: { owners, address }, modules }: IGnosis,
  gonvernanceDispatch: Dispatch<GovernanceActions>
) => {
  const {
    state: { account },
  } = useWeb3Provider();

  const { deploySubDao, deploySubDAOPending } = useSubDAODeploy();

  const governanceTokenData = useGovernanceTokenData(modules);

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
        governanceToken: governanceTokenData,
      },
    });
  }, [
    account,
    address,
    owners,
    deploySubDao,
    deploySubDAOPending,
    gonvernanceDispatch,
    governanceTokenData,
  ]);
  return;
};
