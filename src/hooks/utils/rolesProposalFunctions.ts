import { zeroAddress, Address, encodeFunctionData, getAddress } from 'viem';
import DecentHatsAbi from '../../assets/abi/DecentHats';
import GnosisSafeL2 from '../../assets/abi/GnosisSafeL2';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import {
  EditBadgeStatus,
  HatStruct,
  HatStructWithId,
  HatWearerChangedParams,
  RoleValue,
} from '../../components/pages/Roles/types';
import { DecentRoleHat } from '../../state/useRolesState';
import { CreateProposalMetadata } from '../../types';

const decentHatsAddress = getAddress('0x88e72194d93bf417310b197275d972cf78406163'); // @todo: sepolia only. Move to, and read from, network config
const hatsContractAddress = getAddress('0x3bc1A0Ad72417f2d411118085256fC53CBdDd137'); // @todo: move to network configs?

const predictHatId = async (args: { treeId: number; adminHatId: bigint; hatsCount: number }) => {
  const { treeId, adminHatId, hatsCount } = args;

  const treeIdBinary = treeId.toString(2).padStart(32, '0');
  const adminLevelBinary = adminHatId.toString(2).padStart(16, '0');
  const newSiblingId = (hatsCount + 1).toString(2).padStart(16, '0');

  let newHatBinaryId = `${treeIdBinary}${adminLevelBinary}${newSiblingId}`;
  newHatBinaryId = newHatBinaryId.padEnd(256, '0');
  let newHatIdHex = BigInt('0b' + newHatBinaryId).toString(16) as `0x${string}`;

  return newHatIdHex;
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
    eligibilityModules.push(hat.eligibility); // @todo: probably should be the safe's address (or more likely, the intended wearer's address)
    toggleModules.push(hat.toggle); // @todo: probably should be the safe's address
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

const prepareMintHatsTxArgs = (addedHats: HatStructWithId[]) => {
  const hatIds: bigint[] = [];
  const wearers: Address[] = [];

  addedHats.forEach(hat => {
    hatIds.push(BigInt(hat.id));
    wearers.push(hat.wearer);
  });

  console.log({ hatIds, wearers });
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
        return {
          eligibility: zeroAddress,
          toggle: zeroAddress,
          maxSupply: 1,
          details: await uploadHatDescription(
            JSON.stringify({
              name: hat.name,
              description: hat.description,
            }),
          ),
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
          JSON.stringify({
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
) => {
  const enableModuleData = encodeFunctionData({
    abi: GnosisSafeL2,
    functionName: 'enableModule',
    args: [decentHatsAddress],
  });

  const sentinelModule = '0x1';
  const disableModuleData = encodeFunctionData({
    abi: GnosisSafeL2,
    functionName: 'disableModule',
    args: [sentinelModule, decentHatsAddress],
  });

  const topHatDetails = await uploadHatDescription(
    JSON.stringify({
      name: 'Top Hat',
      description: 'top hat',
    }),
  );
  const adminHatDetails = await uploadHatDescription(
    JSON.stringify({
      name: 'Admin',
      description: '',
    }),
  );
  const adminHat: HatStruct = {
    eligibility: zeroAddress,
    toggle: zeroAddress,
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
  const addAndMintHatsTxs: CallDataType[] = [];
  let removeHatTxs: CallDataType[] = [];
  let transferHatTxs: CallDataType[] = [];
  let hatDetailsChangedTxs: CallDataType[] = [];

  if (addedHats.length) {
    // First, prepare a single tx to create all the hats
    const addHatsTx = encodeFunctionData({
      abi: HatsAbi,
      functionName: 'batchCreateHats',
      args: prepareAddHatsTxArgs(addedHats, adminHatId),
    });

    // Next, predict the hat IDs for the added hats
    const predictedHatIds = await Promise.all(
      addedHats.map((_, i) =>
        predictHatId({
          treeId,
          adminHatId,
          hatsCount: hatsCount + i,
        }),
      ),
    );

    // Finally, prepare a single tx to mint all the hats to the wearers
    const mintHatsTx = encodeFunctionData({
      abi: HatsAbi,
      functionName: 'batchMintHats',
      args: prepareMintHatsTxArgs(
        addedHats.map((hat, i) => ({
          ...hat,
          id: predictedHatIds[i],
        })),
      ),
    });

    // Push these two txs to the included txs array.
    // They will be executed in order: add all hats first, then mint all hats to their respective wearers.
    addAndMintHatsTxs.push(addHatsTx);
    addAndMintHatsTxs.push(mintHatsTx);
  }

  if (removedHatIds.length) {
    removeHatTxs = removedHatIds.map(hatId =>
      encodeFunctionData({
        abi: HatsAbi,
        functionName: 'setHatStatus',
        args: [BigInt(hatId), false],
      }),
    );
  }

  if (memberChangedHats.length) {
    transferHatTxs = memberChangedHats.map(({ id, currentWearer, newWearer }) => {
      return encodeFunctionData({
        abi: HatsAbi,
        functionName: 'transferHat',
        args: [BigInt(id), currentWearer, newWearer],
      });
    });
  }

  if (roleDetailsChangedHats.length) {
    hatDetailsChangedTxs = roleDetailsChangedHats.map(({ id, details }) => {
      return encodeFunctionData({
        abi: HatsAbi,
        functionName: 'changeHatDetails',
        args: [BigInt(id), details],
      });
    });
  }

  // @dev
  // Depending on the number of hats to be added, removed, transferred, or updated, the number of txs included
  // to be executed in the proposal will be different:
  //
  // `includedAddAndMintHatsTx` will be an array of 0 or 2 elements.
  // the others will be arrays of 0 or more elements.

  if (addAndMintHatsTxs.length > 2) {
    throw new Error('Too many create hats txs');
  }

  return {
    targets: [
      ...addAndMintHatsTxs.map(() => hatsContractAddress),
      ...removeHatTxs.map(() => hatsContractAddress),
      ...transferHatTxs.map(() => hatsContractAddress),
      ...hatDetailsChangedTxs.map(() => hatsContractAddress),
    ],
    calldatas: [...addAndMintHatsTxs, ...removeHatTxs, ...transferHatTxs, ...hatDetailsChangedTxs],
    metaData: proposalMetadata,
    values: [
      ...addAndMintHatsTxs.map(() => 0n),
      ...removeHatTxs.map(() => 0n),
      ...transferHatTxs.map(() => 0n),
      ...hatDetailsChangedTxs.map(() => 0n),
    ],
  };
};
