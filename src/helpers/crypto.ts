import { ethers } from 'ethers';

export function getRandomSalt() {
  return ethers.utils.formatBytes32String(
    self.crypto.getRandomValues(new BigUint64Array(1))[0].toString()
  );
}

/**
 * Gets the predicatedAddress of module to be created.
 * @param fromAddress module factory address that will create module
 * @param saltData [creator, caller (metafactory address), chaindId, randomSalt]
 * @param proxyBytecode ERC1967Proxy__factory.bytecode. Matches with smart contract ERC1967Proxy version with typechain-types of module.
 * // @todo Define initCodeBytes
 * @param initCodeBytes initCode encoded
 * @returns
 */
export function getPredicatedAddress(
  fromAddress: string,
  saltData: [creator: string, caller: string, chainId: number, salt: string],
  proxyBytecode: string,
  initCodeBytes: string
) {
  return ethers.utils.getCreate2Address(
    fromAddress,
    ethers.utils.solidityKeccak256(['address', 'address', 'uint256', 'bytes32'], saltData),
    ethers.utils.solidityKeccak256(['bytes', 'bytes'], [proxyBytecode, initCodeBytes])
  );
}
