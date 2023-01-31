import {
  FractalModule,
  FractalModule__factory,
  GnosisSafe,
  ModuleProxyFactory,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';

export interface FractalModuleData {
  predictedFractalModuleAddress: string;
  fractalModuleCalldata: string;
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

  const fractalByteCodeLinear =
    '0x602d8060093d393df3363d3d373d3d3d363d73' +
    fractalModuleMasterCopyContract.address.slice(2) +
    '5af43d82803e903d91602b57fd5bf3';

  const fractalSalt = solidityKeccak256(
    ['bytes32', 'uint256'],
    [solidityKeccak256(['bytes'], [fractalModuleCalldata]), saltNum]
  );

  return {
    predictedFractalModuleAddress: getCreate2Address(
      zodiacModuleProxyFactoryContract.address,
      fractalSalt,
      solidityKeccak256(['bytes'], [fractalByteCodeLinear])
    ),
    fractalModuleCalldata,
  };
};
