import {
  VotesToken,
  VotesToken__factory,
  OZLinearVoting,
  OZLinearVoting__factory,
  FractalUsul,
  FractalUsul__factory,
} from '@fractal-framework/fractal-contracts';
import { Dispatch, useEffect, useMemo, useCallback } from 'react';
import { useProvider, useSigner } from 'wagmi';
import useSafeContracts from '../../../../hooks/safe/useSafeContracts';
import { GovernanceAction, GovernanceActions } from '../actions';
import { GnosisModuleType } from '../types';
import { IGnosis } from './../../types/state';

interface IUseVotingContracts {
  gnosis: IGnosis;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export const useVotingContracts = ({
  gnosis: { modules, isGnosisLoading },
  governanceDispatch,
}: IUseVotingContracts) => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  const { zodiacModuleProxyFactoryContract, linearVotingMasterCopyContract } = useSafeContracts();

  const usulModule = useMemo(
    () => modules.find(module => module.moduleType === GnosisModuleType.USUL)?.moduleContract,
    [modules]
  ) as FractalUsul | undefined;

  const loadUsulContracts = useCallback(async () => {
    if (
      !signerOrProvider ||
      !zodiacModuleProxyFactoryContract ||
      !linearVotingMasterCopyContract ||
      isGnosisLoading
    ) {
      return;
    }

    if (!usulModule) {
      governanceDispatch({
        type: GovernanceAction.CONTRACTS_LOADED,
      });
      return;
    }

    const usulContract = FractalUsul__factory.connect(usulModule.address, signerOrProvider);
    let ozLinearContract: OZLinearVoting | undefined;
    let tokenContract: VotesToken | undefined;

    const votingContractAddress = await usulContract
      .queryFilter(usulModule.filters.EnabledStrategy())
      .then(strategiesEnabled => {
        return strategiesEnabled[0].args.strategy;
      });

    const filter = zodiacModuleProxyFactoryContract.filters.ModuleProxyCreation(
      votingContractAddress,
      null
    );

    const votingContractMasterCopyAddress = await zodiacModuleProxyFactoryContract
      .queryFilter(filter)
      .then(proxiesCreated => {
        return proxiesCreated[0].args.masterCopy;
      });

    if (votingContractMasterCopyAddress === linearVotingMasterCopyContract.address) {
      ozLinearContract = OZLinearVoting__factory.connect(votingContractAddress, signerOrProvider);
    }
    if (ozLinearContract) {
      tokenContract = VotesToken__factory.connect(
        await ozLinearContract.governanceToken(),
        signerOrProvider
      );
    }
    governanceDispatch({
      type: GovernanceAction.SET_USUL_CONTRACTS,
      payload: {
        ozLinearVotingContract: ozLinearContract,
        usulContract: usulContract,
        tokenContract: tokenContract,
        contractsIsLoading: false,
      },
    });
  }, [
    signerOrProvider,
    governanceDispatch,
    zodiacModuleProxyFactoryContract,
    linearVotingMasterCopyContract,
    usulModule,
    isGnosisLoading,
  ]);

  useEffect(() => {
    loadUsulContracts();
  }, [loadUsulContracts]);
};
