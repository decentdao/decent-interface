import { ModuleProxyFactory, UsulVetoGuard, VetoGuard } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { Dispatch, useEffect, useCallback } from 'react';
import { getEventRPC } from '../../../helpers';
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
import { ContractConnection } from './../../../types/contract';

export function useVetoContracts(
  gnosisDispatch: Dispatch<GnosisActions>,
  chainId: number,
  guardAddress?: string,
  modules?: IGnosisModuleData[]
) {
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
        !gnosisVetoGuardMasterCopyContract ||
        !usulVetoGuardMasterCopyContract ||
        !vetoMultisigVotingMasterCopyContract ||
        !vetoERC20VotingMasterCopyContract
      ) {
        return;
      }

      const getMasterCopyAddress = async (proxyAddress: string): Promise<string> => {
        const filter = getEventRPC<ModuleProxyFactory>(
          zodiacModuleProxyFactoryContract,
          chainId
        ).filters.ModuleProxyCreation(proxyAddress, null);
        return getEventRPC<ModuleProxyFactory>(zodiacModuleProxyFactoryContract, chainId)
          .queryFilter(filter)
          .then(proxiesCreated => {
            return proxiesCreated[0].args.masterCopy;
          });
      };

      let contracts: IGnosisVetoContract;
      let vetoGuardContract: ContractConnection<UsulVetoGuard | VetoGuard> | undefined;
      let vetoGuardType;

      if (
        _guardAddress !== ethers.constants.AddressZero &&
        (await getMasterCopyAddress(_guardAddress)) ===
          gnosisVetoGuardMasterCopyContract.asSigner.address
      ) {
        vetoGuardContract = {
          asSigner: gnosisVetoGuardMasterCopyContract.asSigner.attach(_guardAddress),
          asProvider: gnosisVetoGuardMasterCopyContract.asProvider.attach(_guardAddress),
        };
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
        vetoGuardContract = {
          asSigner: usulVetoGuardMasterCopyContract.asSigner.attach(usulGuardAddress),
          asProvider: usulVetoGuardMasterCopyContract.asProvider.attach(usulGuardAddress),
        };
        vetoGuardType = VetoGuardType.USUL;
      }

      const votingAddress = await vetoGuardContract.asSigner.vetoVoting();
      const votingMasterCopyAddress = await getMasterCopyAddress(votingAddress);
      const vetoVotingType =
        votingMasterCopyAddress === vetoMultisigVotingMasterCopyContract.asSigner.address
          ? VetoVotingType.MULTISIG
          : VetoVotingType.ERC20;

      const vetoVotingContract =
        vetoVotingType === VetoVotingType.MULTISIG
          ? {
              asSigner: vetoMultisigVotingMasterCopyContract.asSigner.attach(votingAddress),
              asProvider: vetoMultisigVotingMasterCopyContract.asProvider.attach(votingAddress),
            }
          : {
              asSigner: vetoERC20VotingMasterCopyContract.asSigner.attach(votingAddress),
              asProvider: vetoERC20VotingMasterCopyContract.asProvider.attach(votingAddress),
            };

      contracts = {
        vetoGuardContract: vetoGuardContract,
        vetoVotingContract: vetoVotingContract,
        vetoVotingType,
        vetoGuardType,
      };

      return contracts;
    },
    [
      zodiacModuleProxyFactoryContract,
      gnosisVetoGuardMasterCopyContract,
      usulVetoGuardMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      vetoERC20VotingMasterCopyContract,
      chainId,
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
