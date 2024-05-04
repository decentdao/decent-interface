import {
  FractalModule,
  FractalModule__factory,
  ModuleProxyFactory,
} from '@fractal-framework/fractal-contracts';
import { encodeAbiParameters, parseAbiParameters, getAddress, isHex } from 'viem';
import { GnosisSafeL2 } from '../../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';
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
  fractalModuleMasterCopyContract: FractalModule,
  zodiacModuleProxyFactoryContract: ModuleProxyFactory,
  safeContract: GnosisSafeL2,
  saltNum: bigint,
  parentAddress?: string,
): FractalModuleData => {
  const fractalModuleCalldata = FractalModule__factory.createInterface().encodeFunctionData(
    'setUp',
    [
      encodeAbiParameters(parseAbiParameters(['address, address, address, address[]']), [
        getAddress(parentAddress ?? safeContract.address), // Owner -- Parent DAO or safe contract
        getAddress(safeContract.address), // Avatar
        getAddress(safeContract.address), // Target
        [], // Authorized Controllers
      ]),
    ],
    abi: fractalModuleMasterCopyContract.abi,
  });

  if (!isHex(fractalModuleCalldata)) {
    throw new Error('Error encoding fractal module call data');
  }

  const fractalByteCodeLinear = generateContractByteCodeLinear(
    getAddress(fractalModuleMasterCopyContract.address),
  );

  const fractalSalt = generateSalt(fractalModuleCalldata, BigInt(saltNum));
  const deployFractalModuleTx = buildDeployZodiacModuleTx(zodiacModuleProxyFactoryContract, [
    fractalModuleMasterCopyContract.address,
    fractalModuleCalldata,
    saltNum,
  ]);
  const predictedFractalModuleAddress = generatePredictedModuleAddress(
    getAddress(zodiacModuleProxyFactoryContract.address),
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
