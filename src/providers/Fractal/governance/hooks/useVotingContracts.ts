import { VotesToken, VotesToken__factory } from '@fractal-framework/fractal-contracts';
import { useEffect, useMemo, useState } from 'react';
import {
  OZLinearVoting,
  OZLinearVoting__factory,
  Usul,
} from '../../../../assets/typechain-types/usul';
import useSafeContracts from '../../../../hooks/safe/useSafeContracts';
import { useWeb3Provider } from '../../../Web3Data/hooks/useWeb3Provider';
import { GnosisModuleType, IGnosisModuleData } from '../types';

export const useVotingContracts = (modules: IGnosisModuleData[]) => {
  const [votingContract, setVotingContract] = useState<OZLinearVoting>();
  const [tokenContract, setTokenContract] = useState<VotesToken>();
  const [isContractsLoading, setContractsLoading] = useState(true);

  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const { zodiacModuleProxyFactoryContract, linearVotingMasterCopyContract } = useSafeContracts();

  const usulModule = useMemo(
    () => modules.find(module => module.moduleType === GnosisModuleType.USUL)?.moduleContract,
    [modules]
  ) as Usul | undefined;

  // set token contract
  useEffect(() => {
    if (!votingContract || !signerOrProvider) {
      return;
    }

    (async () => {
      setTokenContract(
        VotesToken__factory.connect(await votingContract.governanceToken(), signerOrProvider)
      );
    })();
  }, [signerOrProvider, votingContract]);

  // set voting contract
  useEffect(() => {
    if (
      !zodiacModuleProxyFactoryContract ||
      !linearVotingMasterCopyContract ||
      !signerOrProvider ||
      !usulModule
    ) {
      return;
    }

    // This assumes that there is a single voting strategy installed on the Usul module
    // If the first strategy contract isn't the OZ Linear Voting contract, then the voting contract is set to undefined
    (async () => {
      const votingContractAddress = await usulModule
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
        setVotingContract(OZLinearVoting__factory.connect(votingContractAddress, signerOrProvider));
      } else {
        setVotingContract(undefined);
      }
      setContractsLoading(false);
    })();
  }, [
    linearVotingMasterCopyContract,
    signerOrProvider,
    usulModule,
    zodiacModuleProxyFactoryContract,
  ]);

  return { votingContract, tokenContract, isContractsLoading };
};
