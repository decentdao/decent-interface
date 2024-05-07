import { FractalModule, FractalModule__factory } from '@fractal-framework/fractal-contracts';
import {
  encodeAbiParameters,
  parseAbiParameters,
  getAddress,
  isHex,
  Address,
  getCreate2Address,
  keccak256,
  encodePacked,
} from 'viem';
import ModuleProxyFactoryAbi from '../../assets/abi/ModuleProxyFactory';
import { GnosisSafeL2 } from '../../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';
import { buildContractCall, buildContractCallViem } from '../../helpers/crypto';
import { SafeTransaction } from '../../types';
import { generateContractByteCodeLinear, generateSalt } from './utils';

export interface FractalModuleData {
  predictedFractalModuleAddress: string;
  deployFractalModuleTx: SafeTransaction;
  enableFractalModuleTx: SafeTransaction;
}

export const fractalModuleData = (
  fractalModuleMasterCopyContract: FractalModule,
  moduleProxyFactoryAddress: Address,
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
  );

  if (!isHex(fractalModuleCalldata)) {
    throw new Error('Error encoding fractal module call data');
  }

  const fractalByteCodeLinear = generateContractByteCodeLinear(
    getAddress(fractalModuleMasterCopyContract.address),
  );

  const fractalSalt = generateSalt(fractalModuleCalldata, saltNum);

  const deployFractalModuleTx = buildContractCallViem(
    ModuleProxyFactoryAbi,
    moduleProxyFactoryAddress,
    'deployModule',
    [fractalModuleMasterCopyContract.address, fractalModuleCalldata, saltNum],
    0,
    false,
  );

  const predictedFractalModuleAddress = getCreate2Address({
    from: moduleProxyFactoryAddress,
    salt: fractalSalt,
    bytecodeHash: keccak256(encodePacked(['bytes'], [fractalByteCodeLinear])),
  });

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
