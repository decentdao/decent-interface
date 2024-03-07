// Prefix and postfix strings come from Zodiac contracts
import { ModuleProxyFactory } from '@fractal-framework/fractal-contracts';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { buildContractCall } from '../../helpers/crypto';
import { SafeTransaction } from '../../types';

/**
 * These hardcoded values were taken from
 * @link https://github.com/gnosis/module-factory/blob/master/contracts/ModuleProxyFactory.sol
 */
export const generateContractByteCodeLinear = (contractAddress: string): string => {
  return (
    '0x602d8060093d393df3363d3d373d3d3d363d73' + contractAddress + '5af43d82803e903d91602b57fd5bf3'
  );
};

export const generateSalt = (calldata: string, saltNum: string): string => {
  return solidityKeccak256(
    ['bytes32', 'uint256'],
    [solidityKeccak256(['bytes'], [calldata]), saltNum],
  );
};

export const generatePredictedModuleAddress = (
  zodiacProxyAddress: string,
  salt: string,
  byteCode: string,
): string => {
  return getCreate2Address(zodiacProxyAddress, salt, solidityKeccak256(['bytes'], [byteCode]));
};

export const buildDeployZodiacModuleTx = (
  zodiacProxyFactoryContract: ModuleProxyFactory,
  params: string[],
): SafeTransaction => {
  return buildContractCall(zodiacProxyFactoryContract, 'deployModule', params, 0, false);
};
