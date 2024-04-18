// Prefix and postfix strings come from Zodiac contracts
import { ModuleProxyFactory } from '@fractal-framework/fractal-contracts';
import { Address, Hash, getCreate2Address, keccak256, encodePacked } from 'viem';
import { buildContractCall } from '../../helpers/crypto';
import { SafeTransaction } from '../../types';

/**
 * These hardcoded values were taken from
 * @link https://github.com/gnosis/module-factory/blob/master/contracts/ModuleProxyFactory.sol
 */
export const generateContractByteCodeLinear = (contractAddress: Address): Hash => {
  return ('0x602d8060093d393df3363d3d373d3d3d363d73' +
    contractAddress +
    '5af43d82803e903d91602b57fd5bf3') as Hash;
};

export const generateSalt = (calldata: Hash, saltNum: string): Hash => {
  return keccak256(
    encodePacked(
      ['bytes32', 'uint256'],
      [keccak256(encodePacked(['bytes'], [calldata])), saltNum as unknown as bigint],
    ),
  );
};

export const generatePredictedModuleAddress = (
  zodiacProxyAddress: Address,
  salt: Hash,
  byteCode: Hash,
): Address => {
  return getCreate2Address({
    from: zodiacProxyAddress,
    salt,
    bytecodeHash: keccak256(encodePacked(['bytes'], [byteCode])),
  });
};

export const buildDeployZodiacModuleTx = (
  zodiacProxyFactoryContract: ModuleProxyFactory,
  params: string[],
): SafeTransaction => {
  return buildContractCall(zodiacProxyFactoryContract, 'deployModule', params, 0, false);
};
