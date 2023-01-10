import {
  UsulVetoGuard__factory,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  VetoMultisigVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { Dispatch, useEffect, useCallback, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { GnosisAction } from '../constants';
import {
  GnosisActions,
  GnosisModuleType,
  IGnosisModuleData,
  IGnosisVetoContract,
  VetoGuardType,
  VetoVotingType,
} from '../types';

export function useVetoContracts(
  gnosisDispatch: Dispatch<GnosisActions>,
  guardAddress?: string,
  modules?: IGnosisModuleData[]
) {
  const provider = useProvider();
  const { data } = useSigner();
  const signerOrProvider = useMemo(() => data || provider, [data, provider]);

  const {
    zodiacModuleProxyFactoryContract,
    vetoERC20VotingMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
    usulVetoGuardMasterCopyContract,
    gnosisVetoGuardMasterCopyContract,
  } = useSafeContracts();

  const getVetoGuardContracts = useCallback(
    async (_guardAddress: string, _modules?: IGnosisModuleData[]) => {
      if (
        !zodiacModuleProxyFactoryContract ||
        !signerOrProvider ||
        !gnosisVetoGuardMasterCopyContract ||
        !usulVetoGuardMasterCopyContract ||
        !vetoMultisigVotingMasterCopyContract ||
        !vetoERC20VotingMasterCopyContract
      ) {
        return;
      }

      const getMasterCopyAddress = async (proxyAddress: string): Promise<string> => {
        const filter = zodiacModuleProxyFactoryContract.filters.ModuleProxyCreation(
          proxyAddress,
          null
        );

        return zodiacModuleProxyFactoryContract.queryFilter(filter).then(proxiesCreated => {
          return proxiesCreated[0].args.masterCopy;
        });
      };

      let contracts: IGnosisVetoContract;
      let vetoGuardContract;
      let vetoGuardType;

      if (
        _guardAddress !== ethers.constants.AddressZero &&
        (await getMasterCopyAddress(_guardAddress)) === gnosisVetoGuardMasterCopyContract.address
      ) {
        vetoGuardContract = VetoGuard__factory.connect(_guardAddress, signerOrProvider);
        vetoGuardType = VetoGuardType.MULTISIG;
      } else {
        const usulModule = _modules?.find(module => module.moduleType === GnosisModuleType.USUL);
        if (
          !usulModule ||
          !usulModule.moduleContract ||
          (await usulModule.moduleContract.getGuard()) === ethers.constants.AddressZero
        ) {
          return;
        }
        const usulGuardAddress = await usulModule.moduleContract.getGuard();
        vetoGuardContract = UsulVetoGuard__factory.connect(usulGuardAddress, signerOrProvider);
        vetoGuardType = VetoGuardType.USUL;
      }

      const votingAddress = await vetoGuardContract.vetoVoting();
      const votingMasterCopyAddress = await getMasterCopyAddress(votingAddress);
      const vetoVotingType =
        votingMasterCopyAddress === vetoMultisigVotingMasterCopyContract.address
          ? VetoMultisigVoting__factory
          : VetoERC20Voting__factory;
      const vetoVotingContract = vetoVotingType.connect(votingAddress, signerOrProvider);

      contracts = {
        vetoGuardContract: vetoGuardContract,
        vetoVotingContract: vetoVotingContract,
        vetoVotingType:
          vetoVotingType === VetoMultisigVoting__factory
            ? VetoVotingType.MULTISIG
            : VetoVotingType.ERC20,
        vetoGuardType,
      };

      return contracts;
    },
    [
      zodiacModuleProxyFactoryContract,
      gnosisVetoGuardMasterCopyContract,
      usulVetoGuardMasterCopyContract,
      vetoERC20VotingMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      signerOrProvider,
    ]
  );

  useEffect(() => {
    if (!guardAddress) {
      return;
    }

    getVetoGuardContracts(guardAddress, modules).then(contracts => {
      if (!!contracts) {
        gnosisDispatch({
          type: GnosisAction.SET_GUARD_CONTRACTS,
          payload: contracts,
        });
      }
    });
  }, [guardAddress, modules, gnosisDispatch, getVetoGuardContracts]);

  return { getVetoGuardContracts };
}
