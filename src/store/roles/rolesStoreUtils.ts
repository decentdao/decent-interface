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

interface DecentHat {
  id: Hex;
  prettyId: string;
  name: string;
  description: string;
  smartAddress: Address;
  eligibility?: Address;
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
  wearerAddress: Address;
  eligibility?: Address;
  roleTerms: { nominee: Address; termEndDate: Date; termNumber: number }[];
  isTermed: boolean;
}

export interface DecentTree {
  topHat: DecentTopHat;
  adminHat: DecentAdminHat;
  roleHats: DecentRoleHat[];
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

export const predictAccountAddress = async (params: {
  implementation: Address;
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
  registryAddress: Address;
  publicClient: PublicClient;
}) => {
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

const getRoleHatTerms = async (rawHat: Hat, publicClient: PublicClient) => {
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
        .sort((a, b) => a.termEndDate.getTime() - b.termEndDate.getTime())
        .map((term, index) => ({ ...term, termNumber: index + 1 }));
      isTermed = true;
    } catch {
      console.error('Failed to get election terms or not a valid election contract');
    }
  }

  return { roleTerms, isTermed };
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

  let roleHats: DecentRoleHat[] = [];

  for (const rawHat of hatsTree.hats) {
    if (
      !appearsExactlyNumberOfTimes(rawHat.prettyId, '.', 2) ||
      rawHat.status !== true ||
      !rawHat.wearers ||
      rawHat.wearers.length !== 1
    ) {
      // Ignore hats that do not
      // - exist as a child of the Admin Hat
      // - are not active
      // - have exactly one wearer
      continue;
    }

    const hatMetadata = getHatMetadata(rawHat);
    const roleHatSmartAddress = await predictAccountAddress({
      implementation: hatsAccountImplementation,
      registryAddress: erc6551Registry,
      tokenContract: hats,
      chainId,
      tokenId: BigInt(rawHat.id),
      publicClient,
    });
    const { roleTerms, isTermed } = await getRoleHatTerms(rawHat, publicClient);

    roleHats.push({
      id: rawHat.id,
      prettyId: rawHat.prettyId ?? '',
      name: hatMetadata.name,
      description: hatMetadata.description,
      wearerAddress: getAddress(rawHat.wearers[0].id),
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
  };

  return decentTree;
};

export const paymentSorterByActiveStatus = (
  a: { isCancelled?: boolean; endDate?: Date },
  b: { isCancelled?: boolean; endDate?: Date },
) => {
  const isActive = (payment: { isCancelled?: boolean; endDate?: Date }) => {
    const now = new Date();
    // A payment is active if it's not cancelled and its end date is in the future (or it doesn't have an end date yet)
    return !payment.isCancelled && (payment.endDate === undefined || payment.endDate > now);
  };

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
