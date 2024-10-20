import { Tree, Hat } from '@hatsprotocol/sdk-v1-subgraph';
import { Address, Hex, PublicClient, getAddress, getContract } from 'viem';
import ERC6551RegistryAbi from '../../assets/abi/ERC6551RegistryAbi';
import { HatsElectionsEligibilityAbi } from '../../assets/abi/HatsElectionsEligibilityAbi';
import { SablierPayment } from '../../components/pages/Roles/types';
import { ERC6551_REGISTRY_SALT } from '../../constants/common';

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
}

interface DecentHat {
  id: Hex;
  prettyId: string;
  name: string;
  description: string;
  smartAddress: Address;
  eligibility?: `0x${string}`;
  payments?: SablierPayment[];
}

interface DecentTopHat extends DecentHat {}

interface DecentAdminHat extends DecentHat {
  wearer?: Address;
}

interface RolesStoreData {
  hatsTreeId: undefined | null | number;
  decentHatsAddress: Address | null | undefined;
  hatsTree: undefined | null | DecentTree;
  streamsFetched: boolean;
  contextChainId: number | null;
}

export interface DecentRoleHat extends DecentHat {
  wearer: Address;
  eligibility?: `0x${string}`;
  roleTerms: { nominee: Address; termEndDate: Date; termNumber: number }[];
  isTermed: boolean;
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
  decentHatsAddress: undefined,
  streamsFetched: false,
  contextChainId: null,
};

export const predictAccountAddress = async (params: PredictAccountParams) => {
  const { implementation, chainId, tokenContract, tokenId, registryAddress, publicClient } = params;

  const erc6551RegistryContract = getContract({
    abi: ERC6551RegistryAbi,
    address: registryAddress,
    client: publicClient,
  });

  return erc6551RegistryContract.read.account([
    implementation,
    ERC6551_REGISTRY_SALT,
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
  });

  const adminHat: DecentAdminHat = {
    id: rawAdminHat.id,
    prettyId: rawAdminHat.prettyId ?? '',
    name: adminHatMetadata.name,
    description: adminHatMetadata.description,
    smartAddress: adminHatSmartAddress,
    wearer: rawAdminHat.wearers?.length ? rawAdminHat.wearers[0].id : undefined,
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
    });
    let roleTerms: {
      nominee: Address;
      termEndDate: Date;
      termNumber: number;
    }[] = [];
    let isTermed: boolean = false;
    if (rawHat.eligibility) {
      // @dev check if the eligibility is an election contract
      try {
        const electionContract = getContract({
          abi: HatsElectionsEligibilityAbi,
          address: rawHat.eligibility,
          client: publicClient,
        });
        const rawTerms = await electionContract.getEvents.ElectionCompleted({
          fromBlock: 0n,
        });
        roleTerms = rawTerms
          .map(term => {
            const nominee = term.args.winners?.[0];
            const termEnd = term.args.termEnd;
            if (!nominee) {
              throw new Error('No nominee in the election');
            }
            if (!termEnd) {
              throw new Error('No term end in the election');
            }
            return {
              nominee: getAddress(nominee),
              termEndDate: new Date(Number(termEnd.toString()) * 1000),
            };
          })
          .sort(
            (a, b) =>
              (a.termEndDate ?? new Date()).getTime() - (b.termEndDate ?? new Date()).getTime(),
          )
          .map((term, index) => ({ ...term, termNumber: index + 1 }));
        isTermed = true;
      } catch {
        console.error('Failed to get election terms or not a valid election contract');
      }
    }
    roleHats.push({
      id: rawHat.id,
      prettyId: rawHat.prettyId ?? '',
      name: hatMetadata.name,
      description: hatMetadata.description,
      wearer: rawHat.wearers![0].id,
      smartAddress: roleHatSmartAddress,
      eligibility: rawHat.eligibility,
      roleTerms,
      isTermed,
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

export const isActive = (payment: { isCancelled?: boolean; endDate?: Date }) => {
  const now = new Date();
  // A payment is active if it's not cancelled and its end date is in the future (or it doesn't have an end date yet)
  return !payment.isCancelled && (payment.endDate === undefined || payment.endDate > now);
};

export const paymentSorterByActiveStatus = (
  a: { isCancelled?: boolean; endDate?: Date },
  b: { isCancelled?: boolean; endDate?: Date },
) => {
  const aIsActive = isActive(a);
  const bIsActive = isActive(b);

  if (aIsActive && !bIsActive) {
    return -1; // 'a' is active and should come first
  }
  if (!aIsActive && bIsActive) {
    return 1; // 'b' is active and should come first
  }

  // If both are active or both inactive, maintain the current order
  return 0;
};
export const paymentSorterByStartDate = (a: { startDate?: Date }, b: { startDate?: Date }) => {
  if (!a?.startDate) return 1; // No start date, move this payment last
  if (!b?.startDate) return -1; // No start date, move b last

  return a.startDate.getTime() - b.startDate.getTime(); // Sort by earliest start date
};

export const paymentSorterByWithdrawAmount = (
  a: { withdrawableAmount?: bigint },
  b: { withdrawableAmount?: bigint },
) => {
  if (!a?.withdrawableAmount) return 1; // No withdrawable amount, move this payment last
  if (!b?.withdrawableAmount) return -1;

  return Number(a.withdrawableAmount - b.withdrawableAmount); // Sort by amount
};
