import { Tree, Hat } from '@hatsprotocol/sdk-v1-subgraph';
import { Address, Hex } from 'viem';
import { create } from 'zustand';

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
}

interface DecentTopHat extends DecentHat {}

interface DecentAdminHat extends DecentHat {}

export interface DecentRoleHat extends DecentHat {
  wearer: Address;
}

interface DecentTree {
  topHat: DecentTopHat;
  adminHat: DecentAdminHat;
  roleHats: DecentRoleHat[];
  roleHatsTotalCount: number;
}

interface Roles {
  hatsTreeId: undefined | null | number;
  hatsTree: undefined | null | DecentTree;
  getHat: (hatId: Hex) => DecentHat | null;
  setHatsTreeId: (hatsTreeId: undefined | null | number) => void;
  setHatsTree: (hatsTree: undefined | null | Tree) => void;
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

const sanitize = (hatsTree: undefined | null | Tree): undefined | null | DecentTree => {
  if (hatsTree === undefined || hatsTree === null) {
    return hatsTree;
  }

  if (hatsTree.hats === undefined || hatsTree.hats.length === 0) {
    throw new DecentHatsError("Hats Tree doesn't have any Hats");
  }

  const rawTopHat = getRawTopHat(hatsTree.hats);
  const topHatMetadata = getHatMetadata(rawTopHat);

  const topHat: DecentHat = {
    id: rawTopHat.id,
    prettyId: rawTopHat.prettyId ?? '',
    name: topHatMetadata.name,
    description: topHatMetadata.description,
  };

  const rawAdminHat = getRawAdminHat(hatsTree.hats);

  const adminHatMetadata = getHatMetadata(rawAdminHat);

  const adminHat: DecentHat = {
    id: rawAdminHat.id,
    prettyId: rawAdminHat.prettyId ?? '',
    name: adminHatMetadata.name,
    description: adminHatMetadata.description,
  };

  const rawRoleHats = hatsTree.hats.filter(h => appearsExactlyNumberOfTimes(h.prettyId, '.', 2));

  const rawRoleHatsPruned = rawRoleHats
    .filter(rawHat => rawHat.status === true)
    .filter(h => h.wearers !== undefined && h.wearers.length === 1);

  const roleHats: DecentRoleHat[] = rawRoleHatsPruned.map(rawHat => {
    const hatMetadata = getHatMetadata(rawHat);
    return {
      id: rawHat.id,
      prettyId: rawHat.prettyId ?? '',
      name: hatMetadata.name,
      description: hatMetadata.description,
      wearer: rawHat.wearers![0].id,
    };
  });

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
    set(state => {
      // dev
      // if you want to get some mock live data,
      // switch app to Mainnet and, comment out next line:
      // return { hatsTreeId: 21 };
      // https://app.hatsprotocol.xyz/trees/1/22
      // this has a Top Hat, Admin Hat, and some Roles Hats directly beneath Admin.
      // it has more Hats too, but our app Ignores Those.
      // Find some other Hat tree structures (through trial and error using Hats webapp)
      // which violate the constraints we've declared (in code, above), to see how
      // the app responds.
      // ex: tree 23 has no Admin
      // end dev

      // if `hatsTreeId` is null or undefined,
      // set `hatsTree` to that same value
      if (typeof hatsTreeId !== 'number') {
        state.setHatsTree(hatsTreeId);
      }
      return { hatsTreeId };
    }),
  setHatsTree: hatsTree => set(() => ({ hatsTree: sanitize(hatsTree) })),
}));

export { useRolesState };
