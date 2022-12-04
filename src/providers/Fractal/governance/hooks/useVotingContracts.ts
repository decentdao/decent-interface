import { VotesToken, VotesToken__factory } from '@fractal-framework/fractal-contracts';
import { Dispatch, useEffect, useMemo, useCallback } from 'react';
import {
  OZLinearVoting,
  OZLinearVoting__factory,
  Usul,
  Usul__factory,
} from '../../../../assets/typechain-types/usul';
import useSafeContracts from '../../../../hooks/safe/useSafeContracts';
import { useWeb3Provider } from '../../../Web3Data/hooks/useWeb3Provider';
import { GovernanceAction, GovernanceActions } from '../actions';
import { GnosisModuleType, IGnosisModuleData } from '../types';

export const useVotingContracts = (
  modules: IGnosisModuleData[],
  governanceDispatch: Dispatch<GovernanceActions>
) => {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const { zodiacModuleProxyFactoryContract, linearVotingMasterCopyContract } = useSafeContracts();

  const usulModule = useMemo(
    () => modules.find(module => module.moduleType === GnosisModuleType.USUL)?.moduleContract,
    [modules]
  ) as Usul | undefined;

  const loadUsulContracts = useCallback(async () => {
    if (
      !signerOrProvider ||
      !usulModule ||
      !zodiacModuleProxyFactoryContract ||
      !linearVotingMasterCopyContract
    ) {
      return;
    }

    const usulContract = Usul__factory.connect(usulModule.address, signerOrProvider);
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
        OZlinearVotingContract: ozLinearContract,
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
  ]);

  useEffect(() => {
    loadUsulContracts();
  }, [loadUsulContracts]);
};
