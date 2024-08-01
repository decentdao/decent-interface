import { Address, Hex, PublicClient, encodePacked, getContract, keccak256, toHex } from 'viem';
import ERC6551RegistryAbi from '../assets/abi/ERC6551RegistryAbi';
import { RoleValue } from '../components/pages/Roles/types';
import { getRandomBytes } from './crypto';

export const predictHatId = ({ adminHatId, hatsCount }: { adminHatId: Hex; hatsCount: number }) => {
  // 1 byte = 8 bits = 2 string characters
  const adminLevelBinary = adminHatId.slice(0, 14); // Top Admin ID 1 byte 0x + 4 bytes (tree ID) + next **16 bits** (admin level ID)

  // Each next level is next **16 bits**
  // Since we're operating only with direct child of top level admin - we don't care about nested levels
  // @dev At least for now?
  const newSiblingId = (hatsCount + 1).toString(16).padStart(4, '0');

  // Total length of Hat ID is **32 bytes** + 2 bytes for 0x
  return BigInt(`${adminLevelBinary}${newSiblingId}`.padEnd(66, '0'));
};

interface PredictAccountParams {
  implementation: Address;
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
  registryAddress: Address;
  publicClient: PublicClient;
  decentHats: Address;
}

export function getERC6551RegistrySalt(chainId: bigint, decentHats: Address) {
  return keccak256(
    encodePacked(['string', 'uint256', 'address'], ['DecentHats_0_1_0', chainId, decentHats]),
  );
}

export const predictAccountAddress = (params: PredictAccountParams) => {
  const {
    implementation,
    chainId,
    tokenContract,
    tokenId,
    registryAddress,
    publicClient,
    decentHats,
  } = params;

  const erc6551RegistryContract = getContract({
    abi: ERC6551RegistryAbi,
    address: registryAddress,
    client: publicClient,
  });

  if (!publicClient.chain) {
    throw new Error('Public client needs to be on a chain');
  }

  const salt = getERC6551RegistrySalt(chainId, decentHats);

  return erc6551RegistryContract.read.account([
    implementation,
    salt,
    chainId,
    tokenContract,
    tokenId,
  ]);
};

export async function getNewRole({
  adminHatId,
  hatsCount,
  chainId,
  publicClient,
  implementation,
  tokenContract,
  registryAddress,
  decentHats,
}: {
  adminHatId?: Hex;
  hatsCount: number;
} & Omit<PredictAccountParams, 'tokenId'>): Promise<RoleValue> {
  // @dev creates a unique id for the hat for new hats for use in form, not stored on chain
  const id = adminHatId
    ? toHex(predictHatId({ adminHatId, hatsCount }))
    : toHex(getRandomBytes(), { size: 32 });
  return {
    id,
    wearer: '',
    name: '',
    description: '',
    prettyId: '',
    smartAddress: await predictAccountAddress({
      implementation,
      chainId: BigInt(chainId),
      tokenContract,
      tokenId: BigInt(id),
      registryAddress,
      publicClient,
      decentHats,
    }),
  };
}
