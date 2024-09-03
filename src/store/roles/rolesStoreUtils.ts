import { Tree, Hat } from '@hatsprotocol/sdk-v1-subgraph';
import { Address, Hex, PublicClient, encodePacked, getContract, keccak256 } from 'viem';
import ERC6551RegistryAbi from '../../assets/abi/ERC6551RegistryAbi';
import { SablierPayment } from '../../components/pages/Roles/types';

export class DecentHatsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecentHatsError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DecentHatsError);
    }
  }
}

export interface PredictAccountParams {
  implementation: Address;
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
  registryAddress: Address;
  publicClient: PublicClient;
  decentHats: Address;
}

interface DecentHat {
  id: Hex;
  prettyId: string;
  name: string;
  description: string;
  smartAddress: Address;
  payments?: SablierPayment[];
}

interface DecentTopHat extends DecentHat {}

interface DecentAdminHat extends DecentHat {}

interface RolesStoreData {
  hatsTreeId: undefined | null | number;
  hatsTree: undefined | null | DecentTree;
  streamsFetched: boolean;
  contextChainId: number | null;
}

export interface DecentRoleHat extends DecentHat {
  wearer: Address;
}

export interface DecentTree {
  topHat: DecentTopHat;
  adminHat: DecentAdminHat;
  roleHats: DecentRoleHat[];
  roleHatsTotalCount: number;
}

export interface RolesStore extends RolesStoreData {
  getHat: (hatId: Hex) => DecentRoleHat | null;
  getPayment: (hatId: Hex, streamId: string) => SablierPayment | null;
  setHatsTreeId: (args: { contextChainId: number | null; hatsTreeId?: number | null }) => void;
  setHatsTree: (params: {
    hatsTree: Tree | null | undefined;
    chainId: bigint;
    hatsProtocol: Address;
    erc6551Registry: Address;
    hatsAccountImplementation: Address;
    publicClient: PublicClient;
    decentHats: Address;
  }) => Promise<void>;
  refreshWithdrawableAmount: (hatId: Hex, streamId: string, publicClient: PublicClient) => void;
  updateRolesWithStreams: (updatedRolesWithStreams: DecentRoleHat[]) => void;
  resetHatsStore: () => void;
}

const appearsExactlyNumberOfTimes = (
  str: string | undefined,
  char: string,
  count: number,
): boolean => {
  if (str === undefined) {
    return false;
  }

  let occurrences = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === char) {
      occurrences++;
    }
  }

  return occurrences === count;
};

const getRawTopHat = (hats: Hat[]) => {
  const potentialRawTopHats = hats.filter(h => appearsExactlyNumberOfTimes(h.prettyId, '.', 0));

  if (potentialRawTopHats.length === 0) {
    throw new DecentHatsError('Top Hat is missing');
  }

  if (potentialRawTopHats.length > 1) {
    throw new DecentHatsError('Too many Top Hats');
  }

  return potentialRawTopHats[0];
};

const getRawAdminHat = (hats: Hat[]) => {
  const potentialRawAdminHats = hats.filter(h => appearsExactlyNumberOfTimes(h.prettyId, '.', 1));

  if (potentialRawAdminHats.length === 0) {
    throw new DecentHatsError('Admin Hat is missing');
  }

  if (potentialRawAdminHats.length > 1) {
    throw new DecentHatsError('Too many Admin Hats');
  }

  return potentialRawAdminHats[0];
};

const getHatMetadata = (hat: Hat) => {
  const metadata = {
    name: '',
    description: '',
  };

  if (hat.details) {
    try {
      // At this stage hat.details should be not IPFS hash but stringified data from the IPFS
      const parsedDetails = JSON.parse(hat.details);
      metadata.name = parsedDetails.data.name;
      metadata.description = parsedDetails.data.description;
    } catch (e) {}
  }

  return metadata;
};

export const initialHatsStore: RolesStoreData = {
  hatsTreeId: undefined,
  hatsTree: undefined,
  streamsFetched: false,
  contextChainId: null,
};

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

  const salt = getERC6551RegistrySalt(chainId, decentHats);

  return erc6551RegistryContract.read.account([
    implementation,
    salt,
    chainId,
    tokenContract,
    tokenId,
  ]);
};

export const sanitize = async (
  hatsTree: undefined | null | Tree,
  hatsAccountImplementation: Address,
  erc6551Registry: Address,
  hats: Address,
  chainId: bigint,
  publicClient: PublicClient,
  decentHats: Address,
): Promise<undefined | null | DecentTree> => {
  if (hatsTree === undefined || hatsTree === null) {
    return hatsTree;
  }

  if (hatsTree.hats === undefined || hatsTree.hats.length === 0) {
    throw new DecentHatsError("Hats Tree doesn't have any Hats");
  }

  const rawTopHat = getRawTopHat(hatsTree.hats);
  const topHatMetadata = getHatMetadata(rawTopHat);

  const topHatSmartAddress = await predictAccountAddress({
    implementation: hatsAccountImplementation,
    registryAddress: erc6551Registry,
    tokenContract: hats,
    chainId,
    tokenId: BigInt(rawTopHat.id),
    publicClient,
    decentHats,
  });

  const topHat: DecentHat = {
    id: rawTopHat.id,
    prettyId: rawTopHat.prettyId ?? '',
    name: topHatMetadata.name,
    description: topHatMetadata.description,
    smartAddress: topHatSmartAddress,
  };

  const rawAdminHat = getRawAdminHat(hatsTree.hats);

  const adminHatMetadata = getHatMetadata(rawAdminHat);
  const adminHatSmartAddress = await predictAccountAddress({
    implementation: hatsAccountImplementation,
    registryAddress: erc6551Registry,
    tokenContract: hats,
    chainId,
    tokenId: BigInt(rawAdminHat.id),
    publicClient,
    decentHats,
  });

  const adminHat: DecentHat = {
    id: rawAdminHat.id,
    prettyId: rawAdminHat.prettyId ?? '',
    name: adminHatMetadata.name,
    description: adminHatMetadata.description,
    smartAddress: adminHatSmartAddress,
  };

  const rawRoleHats = hatsTree.hats.filter(h => appearsExactlyNumberOfTimes(h.prettyId, '.', 2));

  const rawRoleHatsPruned = rawRoleHats
    .filter(rawHat => rawHat.status === true)
    .filter(h => h.wearers !== undefined && h.wearers.length === 1);

  let roleHats: DecentRoleHat[] = [];

  for (const rawHat of rawRoleHatsPruned) {
    const hatMetadata = getHatMetadata(rawHat);
    const roleHatSmartAddress = await predictAccountAddress({
      implementation: hatsAccountImplementation,
      registryAddress: erc6551Registry,
      tokenContract: hats,
      chainId,
      tokenId: BigInt(rawHat.id),
      publicClient,
      decentHats,
    });

    roleHats.push({
      id: rawHat.id,
      prettyId: rawHat.prettyId ?? '',
      name: hatMetadata.name,
      description: hatMetadata.description,
      wearer: rawHat.wearers![0].id,
      smartAddress: roleHatSmartAddress,
    });
  }

  const decentTree: DecentTree = {
    topHat,
    adminHat,
    roleHats,
    roleHatsTotalCount: rawRoleHats.length,
  };

  return decentTree;
};

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
