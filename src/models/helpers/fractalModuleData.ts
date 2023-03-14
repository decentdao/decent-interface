import {
  FractalModule,
  FractalModule__factory,
  GnosisSafe,
  ModuleProxyFactory,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { buildContractCall } from '../../helpers/crypto';
import { SafeTransaction } from '../../types';
import {
  buildDeployZodiacModuleTx,
  generateContractByteCodeLinear,
  generatePredictedModuleAddress,
  generateSalt,
} from './utils';

export interface FractalModuleData {
  predictedFractalModuleAddress: string;
  deployFractalModuleTx: SafeTransaction;
  enableFractalModuleTx: SafeTransaction;
}

export const fractalModuleData = (
  fractalModuleMasterCopyContract: FractalModule,
  zodiacModuleProxyFactoryContract: ModuleProxyFactory,
  safeContract: GnosisSafe,
  saltNum: string,
  parentDAOAddress?: string
): FractalModuleData => {
  const fractalModuleCalldata = FractalModule__factory.createInterface().encodeFunctionData(
    'setUp',
    [
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'address', 'address[]'],
        [
          parentDAOAddress ?? safeContract.address, // Owner -- Parent DAO or safe contract
          safeContract.address, // Avatar
          safeContract.address, // Target
          [], // Authorized Controllers
        ]
      ),
    ]
  );

  const fractalByteCodeLinear = generateContractByteCodeLinear(
    fractalModuleMasterCopyContract.address.slice(2)
  );

  const fractalSalt = generateSalt(fractalModuleCalldata, saltNum);
  const deployFractalModuleTx = buildDeployZodiacModuleTx(zodiacModuleProxyFactoryContract, [
    fractalModuleMasterCopyContract.address,
    fractalModuleCalldata,
    saltNum,
  ]);
  const predictedFractalModuleAddress = generatePredictedModuleAddress(
    zodiacModuleProxyFactoryContract.address,
    fractalSalt,
    fractalByteCodeLinear
  );

  const enableFractalModuleTx = buildContractCall(
    safeContract,
    'enableModule',
    [predictedFractalModuleAddress],
    0,
    false
  );

  return {
    predictedFractalModuleAddress,
    deployFractalModuleTx,
    enableFractalModuleTx,
  };
};
