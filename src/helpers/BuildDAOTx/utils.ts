
// Prefix and postfix strings come from Zodiac contracts
import { solidityKeccak256 } from "ethers/lib/utils";

export const generateContractByteCodeLinear = (contractAddress: string): string => {
  return '0x602d8060093d393df3363d3d373d3d3d363d73' +
  contractAddress +
  '5af43d82803e903d91602b57fd5bf3'
}

export const generateSalt = (calldata: string, saltNum: string): string => {
  return solidityKeccak256(
    ['bytes32', 'uint256'],
    [solidityKeccak256(['bytes'], [calldata]), saltNum]
  )
}