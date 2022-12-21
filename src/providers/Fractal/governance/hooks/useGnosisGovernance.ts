import { Dispatch, useEffect } from 'react';
import { GovernanceTypes, IGnosis, IGovernance } from '../../types';
import { GovernanceActions, GovernanceAction } from '../actions';
import useGovernanceTokenData from './useGovernanceTokenData';
import { useSafeMultisigTxs } from './useSafeMultisigTxs';
import useUsulProposals from './useUsulProposals';
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
  // load voting contracts
  useVotingContracts({ gnosis, governanceDispatch });
  // if voting contracts are loaded, load governance data
  const governanceTokenData = useGovernanceTokenData(governance.contracts);

  // loads transactions (multisig) or proposals (usul)
  useUsulProposals({ governance, governanceDispatch });
  useSafeMultisigTxs({ governance, gnosis, governanceDispatch });

  useEffect(() => {
    if (!gnosis.safe || governance.contracts.contractsIsLoading) {
      return;
    }
    const governanceType = !!governance.contracts.ozLinearVotingContract
      ? GovernanceTypes.GNOSIS_SAFE_USUL
      : !governance.contracts.ozLinearVotingContract &&
        !gnosis.safe.modules?.includes((gnosis.safe.owners || [])[0])
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
    gnosis.safe,
    governanceDispatch,
    governanceTokenData,
    governance.contracts.ozLinearVotingContract,
    governance.contracts.contractsIsLoading,
  ]);
};
