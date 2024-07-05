import {
  zeroAddress,
  Address,
  encodeFunctionData,
  getAddress,
  numberToHex,
  hexToBigInt,
  Hex,
} from 'viem';
import DecentHatsAbi from '../../assets/abi/DecentHats';
import GnosisSafeL2 from '../../assets/abi/GnosisSafeL2';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import {
  EditBadgeStatus,
  HatStruct,
  HatWearerChangedParams,
  RoleValue,
} from '../../components/pages/Roles/types';
import { DecentRoleHat } from '../../state/useRolesState';
import { CreateProposalMetadata } from '../../types';
import { SENTINEL_MODULE } from '../../utils/address';

const decentHatsAddress = getAddress('0xa66696f25816D5635a7dd1c0f162D66549C69e97'); // @todo: sepolia only. Move to, and read from, network config
const hatsContractAddress = getAddress('0x3bc1A0Ad72417f2d411118085256fC53CBdDd137'); // @todo: move to network configs?
const ha75Address = getAddress('0x0000000000000000000000000000000000004a75');

const hatsDetailsBuilder = (data: { name: string; description: string }) => {
  return JSON.stringify({
    type: '1.0',
    data,
  });
};

const convertHatIdToBigInt = (id: string) => {
  try {
    return BigInt(id);
  } catch (bigIntError) {
    console.warn('Error directly converting hat id to bigint', bigIntError);
    try {
      return BigInt(parseInt(id, 16));
    } catch (parseIntError) {
      console.warn('Error converting hat id to BigInt using parseInt', parseIntError);

      // @dev - see https://stackoverflow.com/questions/55646698/base-36-to-bigint
      // Applying same approach but with radix 16
      const parsedBigInt = [...id.toString()].reduce(
        (r, v) => r * BigInt(16) + BigInt(parseInt(v, 16)),
        0n,
      );
      return parsedBigInt;
    }
  }
};

const predictHatId = ({
  treeId,
  adminHatId,
  hatsCount,
}: {
  treeId: number;
  adminHatId: bigint;
  hatsCount: number;
}) => {
  // 1 byte = 8 bits = 2 string characters
  const treeIdBinary = treeId.toString(16).padStart(8, '0'); // Tree ID is first **4 bytes**
  const adminLevelBinary = adminHatId.toString(16).slice(3, 7); // Top Admin ID is next **16 bits**

  // Each next level is next **16 bits**
  // Since we're operating only with direct child of top level admin - we don't care about nested levels
  // @dev At least for now?
  const newSiblingId = (hatsCount + 1).toString(16).padStart(4, '0');

  // Total length of Hat ID is **32 bytes** + 2 bytes for 0x
  const newHatHexId = `0x${treeIdBinary}${adminLevelBinary}${newSiblingId}`.padEnd(66, '0') as Hex;
  const newHatId = BigInt(newHatHexId);

  console.log({
    treeIdBinary,
    adminLevelBinary,
    newSiblingId,
    newHatHexId,
    newHatId,
    bigIntParseIntNewHatHexIdToString16: BigInt(parseInt(newHatHexId)).toString(16),
    parseIntNewHatHexId: parseInt(newHatHexId),
    parseIntNewHatHexIdToString16: parseInt(newHatHexId).toString(16),
    numberToHexAdminHatId: numberToHex(adminHatId),
    numberToHexNewHatId: numberToHex(newHatId),
    hexToBigIntNumberToHexNewHatId: hexToBigInt(numberToHex(newHatId)),
  });

  return newHatId;
};

const prepareAddHatsTxArgs = (addedHats: HatStruct[], adminHatId: bigint) => {
  const admins: bigint[] = [];
  const details: string[] = [];
  const maxSupplies: number[] = [];
  const eligibilityModules: Address[] = [];
  const toggleModules: Address[] = [];
  const mutables: boolean[] = [];
  const imageURIs: string[] = [];

  addedHats.forEach(hat => {
    admins.push(adminHatId);
    details.push(hat.details);
    maxSupplies.push(hat.maxSupply);
    eligibilityModules.push(hat.eligibility);
    toggleModules.push(hat.toggle);
    mutables.push(hat.isMutable);
    imageURIs.push(hat.imageURI);
  });

  return [
    admins,
    details,
    maxSupplies,
    eligibilityModules,
    toggleModules,
    mutables,
    imageURIs,
  ] as const;
};

