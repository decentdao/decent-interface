import {
  ModuleProxyFactory,
  UsulVetoGuard,
  UsulVetoGuard__factory,
  VetoGuard,
  VetoGuard__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber, ethers } from 'ethers';
import { SafeTransaction } from '../../types';
import {
  buildDeployZodiacModuleTx,
  generateContractByteCodeLinear,
  generatePredictedModuleAddress,
  generateSalt,
  TIMER_MULT,
} from './utils';

export interface VetoGuardData {
  predictedVetoModuleAddress: string;
  deployVetoGuardTx: SafeTransaction;
}

const generateVetoGuardData = (
  zodiacModuleProxyFactoryContract: ModuleProxyFactory,
  guardAddress: string,
  calldata: string,
  saltNum: string
): VetoGuardData => {
  const vetoGuardByteCodeLinear = generateContractByteCodeLinear(guardAddress.slice(2));
  const vetoGuardSalt = generateSalt(calldata, saltNum);
  const deployVetoGuardTx = buildDeployZodiacModuleTx(zodiacModuleProxyFactoryContract, [
    guardAddress,
    calldata,
    saltNum,
  ]);

  return {
    predictedVetoModuleAddress: generatePredictedModuleAddress(
      zodiacModuleProxyFactoryContract.address,
      vetoGuardSalt,
      vetoGuardByteCodeLinear
    ),
    deployVetoGuardTx,
  };
};

export const vetoGuardDataMultisig = (
  gnosisVetoGuardMasterCopyContract: VetoGuard,
  zodiacModuleProxyFactoryContract: ModuleProxyFactory,
  executionPeriod: BigNumber,
  parentDAOAddress: string,
  vetoVotingAddress: string,
  safeAddress: string,
  saltNum: string,
  timelockPeriod?: BigNumber
): VetoGuardData => {
  const setVetoGuardCalldata = VetoGuard__factory.createInterface().encodeFunctionData('setUp', [
    ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256', 'address', 'address', 'address'],
      [
        timelockPeriod?.mul(TIMER_MULT), // Timelock Period
        executionPeriod.mul(TIMER_MULT), // Execution Period
        parentDAOAddress, // Owner -- Parent DAO
        vetoVotingAddress, // Veto Voting
        safeAddress, // Gnosis Safe
      ]
    ),
  ]);

  return generateVetoGuardData(
    zodiacModuleProxyFactoryContract,
    gnosisVetoGuardMasterCopyContract.address,
    setVetoGuardCalldata,
    saltNum
  );
};

export const vetoGuardDataUsul = (
  usulVetoGuardMasterCopyContract: UsulVetoGuard,
  zodiacModuleProxyFactoryContract: ModuleProxyFactory,
  executionPeriod: BigNumber,
  parentDAOAddress: string,
  vetoVotingAddress: string,
  safeAddress: string,
  saltNum: string,
  usulAddress: string,
  strategyAddress: string
): VetoGuardData => {
  const setVetoGuardCalldata = UsulVetoGuard__factory.createInterface().encodeFunctionData(
    'setUp',
    [
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'address', 'address', 'uint256'],
        [
          parentDAOAddress, // Owner -- Parent DAO
          vetoVotingAddress, // Veto Voting
          strategyAddress, // Base Strategy
          usulAddress, // USUL
          executionPeriod.mul(TIMER_MULT), // Execution Period
        ]
      ),
    ]
  );

  return generateVetoGuardData(
    zodiacModuleProxyFactoryContract,
    usulVetoGuardMasterCopyContract.address,
    setVetoGuardCalldata,
    saltNum
  );
};
