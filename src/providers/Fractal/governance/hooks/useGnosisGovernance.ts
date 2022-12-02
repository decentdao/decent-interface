import { Dispatch, useEffect } from 'react';
import { useWeb3Provider } from '../../../Web3Data/hooks/useWeb3Provider';
import { GovernanceTypes, IGnosis } from '../../types';
import { GovernanceActions, GovernanceAction } from '../actions';
import useGovernanceTokenData from './useGovernanceTokenData';
import { useVotingContracts } from './useVotingContracts';

export const useGnosisGovernance = (
  { safe, modules }: IGnosis,
  gonvernanceDispatch: Dispatch<GovernanceActions>
) => {
  const {
    state: { account },
  } = useWeb3Provider();

  const { votingContract, tokenContract, isContractsLoading } = useVotingContracts(modules);
  const governanceTokenData = useGovernanceTokenData(votingContract, tokenContract);

  useEffect(() => {
    if (!account || !safe.address || isContractsLoading) {
      return;
    }

    const governanceType = !!votingContract
      ? GovernanceTypes.GNOSIS_SAFE_USUL
      : !votingContract
      ? GovernanceTypes.GNOSIS_SAFE
      : null;

    gonvernanceDispatch({
      type: GovernanceAction.SET_GOVERNANCE,
      payload: {
        actions: {},
        type: governanceType,
        governanceToken: governanceTokenData,
        governanceIsLoading: false,
      },
    });
  }, [
    account,
    safe.address,
    gonvernanceDispatch,
    governanceTokenData,
    votingContract,
    isContractsLoading,
  ]);
};
