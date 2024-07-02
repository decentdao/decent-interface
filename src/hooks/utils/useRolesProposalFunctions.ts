import { useCallback } from 'react';
import { zeroAddress, Address, encodeFunctionData } from 'viem';
import DecentHatsAbi from '../../assets/abi/DecentHats';
import GnosisSafeL2 from '../../assets/abi/GnosisSafeL2';
import {
  EditBadgeStatus,
  HatStruct,
  HatStructWithId,
  RoleValue,
} from '../../components/pages/Roles/types';
import { useFractal } from '../../providers/App/AppProvider';
import { CreateProposalMetadata } from '../../types';

const decentHatsAddress = '0x88e72194d93bf417310b197275d972cf78406163'; // @todo: sepolia only. Move to, and read from, network config

const HatsAbi = 'HatsAbi' as any;
const hatsContractAddress = 'hatsAddress' as Address;

export const useRolesProposalFunctions = () => {
  const {
    node: { safe },
  } = useFractal();

  const prepareAddHatsArgs = useCallback((addedHats: HatStruct[]) => {
    const admins: bigint[] = [];
    const details: string[] = [];
    const maxSupplies: number[] = [];
    const eligibilityModules: Address[] = [];
    const toggleModules: Address[] = [];
    const mutables: boolean[] = [];
    const imageURIs: string[] = [];

    addedHats.forEach(hat => {
      admins.push(0n);
      details.push(hat.details);
      maxSupplies.push(hat.maxSupply);
      eligibilityModules.push(hat.eligibility);
      toggleModules.push(hat.toggle);
      mutables.push(hat.isMutable);
      imageURIs.push(hat.imageURI);
    });

    return [admins, details, maxSupplies, eligibilityModules, toggleModules, mutables, imageURIs];
  }, []);

  const parsedEditedHats = (editedHats: RoleValue[]) => {
    const addedHats: HatStruct[] = [];
    const removedHatIds: number[] = [];
    const updatedHats: HatStructWithId[] = [];

    editedHats.forEach(hat => {
      const { roleName, member, roleDescription, editedRole, id } = hat;
      if (editedRole) {
        switch (editedRole.status) {
          case EditBadgeStatus.New:
            addedHats.push({
              eligibility: zeroAddress,
              toggle: zeroAddress,
              maxSupply: 1,
              details: JSON.stringify({
                name: roleName,
                description: roleDescription,
              }),
              imageURI: '',
              isMutable: true,
              wearer: member as Address,
            });
            break;

          case EditBadgeStatus.Removed:
            removedHatIds.push(id);
            break;

          case EditBadgeStatus.Updated:
            editedRole.fieldNames.forEach(fieldName => {
              switch (fieldName) {
                case 'roleName':
                  break;
                case 'roleDescription':
                  break;
                case 'member':
                  break;
              }
            });

            updatedHats.push({
              id,
              eligibility: zeroAddress,
              toggle: zeroAddress,
              maxSupply: 1,
              details: JSON.stringify({
                name: roleName,
                description: roleDescription,
              }),
              imageURI: '',
              isMutable: true,
              wearer: member as Address,
            });
            break;
        }
      }
    });

    return { addedHats, removedHatIds, updatedHats };
  };

  const prepareCreateTopHatProposal = useCallback(
    async (proposalMetadata: CreateProposalMetadata, addedHats: HatStruct[]) => {
      if (!safe) return;

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

      const addressZero = zeroAddress as Address;
      const adminHat: HatStruct = {
        eligibility: addressZero,
        toggle: addressZero,
        maxSupply: 1,
        details: JSON.stringify({
          name: 'Admin',
          description: '',
        }),
        imageURI: '',
        isMutable: true,
        wearer: addressZero,
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
        targets: [safe.address, decentHatsAddress, safe.address] as Address[],
        calldatas: [enableModuleData, createAndDeclareTreeData, disableModuleData],
        metaData: proposalMetadata,
        values: [0n, 0n, 0n],
      };
    },
    [safe],
  );

  const prepareEditHatsProposal = useCallback(
    async (
      treeId: number,
      proposalMetadata: CreateProposalMetadata,
      edits: {
        addedHats: HatStruct[];
        removedHatIds: number[];
        updatedHats: HatStructWithId[];
      },
    ) => {
      if (!safe) return;

      const { addedHats, removedHatIds, updatedHats } = edits;

      // @todo: assert none of edited hats are top hat or admin hat
      if (removedHatIds.includes(treeId) || updatedHats.some(hat => hat.id === treeId)) {
        throw new Error('Cannot edit top hat');
      }

      const addHatsTx = encodeFunctionData({
        abi: 'HatsAbi' as any,
        functionName: 'batchCreateHats',
        args: prepareAddHatsArgs(addedHats),
      });

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
    },
    [prepareAddHatsArgs, safe],
  );

  return { prepareCreateTopHatProposal, parsedEditedHats, prepareEditHatsProposal };
};
