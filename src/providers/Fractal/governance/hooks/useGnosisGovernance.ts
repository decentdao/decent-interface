import { Dispatch, useEffect } from 'react';
import { useWeb3Provider } from '../../../Web3Data/hooks/useWeb3Provider';
import { GovernanceTypes, IGnosis, IGovernance } from '../../types';
import { GovernanceActions, GovernanceAction } from '../actions';
import useGovernanceTokenData from './useGovernanceTokenData';
import { useVotingContracts } from './useVotingContracts';

interface IUseGnosisGovernance {
  governance: IGovernance;
  gnosis: IGnosis;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export const useGnosisGovernance = ({
  governance,
  gnosis,
  governanceDispatch,
}: IUseGnosisGovernance) => {
  const {
    state: { account },
  } = useWeb3Provider();

  useVotingContracts(gnosis.modules, governanceDispatch);
  const governanceTokenData = useGovernanceTokenData(governance.contracts);

  useEffect(() => {
    if (!account || !gnosis.safe.address || governance.contracts.contractsIsLoading) {
      return;
    }

    const governanceType = !!governance.contracts.OZlinearVotingContract
      ? GovernanceTypes.GNOSIS_SAFE_USUL
      : !governance.contracts.OZlinearVotingContract
      ? GovernanceTypes.GNOSIS_SAFE
      : null;

    governanceDispatch({
      type: GovernanceAction.SET_GOVERNANCE,
      payload: {
        type: governanceType,
        governanceToken: governanceTokenData,
        governanceIsLoading: false,
      },
    });
  }, [
    account,
    gnosis.safe.address,
    governanceDispatch,
    governanceTokenData,
    governance.contracts.OZlinearVotingContract,
    governance.contracts.contractsIsLoading,
  ]);
};
