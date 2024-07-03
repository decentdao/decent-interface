import { zeroAddress, Address, encodeFunctionData, getAddress } from 'viem';
import DecentHatsAbi from '../../assets/abi/DecentHats';
import GnosisSafeL2 from '../../assets/abi/GnosisSafeL2';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import {
  EditBadgeStatus,
  HatStruct,
  HatStructWithId,
  RoleValue,
} from '../../components/pages/Roles/types';
import { CreateProposalMetadata } from '../../types';

const decentHatsAddress = getAddress('0x88e72194d93bf417310b197275d972cf78406163'); // @todo: sepolia only. Move to, and read from, network config
const hatsContractAddress = getAddress('0x3bc1A0Ad72417f2d411118085256fC53CBdDd137'); // @todo: move to network configs?

const predictHatId = async (args: {
  treeId: bigint;
  adminHatId: bigint;
  hatsCount: number;
  hat: HatStruct;
}) => {
  const { hat, treeId, adminHatId, hatsCount } = args;
  return 0n; // @todo: implement hat id prediction
};

const prepareAddHatsArgs = (addedHats: HatStruct[]) => {
  const admins: bigint[] = [];
  const details: string[] = [];
  const maxSupplies: number[] = [];
  const eligibilityModules: Address[] = [];
  const toggleModules: Address[] = [];
  const mutables: boolean[] = [];
  const imageURIs: string[] = [];

  addedHats.forEach(hat => {
    admins.push(0n); // should be the safe's admin hat ID
    details.push(hat.details);
    maxSupplies.push(hat.maxSupply);
    eligibilityModules.push(hat.eligibility); // probably should be the safe's address (or more likely, the intended wearer's address)
    toggleModules.push(hat.toggle); // probably should be the safe's address
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

const prepareMintHatsArgs = (addedHats: HatStructWithId[]) => {
  const hatIds: bigint[] = [];
  const wearers: Address[] = [];

  addedHats.forEach(hat => {
    hatIds.push(hat.id);
    wearers.push(hat.wearer);
  });

  return [hatIds, wearers] as const;
};

/**
 * Given a list of edited hats, chunk them up into separate lists denoting the type of edit and the relevant updated data.
 * This is to prepare the data for the creation of a proposal to edit hats, in `prepareCreateTopHatProposal` and `prepareEditHatsProposal`.
 * @param editedHats The edited hats to be parsed. Form values from the roles form.
 */
export const parsedEditedHats = (editedHats: RoleValue[]) => {
  //
  //  Parse added hats
  const addedHats: HatStructWithId[] = editedHats
    .filter(hat => hat.editedRole?.status === EditBadgeStatus.New)
    .map(hat => ({
      eligibility: zeroAddress,
      toggle: zeroAddress,
      maxSupply: 1,
      details: JSON.stringify({
        name: hat.roleName,
        description: hat.roleDescription,
      }),
      imageURI: '',
      isMutable: true,
      wearer: getAddress(hat.member),
      id: 0n, // @todo: implement hat id prediction
    }));

  //
  // Parse removed hats
  const removedHatIds = editedHats
    .filter(hat => hat.editedRole?.status === EditBadgeStatus.Removed)
    .map(hat => hat.id);

  //
  // Parse member changed hats
  const memberChangedHats = editedHats
    .filter(
      hat =>
        hat.editedRole?.status === EditBadgeStatus.Updated &&
        hat.editedRole.fieldNames.includes('member'),
    )
    .map(hat => ({
      id: hat.id,
      wearer: getAddress(hat.member),
    }));

  //
  // Parse role details changed hats (name and/or description updated)
  const roleDetailsChangedHats = editedHats
    .filter(
      hat =>
        hat.editedRole?.status === EditBadgeStatus.Updated &&
        (hat.editedRole.fieldNames.includes('roleName') ||
          hat.editedRole.fieldNames.includes('roleDescription')),
    )
    .map(hat => ({
      id: hat.id,
      details: JSON.stringify({
        name: hat.roleName,
        description: hat.roleDescription,
      }),
    }));

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
 */
export const prepareCreateTopHatProposal = async (
  proposalMetadata: CreateProposalMetadata,
  addedHats: HatStruct[],
  safeAddress: Address,
) => {
  const enableModuleData = encodeFunctionData({
    abi: GnosisSafeL2,
    functionName: 'enableModule',
    args: [decentHatsAddress],
  });

  const disableModuleData = encodeFunctionData({
    abi: GnosisSafeL2,
    functionName: 'disableModule',
    args: [decentHatsAddress, decentHatsAddress], // @todo: Figure out prevModule arg. Need to retrieve from safe.
  });

  const adminHat: HatStruct = {
    eligibility: zeroAddress,
    toggle: zeroAddress,
    maxSupply: 1,
    details: JSON.stringify({
      name: 'Admin',
      description: '',
    }),
    imageURI: '',
    isMutable: true,
    wearer: zeroAddress,
  };

  const createAndDeclareTreeData = encodeFunctionData({
    abi: DecentHatsAbi,
    functionName: 'createAndDeclareTree',
    args: [
      JSON.stringify({
        name: 'Top Hat',
        description: 'top hat',
      }),
      '',
      adminHat,
      addedHats,
    ],
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
export const prepareEditHatsProposal = async (
  proposalMetadata: CreateProposalMetadata,
  edits: {
    addedHats: HatStruct[];
    removedHatIds: bigint[];
    memberChangedHats: {
      id: bigint;
      wearer: `0x${string}`;
    }[];
    roleDetailsChangedHats: {
      id: bigint;
      details: string;
    }[];
  },
  treeId: bigint,
  adminHatId: bigint,
  hatsCount: number,
) => {
  const { addedHats, removedHatIds, memberChangedHats, roleDetailsChangedHats } = edits;

  if (addedHats.length) {
  }

  const addHatsTx = encodeFunctionData({
    abi: HatsAbi,
    functionName: 'batchCreateHats',
    args: prepareAddHatsArgs(addedHats),
  });

  const predictedHatIds = await Promise.all(
    addedHats.map(hat =>
      predictHatId({
        treeId,
        adminHatId,
        hat,
        hatsCount,
      }),
    ),
  );

  const mintHatsTx = encodeFunctionData({
    abi: HatsAbi,
    functionName: 'batchMintHats',
    args: prepareMintHatsArgs(
      addedHats.map((hat, i) => ({
        ...hat,
        id: predictedHatIds[i],
      })),
    ),
  });

  const removeHatTxs = removedHatIds.map(hatId =>
    encodeFunctionData({
      abi: HatsAbi,
      functionName: 'setHatStatus',
      args: [hatId, false],
    }),
  );

  const transferHatTxs = memberChangedHats.map(({ id, wearer }) => {
    const currentWearer = zeroAddress; // @todo: get the current hat wearer
    return encodeFunctionData({
      abi: HatsAbi,
      functionName: 'transferHat',
      args: [id, currentWearer, wearer],
    });
  });

  const roleDetailsChangedTxs = roleDetailsChangedHats.map(({ id, details }) => {
    return encodeFunctionData({
      abi: HatsAbi,
      functionName: 'changeHatDetails',
      args: [id, details],
    });
  });

  return {
    targets: [
      hatsContractAddress,
      hatsContractAddress,
      ...removeHatTxs.map(() => hatsContractAddress),
      ...transferHatTxs.map(() => hatsContractAddress),
      ...roleDetailsChangedHats.map(() => hatsContractAddress),
    ],
    calldatas: [
      addHatsTx,
      mintHatsTx,
      ...removeHatTxs,
      ...transferHatTxs,
      ...roleDetailsChangedTxs,
    ],
    metaData: proposalMetadata,
    values: [
      0n,
      0n,
      ...removeHatTxs.map(() => 0n),
      ...transferHatTxs.map(() => 0n),
      ...roleDetailsChangedHats.map(() => 0n),
    ],
  };
};
