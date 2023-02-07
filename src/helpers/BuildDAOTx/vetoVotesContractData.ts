import {
  VetoERC20Voting__factory,
  VetoMultisigVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { generateContractByteCodeLinear, generateSalt } from './utils';

export interface VetoVotesContractData {
  vetoVotingAddress: string;
  setVetoVotingCalldata: string;
  vetoVotesType: any;
}

export const vetoVotesContractData = (
  vetoERC20VotingMasterCopyContract: any,
  vetoMultisigVotingMasterCopyContract: any,
  zodiacModuleProxyFactoryContract: any,
  saltNum: string,
  parentTokenAddress?: string
): VetoVotesContractData => {
  // VETO Voting Contract
  // If parent DAO is a token voting DAO, then we must utilize the veto ERC20 Voting
  const vetoVotesMasterCopyContract = parentTokenAddress
    ? vetoERC20VotingMasterCopyContract
    : vetoMultisigVotingMasterCopyContract;

  const vetoVotesType = parentTokenAddress ? VetoERC20Voting__factory : VetoMultisigVoting__factory;

  const setVetoVotingCalldata = vetoVotesType.createInterface().encodeFunctionData('owner');
  const vetoVotingByteCodeLinear = generateContractByteCodeLinear(
    vetoVotesMasterCopyContract.asSigner.address.slice(2)
  );

  const vetoVotingSalt = generateSalt(setVetoVotingCalldata, saltNum);

  return {
    vetoVotingAddress: getCreate2Address(
      zodiacModuleProxyFactoryContract.asSigner.address,
      vetoVotingSalt,
      solidityKeccak256(['bytes'], [vetoVotingByteCodeLinear])
    ),
    setVetoVotingCalldata,
    vetoVotesType,
  };
};
