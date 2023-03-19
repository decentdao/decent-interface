import { Dispatch, useEffect } from 'react';
import {
  IGovernance,
  IGnosis,
  GovernanceActions,
  GovernanceTypes,
  GovernanceAction,
} from '../../../../types';
import { useTokenClaim } from '../../hooks/useTokenClaim';
import useGovernanceTokenData from './useGovernanceTokenData';
import { useSafeMultisigTxs } from './useSafeMultisigTxs';
import useUsulProposals from './useUsulProposals';
import { useVotingContracts } from './useVotingContracts';

interface IUseGnosisGovernance {
  governance: IGovernance;
  gnosis: IGnosis;
  governanceDispatch: Dispatch<GovernanceActions>;
  chainId: number;
}

export const useGnosisGovernance = ({
  governance,
  gnosis,
  governanceDispatch,
  chainId,
}: IUseGnosisGovernance) => {
  // load voting contracts
  useVotingContracts({ gnosis, governanceDispatch, chainId });
  // if voting contracts are loaded, load governance data
  const governanceTokenData = useGovernanceTokenData(governance.contracts);
  useTokenClaim({ tokenContract: governance.contracts.tokenContract, governanceDispatch });
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

    if (!governanceType) {
      return;
    }
    if (governanceType === GovernanceTypes.GNOSIS_SAFE_USUL && !governanceTokenData.address) {
      return;
    }

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
