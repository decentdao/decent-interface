import {
  FractalModule,
  FractalModule__factory,
  ModuleProxyFactory,
} from '@fractal-framework/fractal-contracts';
import { Address, Hash, encodeAbiParameters, parseAbiParameters } from 'viem';
import { GnosisSafeL2 } from '../../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';
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
  safeContract: GnosisSafeL2,
  saltNum: string,
  parentAddress?: string,
): FractalModuleData => {
  const fractalModuleCalldata = FractalModule__factory.createInterface().encodeFunctionData(
    'setUp',
    [
      encodeAbiParameters(parseAbiParameters(['address, address, address, address[]']), [
        (parentAddress ?? safeContract.address) as Address, // Owner -- Parent DAO or safe contract
        safeContract.address as Address, // Avatar
        safeContract.address as Address, // Target
        [], // Authorized Controllers
      ]),
    ],
  ) as Hash;

  const fractalByteCodeLinear = generateContractByteCodeLinear(
    fractalModuleMasterCopyContract.address.slice(2) as Address,
  );

  const fractalSalt = generateSalt(fractalModuleCalldata, saltNum);
  const deployFractalModuleTx = buildDeployZodiacModuleTx(zodiacModuleProxyFactoryContract, [
    fractalModuleMasterCopyContract.address,
    fractalModuleCalldata,
    saltNum,
  ]);
  const predictedFractalModuleAddress = generatePredictedModuleAddress(
    zodiacModuleProxyFactoryContract.address as Address,
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
