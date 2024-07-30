import { Tree, Hat } from '@hatsprotocol/sdk-v1-subgraph';
import { Address, Hex, PublicClient, encodePacked, getContract, keccak256 } from 'viem';
import { create } from 'zustand';
import ERC6551RegistryAbi from '../assets/abi/ERC6551RegistryAbi';
import { SablierPayment } from '../components/pages/Roles/types';

export class DecentHatsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecentHatsError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DecentHatsError);
    }
  }
}

interface PredictAccountParams {
  implementation: Address;
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
  registryAddress: Address;
  publicClient: PublicClient;
  decentHats: Address;
}

const predictAccountAddress = (params: PredictAccountParams) => {
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

  const salt = keccak256(
    encodePacked(
      ['string', 'uint256', 'address'],
      ['DecentHats_0_1_0', BigInt(publicClient.chain.id), decentHats],
    ),
  );

  return erc6551RegistryContract.read.account([
    implementation,
    salt,
    chainId,
    tokenContract,
    tokenId,
  ]);
};

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

export interface DecentRoleHat extends DecentHat {
  wearer: Address;
}

export interface DecentTree {
  topHat: DecentTopHat;
  adminHat: DecentAdminHat;
  roleHats: DecentRoleHat[];
  roleHatsTotalCount: number;
}

interface Roles {
  hatsTreeId: undefined | null | number;
  hatsTree: undefined | null | DecentTree;
  streamsFetched: boolean;
  getHat: (hatId: Hex) => DecentRoleHat | null;
  setHatsTreeId: (hatsTreeId: undefined | null | number) => void;
  setHatsTree: (params: {
    hatsTree: Tree | null | undefined;
    chainId: bigint;
    hatsProtocol: Address;
    erc6551Registry: Address;
    hatsAccountImplementation: Address;
    publicClient: PublicClient;
    decentHats: Address;
  }) => Promise<void>;
  setHatsStreams: (updatedDecentTree: DecentTree) => void;
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

const sanitize = async (
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

const useRolesState = create<Roles>()((set, get) => ({
  hatsTreeId: undefined,
  hatsTree: undefined,
  streamsFetched: false,
  getHat: hatId => {
    const matches = get().hatsTree?.roleHats.filter(h => h.id === hatId);

    if (matches === undefined || matches.length === 0) {
      return null;
    }

    if (matches.length > 1) {
      throw new Error('multiple hats with the same ID');
    }

    return matches[0];
  },
  setHatsTreeId: hatsTreeId =>
    set(() => {
      // if `hatsTreeId` is null or undefined,
      // set `hatsTree` to that same value
      if (typeof hatsTreeId !== 'number') {
        return { hatsTreeId, hatsTree: hatsTreeId, streamsFetched: false };
      }
      return { hatsTreeId, streamsFetched: false };
    }),
  setHatsTree: async params => {
    const hatsTree = await sanitize(
      params.hatsTree,
      params.hatsAccountImplementation,
      params.erc6551Registry,
      params.hatsProtocol,
      params.chainId,
      params.publicClient,
      params.decentHats,
    );
    set(() => ({ hatsTree }));
  },
  setHatsStreams: updatedDecentTree => {
    set(() => ({ hatsTree: updatedDecentTree, streamsFetched: true }));
  },
}));

export { useRolesState };
