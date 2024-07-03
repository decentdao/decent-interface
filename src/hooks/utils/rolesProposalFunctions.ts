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

interface HatStructWithoutPredictedId {
  eligibility: Address; // The address that can report on the Hat wearer's status
  toggle: Address; // The address that can deactivate the Hat
  maxSupply: number; // No more than this number of wearers. Hardcode to 1
  details: string; // JSON string, { name, description } OR IPFS url/hash to said JSON data
  imageURI: string;
  isMutable: boolean; // true
  wearer: Address;
}

export const parsedEditedHats = (editedHats: RoleValue[]) => {
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

  const removedHatIds = editedHats
    .filter(hat => hat.editedRole?.status === EditBadgeStatus.Removed)
    .map(hat => hat.id);

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

const prepareAddHatsArgs = (addedHats: HatStruct[]) => {
  const admins: bigint[] = [];
  const details: string[] = [];
  const maxSupplies: number[] = [];
  const eligibilityModules: Address[] = [];
  const toggleModules: Address[] = [];
  const mutables: boolean[] = [];
  const imageURIs: string[] = [];

  addedHats.forEach(hat => {
    admins.push(0n); // should be the safe's admin hat address
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

  const adminHat: HatStructWithoutPredictedId = {
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
) => {
  const { addedHats, removedHatIds, memberChangedHats, roleDetailsChangedHats } = edits;

  const addHatsTx = encodeFunctionData({
    abi: HatsAbi,
    functionName: 'batchCreateHats',
    args: prepareAddHatsArgs(addedHats),
  });

  // @todo: gotta mint the hats too.
  // - treeid
  // - admin hatid
  // - count of hats under tree
  // const mintHatsTx = encodeFunctionData({
  //   abi: HatsAbi,
  //   functionName: 'batchMintHats',
  //   args: [],
  // });

  const removeHatTxs = removedHatIds.map(hatId =>
    encodeFunctionData({
      abi: HatsAbi,
      functionName: 'setHatStatus',
      args: [hatId, false],
    }),
  );

  return {
    targets: [hatsContractAddress, ...removeHatTxs.map(() => hatsContractAddress)],
    calldatas: [addHatsTx, ...removeHatTxs],
    metaData: proposalMetadata,
    values: [0n, ...removeHatTxs.map(() => 0n)],
  };
};
