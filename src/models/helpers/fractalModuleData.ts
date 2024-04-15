import { Address, encodeAbiParameters, encodeFunctionData, parseAbiParameters } from 'viem';
import { buildContractCall } from '../../helpers/crypto';
import { SafeTransaction } from '../../types';
import { NetworkContract } from '../../types/network';
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
  fractalModuleMasterCopyContract: NetworkContract,
  zodiacModuleProxyFactoryContract: NetworkContract,
  safeContract: NetworkContract,
  saltNum: string,
  parentAddress?: Address,
): FractalModuleData => {
  const fractalModuleCalldata = encodeFunctionData({
    functionName: 'setUp',
    args: [
      encodeAbiParameters(parseAbiParameters(['address, address, address, address[]']), [
        parentAddress ?? safeContract.address, // Owner -- Parent DAO or safe contract
        safeContract.address, // Avatar
        safeContract.address, // Target
        [], // Authorized Controllers
      ]),
    ],
    abi: fractalModuleMasterCopyContract.abi,
  });

  const fractalByteCodeLinear = generateContractByteCodeLinear(
    fractalModuleMasterCopyContract.address.slice(2) as Address,
  );

  const fractalSalt = generateSalt(fractalModuleCalldata, BigInt(saltNum));
  const deployFractalModuleTx = buildDeployZodiacModuleTx(zodiacModuleProxyFactoryContract, [
    fractalModuleMasterCopyContract.address,
    fractalModuleCalldata,
    saltNum,
  ]);
  const predictedFractalModuleAddress = generatePredictedModuleAddress(
    zodiacModuleProxyFactoryContract.address,
    fractalSalt,
    fractalByteCodeLinear,
  );

  const enableFractalModuleTx = buildContractCall(
    safeContract,
    'enableModule',
    [predictedFractalModuleAddress],
    0,
    false,
  );

  return {
    predictedFractalModuleAddress,
    deployFractalModuleTx,
    enableFractalModuleTx,
  };
};
