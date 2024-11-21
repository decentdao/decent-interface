import { abis } from '@fractal-framework/fractal-contracts';
import { HatsModulesClient } from '@hatsprotocol/modules-sdk';
import { Hat, Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { Address, Hex, PublicClient, getAddress, getContract } from 'viem';
import ERC6551RegistryAbi from '../../assets/abi/ERC6551RegistryAbi';
import { HatsElectionsEligibilityAbi } from '../../assets/abi/HatsElectionsEligibilityAbi';
import { ERC6551_REGISTRY_SALT } from '../../constants/common';
import {
  DecentAdminHat,
  DecentHat,
  DecentRoleHat,
  DecentRoleHatTerms,
  DecentTree,
  RolesStoreData,
} from '../../types/roles';

export class DecentHatsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecentHatsError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DecentHatsError);
    }
  }
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
  hatIdsToStreamIds: [],
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
  const predictedAddress = await erc6551RegistryContract.read.account([
    implementation,
    ERC6551_REGISTRY_SALT,
    chainId,
    tokenContract,
    tokenId,
  ]);
  if (!(await publicClient.getBytecode({ address: predictedAddress }))) {
    throw new DecentHatsError('Predicted address is not a contract');
  }
  return predictedAddress;
};

export const getCurrentTermActiveStatus = async (
  currentTermEndDateTs: bigint,
  eligibility: Address,
  publicClient: PublicClient,
): Promise<boolean> => {
  const electionContract = getContract({
    abi: HatsElectionsEligibilityAbi,
    address: eligibility,
    client: publicClient,
  });

  const nextTermEndTs = await electionContract.read.nextTermEnd();
  return nextTermEndTs !== currentTermEndDateTs;
};

export const isElectionEligibilityModule = async (
  eligibility: Address | undefined,
  hatsElectionsImplementation: Address,
  publicClient: PublicClient,
) => {
  if (eligibility === undefined) return false;

  const hatsModuleClient = new HatsModulesClient({
    publicClient,
  });
  await hatsModuleClient.prepare();

  const possibleElectionModule = await hatsModuleClient.getModuleByInstance(eligibility);
  if (possibleElectionModule === undefined) return false;
  return possibleElectionModule.implementationAddress === hatsElectionsImplementation;
};

export const prepareCurrentTerm = async (
  term: { nominee: Address; termEndDate: Date; termNumber: number } | undefined,
  eligibility: Address,
  publicClient: PublicClient,
) => {
  if (term === undefined) return undefined;
  return {
    ...term,
    isActive: await getCurrentTermActiveStatus(
      BigInt(term.termEndDate.getTime()),
      eligibility,
      publicClient,
    ),
  };
};

const getRoleHatTerms = async (
  rawHat: Hat,
  hatsElectionsImplementation: Address,
  publicClient: PublicClient,
): Promise<{
  roleTerms: DecentRoleHatTerms;
  isTermed: boolean;
}> => {
  if (
    rawHat.eligibility &&
    (await isElectionEligibilityModule(
      rawHat.eligibility,
      hatsElectionsImplementation,
      publicClient,
    ))
  ) {
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
      const allTerms = rawTerms
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

      const activeTerms = allTerms.filter(
        term => term.termEndDate.getTime() > new Date().getTime(),
      );
      const roleTerms = {
        allTerms,
        currentTerm: await prepareCurrentTerm(activeTerms[0], rawHat.eligibility, publicClient),
        nextTerm: activeTerms[1],
        expiredTerms: allTerms
          .filter(term => term.termEndDate <= new Date())
          .sort((a, b) => {
            if (!a.termEndDate || !b.termEndDate) {
              return 0;
            }
            return b.termEndDate.getTime() - a.termEndDate.getTime();
          }),
      };
      return { roleTerms, isTermed: true };
    } catch {
      console.error('Failed to get election terms or not a valid election contract');
    }
  }
  return {
    roleTerms: { allTerms: [], currentTerm: undefined, nextTerm: undefined, expiredTerms: [] },
    isTermed: false,
  };
};

export const sanitize = async (
  hatsTree: undefined | null | Tree,
  hatsAccountImplementation: Address,
  hatsElectionsImplementation: Address,
  erc6551Registry: Address,
  hats: Address,
  chainId: bigint,
  publicClient: PublicClient,
  whitelistingVotingStrategy?: Address,
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

  const whitelistingVotingContract = whitelistingVotingStrategy
    ? getContract({
        abi: abis.LinearERC20VotingWithHatsProposalCreation,
        address: whitelistingVotingStrategy,
        client: publicClient,
      })
    : undefined;
  let whitelistedHatsIds: bigint[] = [];
  if (whitelistingVotingContract) {
    whitelistedHatsIds = [...(await whitelistingVotingContract.read.getWhitelistedHatIds())];
  }

  const topHat: DecentHat = {
    id: rawTopHat.id,
    prettyId: rawTopHat.prettyId ?? '',
    name: topHatMetadata.name,
    description: topHatMetadata.description,
    smartAddress: topHatSmartAddress,
    canCreateProposals: false, // @dev - we don't care about it since topHat is not displayed
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
    canCreateProposals: false, // @dev - we don't care about it since adminHat is not displayed
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

    const tokenId = BigInt(rawHat.id);
    const hatMetadata = getHatMetadata(rawHat);
    const { roleTerms, isTermed } = await getRoleHatTerms(
      rawHat,
      hatsElectionsImplementation,
      publicClient,
    );
    let roleHatSmartAccountAddress: Address | undefined;
    if (!isTermed) {
      roleHatSmartAccountAddress = await predictAccountAddress({
        implementation: hatsAccountImplementation,
        registryAddress: erc6551Registry,
        tokenContract: hats,
        chainId,
        tokenId: BigInt(rawHat.id),
        publicClient,
      });
    }

    let canCreateProposals = false;
    if (whitelistingVotingContract) {
      canCreateProposals = whitelistedHatsIds.includes(tokenId);
    }

    roleHats.push({
      id: rawHat.id,
      prettyId: rawHat.prettyId ?? '',
      name: hatMetadata.name,
      description: hatMetadata.description,
      wearerAddress: getAddress(rawHat.wearers[0].id),
      smartAddress: roleHatSmartAccountAddress,
      eligibility: rawHat.eligibility,
      roleTerms,
      isTermed,
      canCreateProposals,
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
