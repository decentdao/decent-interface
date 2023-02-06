import {
  FractalModule,
  FractalModule__factory,
  GnosisSafe,
  ModuleProxyFactory,
} from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { generateContractByteCodeLinear, generateSalt } from "./utils";
import { buildContractCall } from "../crypto";
import { SafeTransaction } from "../../types";

export interface FractalModuleData {
  predictedFractalModuleAddress: string;
  deployFractalModuleTx: SafeTransaction;
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
  const deployFractalModuleTx = buildContractCall(
    zodiacModuleProxyFactoryContract,
    'deployModule',
    [fractalModuleMasterCopyContract.address, fractalModuleCalldata, saltNum],
    0,
    false
  );

  return {
    predictedFractalModuleAddress: getCreate2Address(
      zodiacModuleProxyFactoryContract.address,
      fractalSalt,
      solidityKeccak256(['bytes'], [fractalByteCodeLinear])
    ),
    deployFractalModuleTx,
  };
};
