import {
  ModuleProxyFactory,
  VetoERC20Voting,
  VetoERC20Voting__factory,
  VetoMultisigVoting,
  VetoMultisigVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { generateContractByteCodeLinear, generateSalt } from './utils';

export interface VetoVotesData {
  vetoVotingAddress: string;
  setVetoVotingCalldata: string;
  vetoVotesType: any;
}

export const vetoVotesData = (
  vetoERC20VotingMasterCopyContract: VetoERC20Voting,
  vetoMultisigVotingMasterCopyContract: VetoMultisigVoting,
  zodiacModuleProxyFactoryContract: ModuleProxyFactory,
  saltNum: string,
  parentTokenAddress?: string
): VetoVotesData => {
  // VETO Voting Contract
  // If parent DAO is a token voting DAO, then we must utilize the veto ERC20 Voting
  const vetoVotesMasterCopyContract = parentTokenAddress
    ? vetoERC20VotingMasterCopyContract
    : vetoMultisigVotingMasterCopyContract;

  const vetoVotesType = parentTokenAddress ? VetoERC20Voting__factory : VetoMultisigVoting__factory;

  const setVetoVotingCalldata = vetoVotesType.createInterface().encodeFunctionData('owner');
  const vetoVotingByteCodeLinear = generateContractByteCodeLinear(
    vetoVotesMasterCopyContract.address.slice(2)
  );

  const vetoVotingSalt = generateSalt(setVetoVotingCalldata, saltNum);

  return {
    vetoVotingAddress: getCreate2Address(
      zodiacModuleProxyFactoryContract.address,
      vetoVotingSalt,
      solidityKeccak256(['bytes'], [vetoVotingByteCodeLinear])
    ),
    setVetoVotingCalldata,
    vetoVotesType,
  };
};