const prepareMintHatsTxArgs = (
  addedHats: HatStruct[],
  treeId: number,
  adminHatId: bigint,
  hatsCount: number,
) => {
  const hatIds: bigint[] = [];
  const wearers: Address[] = [];

  addedHats.forEach((hat, i) => {
    const predictedHatId = predictHatId({
      treeId,
      adminHatId,
      // Each predicted hat id is based on the current hat count, plus however many hat id have been predicted so far
      hatsCount: hatsCount + i,
    });
    hatIds.push(predictedHatId);
    wearers.push(hat.wearer);
  });

  return [hatIds, wearers] as const;
};

/**
 * Given a list of edited hats, chunk them up into separate lists denoting the type of edit and the relevant updated data.
 * This is to prepare the data for the creation of a proposal to edit hats, in `prepareCreateTopHatProposal` and `prepareEditHatsProposal`.
 * @param editedHats The edited hats to be parsed. Form values from the roles form.
 * @param getHat A function to get the hat details from the state, given a hat ID. Used to get the current wearer of a hat when the wearer is updated.
 * @param uploadHatDescription A function to upload the hat description to IPFS. Returns the IPFS hash of the uploaded description, to be used to set the hat's details when it's created or updated.
 */
export const parsedEditedHatsFormValues = async (
  editedHats: RoleValue[],
  getHat: (hatId: `0x${string}`) => DecentRoleHat | null,
  uploadHatDescription: (hatDescription: string) => Promise<string>,
) => {
  //
  //  Parse added hats
  const addedHats: HatStruct[] = await Promise.all(
    editedHats
      .filter(hat => hat.editedRole?.status === EditBadgeStatus.New)
      .map(async hat => {
        const details = await uploadHatDescription(
          hatsDetailsBuilder({
            name: hat.name,
            description: hat.description,
          }),
        );

        return {
          eligibility: ha75Address,
          toggle: ha75Address,
          maxSupply: 1,
          details,
          imageURI: '',
          isMutable: true,
          wearer: getAddress(hat.wearer),
        };
      }),
  );

  //
  // Parse removed hats
  const removedHatIds = editedHats
    .filter(hat => hat.editedRole?.status === EditBadgeStatus.Removed)
    .map(hat => hat.id);

  //
  // Parse member changed hats
  const memberChangedHats: HatWearerChangedParams[] = editedHats
    .filter(
      hat =>
        hat.editedRole?.status === EditBadgeStatus.Updated &&
        hat.editedRole.fieldNames.includes('member'),
    )
    .map(hat => ({
      id: hat.id,
      currentWearer: getHat(hat.id)!.wearer,
      newWearer: getAddress(hat.wearer),
    }));

  //
  // Parse role details changed hats (name and/or description updated)
  const roleDetailsChangedHats = await Promise.all(
    editedHats
      .filter(
        hat =>
          hat.editedRole?.status === EditBadgeStatus.Updated &&
          (hat.editedRole.fieldNames.includes('roleName') ||
            hat.editedRole.fieldNames.includes('roleDescription')),
      )
      .map(async hat => ({
        id: hat.id,
        details: await uploadHatDescription(
          hatsDetailsBuilder({
            name: hat.name,
            description: hat.description,
          }),
        ),
      })),
  );

  return {
    addedHats,
    removedHatIds,
    memberChangedHats,
    roleDetailsChangedHats,
  };
};

/**
 * Prepare the data for a proposal add new hats to a safe that has never used the roles feature before.
 * This proposal will create a new top hat, an admin hat under it, and any added hats under the admin hat.
 *
 * @param proposalMetadata The metadata for the proposal.
 * @param addedHats The hat roles to be added to the safe.
 * @param safeAddress The address of the safe.
 * @param uploadHatDescription A function to upload the hat description to IPFS. Returns the IPFS hash of the uploaded description, to be used to set the hat's details.
 */
export const prepareCreateTopHatProposalData = async (
  proposalMetadata: CreateProposalMetadata,
  addedHats: HatStruct[],
  safeAddress: Address,
  uploadHatDescription: (hatDescription: string) => Promise<string>,
  safeName: string,
) => {
  const enableModuleData = encodeFunctionData({
    abi: GnosisSafeL2,
    functionName: 'enableModule',
    args: [decentHatsAddress],
  });

  const disableModuleData = encodeFunctionData({
    abi: GnosisSafeL2,
    functionName: 'disableModule',
    args: [SENTINEL_MODULE, decentHatsAddress],
  });

  const topHatDetails = await uploadHatDescription(
    hatsDetailsBuilder({
      name: safeName,
      description: '',
    }),
  );
  const adminHatDetails = await uploadHatDescription(
    hatsDetailsBuilder({
      name: 'Admin',
      description: '',
    }),
  );

  const adminHat: HatStruct = {
    eligibility: ha75Address,
    toggle: ha75Address,
    maxSupply: 1,
    details: adminHatDetails,
    imageURI: '',
    isMutable: true,
    wearer: zeroAddress,
  };

  const createAndDeclareTreeData = encodeFunctionData({
    abi: DecentHatsAbi,
    functionName: 'createAndDeclareTree',
    args: [topHatDetails, '', adminHat, addedHats],
  });

  return {
    targets: [safeAddress, decentHatsAddress, safeAddress],
    calldatas: [enableModuleData, createAndDeclareTreeData, disableModuleData],
    metaData: proposalMetadata,
    values: [0n, 0n, 0n],
  };
};

/**
 * Prepare the data for a proposal to edit hats on a safe.
 *
 * @param proposalMetadata
 * @param edits All the different updates that would be made to the safe's roles if this proposal is executed.
 */
export const prepareEditHatsProposalData = async (
  proposalMetadata: CreateProposalMetadata,
  edits: {
    addedHats: HatStruct[];
    removedHatIds: Address[];
    memberChangedHats: HatWearerChangedParams[];
    roleDetailsChangedHats: {
      id: Address;
      details: string;
    }[];
  },
  treeId: number,
  adminHatId: bigint,
  hatsCount: number,
) => {
  const { addedHats, removedHatIds, memberChangedHats, roleDetailsChangedHats } = edits;

  if (
    !addedHats.length &&
    !removedHatIds.length &&
    !memberChangedHats.length &&
    !roleDetailsChangedHats.length
  ) {
    // Cz like, why are we even here then?? That's a bug.
    throw new Error('No hats to edit');
  }

  type CallDataType = `0x${string}`;
  const createAndMintHatsTxs: CallDataType[] = [];
  let removeHatTxs: CallDataType[] = [];
  let transferHatTxs: CallDataType[] = [];
  let hatDetailsChangedTxs: CallDataType[] = [];

  if (addedHats.length) {
    // First, prepare a single tx to create all the hats
    const createHatsTx = encodeFunctionData({
      abi: HatsAbi,
      functionName: 'batchCreateHats',
      args: prepareAddHatsTxArgs(addedHats, adminHatId),
    });

    // Finally, prepare a single tx to mint all the hats to the wearers
    const mintHatsTx = encodeFunctionData({
      abi: HatsAbi,
      functionName: 'batchMintHats',
      args: prepareMintHatsTxArgs(addedHats, treeId, adminHatId, hatsCount),
    });

    // Push these two txs to the included txs array.
    // They will be executed in order: add all hats first, then mint all hats to their respective wearers.
    createAndMintHatsTxs.push(createHatsTx);
    createAndMintHatsTxs.push(mintHatsTx);
  }

  if (removedHatIds.length) {
    removeHatTxs = removedHatIds.map(hatId =>
      encodeFunctionData({
        abi: HatsAbi,
        functionName: 'setHatStatus',
        args: [convertHatIdToBigInt(hatId), false],
      }),
    );
  }

  if (memberChangedHats.length) {
    transferHatTxs = memberChangedHats.map(({ id, currentWearer, newWearer }) => {
      return encodeFunctionData({
        abi: HatsAbi,
        functionName: 'transferHat',
        args: [convertHatIdToBigInt(id), currentWearer, newWearer],
      });
    });
  }

  if (roleDetailsChangedHats.length) {
    hatDetailsChangedTxs = roleDetailsChangedHats.map(({ id, details }) => {
      return encodeFunctionData({
        abi: HatsAbi,
        functionName: 'changeHatDetails',
        args: [convertHatIdToBigInt(id), details],
      });
    });
  }

  return {
    targets: [
      ...createAndMintHatsTxs.map(() => hatsContractAddress),
      ...removeHatTxs.map(() => hatsContractAddress),
      ...transferHatTxs.map(() => hatsContractAddress),
      ...hatDetailsChangedTxs.map(() => hatsContractAddress),
    ],
    calldatas: [...createAndMintHatsTxs, ...removeHatTxs, ...transferHatTxs, ...hatDetailsChangedTxs],
    metaData: proposalMetadata,
    values: [
      ...createAndMintHatsTxs.map(() => 0n),
      ...removeHatTxs.map(() => 0n),
      ...transferHatTxs.map(() => 0n),
      ...hatDetailsChangedTxs.map(() => 0n),
    ],
  };
};
