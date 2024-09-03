import { FormikHelpers } from 'formik';
import { isEqual } from 'lodash';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Address, encodeFunctionData, getAddress, Hex, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import DecentHatsAbi from '../../assets/abi/DecentHats_0_1_0_Abi';
import ERC6551RegistryAbi from '../../assets/abi/ERC6551RegistryAbi';
import GnosisSafeL2 from '../../assets/abi/GnosisSafeL2';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import HatsAccount1ofNAbi from '../../assets/abi/HatsAccount1ofN';
import {
  AddedHatsWithIds,
  EditBadgeStatus,
  HatStruct,
  PreparedAddedHatsData,
  PreparedChangedRoleDetailsData,
  PreparedMemberChangeData,
  PreparedNewStreamData,
  PreparedEditedStreamData,
  RoleFormValues,
  RoleHatFormValueEdited,
  SablierPayment,
} from '../../components/pages/Roles/types';
import { DAO_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import useIPFSClient from '../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { getERC6551RegistrySalt, predictHatId, useRolesStore } from '../../store/roles';
import { CreateProposalMetadata, ProposalExecuteData } from '../../types';
import { SENTINEL_MODULE } from '../../utils/address';
import useSubmitProposal from '../DAO/proposal/useSubmitProposal';
import useCreateSablierStream from '../streams/useCreateSablierStream';
import { DecentRoleHat, predictAccountAddress } from './../../store/roles/rolesStoreUtils';

const hatsDetailsBuilder = (data: { name: string; description: string }) => {
  return JSON.stringify({
    type: '1.0',
    data,
  });
};

const createHatStruct = async (
  name: string,
  description: string,
  wearer: Address,
  uploadHatDescription: (hatDescription: string) => Promise<string>,
) => {
  const details = await uploadHatDescription(
    hatsDetailsBuilder({
      name: name,
      description: description,
    }),
  );

  const newHat: HatStruct = {
    maxSupply: 1,
    details,
    imageURI: '',
    isMutable: true,
    wearer: wearer,
  };

  return newHat;
};

const createHatStructFromRoleFormValues = async (
  role: RoleHatFormValueEdited,
  uploadHatDescription: (hatDescription: string) => Promise<string>,
) => {
  if (role.name === undefined || role.description === undefined) {
    throw new Error('Hat name or description of added hat is undefined.');
  }

  if (role.wearer === undefined) {
    throw new Error('Hat wearer of added hat is undefined.');
  }

  return createHatStruct(
    role.name,
    role.description,
    getAddress(role.wearer),
    uploadHatDescription,
  );
};

const createHatStructsFromRolesFormValues = async (
  modifiedRoles: RoleHatFormValueEdited[],
  uploadHatDescription: (hatDescription: string) => Promise<string>,
) => {
  return Promise.all(
    modifiedRoles.map(role => createHatStructFromRoleFormValues(role, uploadHatDescription)),
  );
};

// const identifyAndPrepareRemovedHats = (modifiedHats: RoleHatFormValueEdited[]) => {
//   return modifiedHats
//     .filter(hat => hat.editedRole.status === EditBadgeStatus.Removed)
//     .map(hat => {
//       if (hat.id === undefined) {
//         throw new Error('Hat ID of removed hat is undefined.');
//       }

//       return hat.id;
//     });
// };

// const identifyAndPrepareMemberChangedHats = (
//   modifiedHats: RoleHatFormValueEdited[],
//   getHat: (hatId: Hex) => DecentRoleHat | null,
// ) => {
//   return modifiedHats
//     .filter(
//       hat =>
//         hat.editedRole.status === EditBadgeStatus.Updated &&
//         hat.editedRole.fieldNames.includes('member'),
//     )
//     .map(hat => {
//       if (hat.wearer === undefined || hat.id === undefined) {
//         throw new Error('Hat wearer of member changed Hat is undefined.');
//       }

//       const currentHat = getHat(hat.id);
//       if (currentHat === null) {
//         throw new Error("Couldn't find existing Hat for member changed Hat.");
//       }

//       const hatWearerChanged = {
//         id: currentHat.id,
//         currentWearer: getAddress(currentHat.wearer),
//         newWearer: getAddress(hat.wearer),
//       };

//       return hatWearerChanged;
//     })
//     .filter(hat => hat.currentWearer !== hat.newWearer);
// };

// const identifyAndPrepareRoleDetailsChangedHats = (
//   modifiedHats: RoleHatFormValueEdited[],
//   uploadHatDescription: (hatDescription: string) => Promise<string>,
//   getHat: (hatId: Hex) => DecentRoleHat | null,
// ) => {
//   return Promise.all(
//     modifiedHats
//       .filter(
//         formHat =>
//           formHat.editedRole.status === EditBadgeStatus.Updated &&
//           (formHat.editedRole.fieldNames.includes('roleName') ||
//             formHat.editedRole.fieldNames.includes('roleDescription')),
//       )
//       .map(async formHat => {
//         if (formHat.id === undefined) {
//           throw new Error('Hat ID of existing hat is undefined.');
//         }

//         if (formHat.name === undefined || formHat.description === undefined) {
//           throw new Error('Hat name or description of existing hat is undefined.');
//         }

//         const currentHat = getHat(formHat.id);
//         if (currentHat === null) {
//           throw new Error("Couldn't find existing Hat for details changed Hat.");
//         }

//         return {
//           id: currentHat.id,
//           details: await uploadHatDescription(
//             hatsDetailsBuilder({
//               name: formHat.name,
//               description: formHat.description,
//             }),
//           ),
//         };
//       }),
//   );
// };

// const identifyAndPrepareEditedPaymentStreams = (
//   modifiedHats: RoleHatFormValueEdited[],
//   getHat: (hatId: Hex) => DecentRoleHat | null,
//   getPayment: (hatId: Hex, streamId: string) => SablierPayment | null,
// ): PreparedEditedStreamData[] => {
//   return modifiedHats.flatMap(formHat => {
//     const currentHat = getHat(formHat.id);
//     if (currentHat === null) {
//       return [];
//     }

//     if (formHat.payments === undefined) {
//       return [];
//     }

//     return formHat.payments
//       .filter(payment => {
//         if (payment.streamId === undefined) {
//           return false;
//         }
//         // @note remove payments that haven't been edited
//         const originalPayment = getPayment(formHat.id, payment.streamId);
//         if (originalPayment === null) {
//           return false;
//         }
//         return !isEqual(payment, originalPayment);
//       })
//       .map(payment => {
//         if (
//           !payment.streamId ||
//           !payment.contractAddress ||
//           !payment.asset ||
//           !payment.startDate ||
//           !payment.endDate ||
//           !payment.amount?.bigintValue ||
//           payment.amount.bigintValue <= 0n
//         ) {
//           throw new Error('Form Values inValid', {
//             cause: payment,
//           });
//         }

//         return {
//           streamId: payment.streamId,
//           recipient: currentHat.smartAddress,
//           startDateTs: Math.floor(payment.startDate.getTime() / 1000),
//           endDateTs: Math.ceil(payment.endDate.getTime() / 1000),
//           cliffDateTs: Math.floor((payment.cliffDate?.getTime() ?? 0) / 1000),
//           totalAmount: payment.amount.bigintValue,
//           assetAddress: payment.asset.address,
//           roleHatId: BigInt(currentHat.id),
//           roleHatWearer: currentHat.wearer,
//           roleHatSmartAddress: currentHat.smartAddress,
//           streamContractAddress: payment.contractAddress,
//         };
//       });
//   });
// };

// const identifyAndPrepareAddedPaymentStreams = async (
//   modifiedHats: RoleHatFormValueEdited[],
//   addedHatsWithIds: AddedHatsWithIds[],
//   getHat: (hatId: Hex) => DecentRoleHat | null,
//   predictSmartAccount: (hatId: bigint) => Promise<Address>,
// ): Promise<PreparedNewStreamData[]> => {
//   const preparedStreamDataMapped = await Promise.all(
//     modifiedHats.map(async formHat => {
//       if (formHat.payments === undefined) {
//         return [];
//       }

//       const payments = formHat.payments.filter(payment => !payment.streamId);
//       let recipientAddress: Address;
//       const existingRoleHat = getHat(formHat.id);
//       if (!!existingRoleHat) {
//         recipientAddress = existingRoleHat.smartAddress;
//       } else {
//         const addedRoleHat = addedHatsWithIds.find(addedHat => addedHat.formId === formHat.id);
//         if (!addedRoleHat) {
//           throw new Error('Could not find added role hat for added payment stream.');
//         }
//         recipientAddress = await predictSmartAccount(addedRoleHat.id);
//       }
//       return payments.map(payment => {
//         if (
//           !payment.asset ||
//           !payment.startDate ||
//           !payment.endDate ||
//           !payment.amount?.bigintValue ||
//           payment.amount.bigintValue <= 0n
//         ) {
//           throw new Error('Form Values inValid', {
//             cause: payment,
//           });
//         }

//         return {
//           recipient: recipientAddress,
//           startDateTs: Math.floor(payment.startDate.getTime() / 1000),
//           endDateTs: Math.ceil(payment.endDate.getTime() / 1000),
//           cliffDateTs: Math.floor((payment.cliffDate?.getTime() ?? 0) / 1000),
//           totalAmount: payment.amount.bigintValue,
//           assetAddress: payment.asset.address,
//         };
//       });
//     }),
//   );
//   return preparedStreamDataMapped.flat();
// };

// const prepareAddHatsTxArgs = (addedHats: HatStruct[], adminHatId: Hex, topHatAccount: Address) => {
//   const admins: bigint[] = [];
//   const details: string[] = [];
//   const maxSupplies: number[] = [];
//   const eligibilityModules: Address[] = [];
//   const toggleModules: Address[] = [];
//   const mutables: boolean[] = [];
//   const imageURIs: string[] = [];

//   addedHats.forEach(hat => {
//     admins.push(BigInt(adminHatId));
//     details.push(hat.details);
//     maxSupplies.push(hat.maxSupply);
//     eligibilityModules.push(topHatAccount);
//     toggleModules.push(topHatAccount);
//     mutables.push(hat.isMutable);
//     imageURIs.push(hat.imageURI);
//   });

//   return [
//     admins,
//     details,
//     maxSupplies,
//     eligibilityModules,
//     toggleModules,
//     mutables,
//     imageURIs,
//   ] as const;
// };

export default function useCreateRoles() {
  const {
    node: { safe, daoAddress, daoName },
  } = useFractal();
  const { hatsTree, hatsTreeId, getHat, getPayment } = useRolesStore();
  const {
    addressPrefix,
    chain,
    contracts: {
      hatsProtocol,
      decentHatsMasterCopy,
      hatsAccount1ofNMasterCopy,
      erc6551Registry,
      keyValuePairs,
    },
  } = useNetworkConfig();

  const { t } = useTranslation(['roles', 'navigation', 'modals', 'common']);

  const { submitProposal } = useSubmitProposal();
  const { prepareBatchLinearStreamCreation, prepareFlushStreamTx, prepareCancelStreamTx } =
    useCreateSablierStream();
  const ipfsClient = useIPFSClient();
  const publicClient = usePublicClient();
  const navigate = useNavigate();
  const submitProposalSuccessCallback = useCallback(() => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  }, [daoAddress, addressPrefix, navigate]);

  const uploadHatDescription = useCallback(
    async (hatDescription: string) => {
      const response = await ipfsClient.add(hatDescription);
      return `ipfs://${response.Hash}`;
    },
    [ipfsClient],
  );

  const predictSmartAccount = useCallback(
    async (hatId: bigint) => {
      if (!publicClient) {
        throw new Error('Public client is not set');
      }
      return predictAccountAddress({
        implementation: hatsAccount1ofNMasterCopy,
        chainId: BigInt(chain.id),
        tokenContract: hatsProtocol,
        tokenId: hatId,
        registryAddress: erc6551Registry,
        publicClient,
        decentHats: getAddress(decentHatsMasterCopy),
      });
    },
    [
      publicClient,
      hatsAccount1ofNMasterCopy,
      chain.id,
      hatsProtocol,
      erc6551Registry,
      decentHatsMasterCopy,
    ],
  );

  const prepareCreateTopHatProposalData = useCallback(
    async (proposalMetadata: CreateProposalMetadata, addedHats: HatStruct[]) => {
      if (!daoAddress) {
        throw new Error('Can not create top hat without DAO Address');
      }

      const decentHatsAddress = getAddress(decentHatsMasterCopy);
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
          name: daoName || daoAddress,
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
        maxSupply: 1,
        details: adminHatDetails,
        imageURI: '',
        isMutable: true,
        wearer: zeroAddress,
      };

      const createAndDeclareTreeData = encodeFunctionData({
        abi: DecentHatsAbi,
        functionName: 'createAndDeclareTree',
        args: [
          {
            hatsProtocol,
            hatsAccountImplementation: hatsAccount1ofNMasterCopy,
            registry: erc6551Registry,
            keyValuePairs: getAddress(keyValuePairs),
            topHatDetails,
            topHatImageURI: '',
            adminHat,
            hats: addedHats,
          },
        ],
      });

      return {
        targets: [daoAddress, decentHatsAddress, daoAddress],
        calldatas: [enableModuleData, createAndDeclareTreeData, disableModuleData],
        metaData: proposalMetadata,
        values: [0n, 0n, 0n],
      };
    },
    [
      daoAddress,
      decentHatsMasterCopy,
      uploadHatDescription,
      daoName,
      hatsProtocol,
      hatsAccount1ofNMasterCopy,
      erc6551Registry,
      keyValuePairs,
    ],
  );

  const prepareHatsAccountFlushExecData = useCallback(
    (streamId: string, contractAddress: Address, wearer: Address) => {
      const flushStreamTxCalldata = prepareFlushStreamTx(streamId, wearer);
      const wrappedFlushStreamTx = encodeFunctionData({
        abi: HatsAccount1ofNAbi,
        functionName: 'execute',
        args: [contractAddress, 0n, flushStreamTxCalldata, 0],
      });

      return wrappedFlushStreamTx;
    },
    [prepareFlushStreamTx],
  );

  const prepareHatFlushAndCancelPayment = useCallback(
    (streamId: string, contractAddress: Address, wearer: Address) => {
      const cancelStreamTx = prepareCancelStreamTx(streamId, contractAddress);
      const wrappedFlushStreamTx = prepareHatsAccountFlushExecData(
        streamId,
        contractAddress,
        wearer,
      );

      return { wrappedFlushStreamTx, cancelStreamTx };
    },
    [prepareCancelStreamTx, prepareHatsAccountFlushExecData],
  );

  // const prepareEditHatsProposalData = useCallback(
  //   (
  //     proposalMetadata: CreateProposalMetadata,
  //     addedHats: PreparedAddedHatsData[],
  //     removedHatIds: Hex[],
  //     memberChangedHats: PreparedMemberChangeData[],
  //     roleDetailsChangedHats: PreparedChangedRoleDetailsData[],
  //     editedPaymentStreams: PreparedEditedStreamData[],
  //     addedPaymentStreams: PreparedNewStreamData[],
  //   ) => {
  //     if (!hatsTree || !daoAddress) {
  //       throw new Error('Can not edit hats without Hats Tree!');
  //     }

  //     const topHatAccount = hatsTree.topHat.smartAddress;
  //     const adminHatId = hatsTree.adminHat.id;

  //     const createAndMintHatsTxs: Hex[] = [];
  //     let removeHatTxs: Hex[] = [];
  //     let transferHatTxs: Hex[] = [];
  //     let hatDetailsChangedTxs: Hex[] = [];

  //     let smartAccountTxs: { calldata: Hex; targetAddress: Address }[] = [];
  //     let hatPaymentAddedTxs: { calldata: Hex; targetAddress: Address }[] = [];
  //     let hatPaymentEditedTxs: { calldata: Hex; targetAddress: Address }[] = [];

  //     let hatPaymentWearerChangedTxs: { calldata: Hex; targetAddress: Address }[] = [];
  //     let hatPaymentHatRemovedTxs: { calldata: Hex; targetAddress: Address }[] = [];

  //     // let paymentStreamFlushAndCancelTxs: { calldata: Hex; targetAddress: Address }[] = [];
  //     // let paymentStreamFlushTxs: { calldata: Hex; targetAddress: Address }[] = [];
  //     // let paymentStreamCancelTxs: { calldata: Hex; targetAddress: Address }[] = [];
  //     // @todo should not flush same stream more than once
  //     // @todo possibly remove duplicate flushes after transactions have been prepared
  //     if (addedHats.length) {
  //       // First, prepare a single tx to create all the hats
  //       const createHatsTx = encodeFunctionData({
  //         abi: HatsAbi,
  //         functionName: 'batchCreateHats',
  //         args: prepareAddHatsTxArgs(addedHats, adminHatId, topHatAccount),
  //       });

  //       const mintHatsTx = encodeFunctionData({
  //         abi: HatsAbi,
  //         functionName: 'batchMintHats',
  //         // @note hatIds[], wearers[]
  //         args: [addedHats.map(h => h.id), addedHats.map(h => h.wearer)],
  //       });

  //       // finally, finally create smart account for hats.
  //       const createSmartAccountCallDatas = addedHats.map(hat => {
  //         return encodeFunctionData({
  //           abi: ERC6551RegistryAbi,
  //           functionName: 'createAccount',
  //           args: [
  //             hatsAccount1ofNMasterCopy,
  //             getERC6551RegistrySalt(BigInt(chain.id), getAddress(decentHatsMasterCopy)),
  //             BigInt(chain.id),
  //             hatsProtocol,
  //             hat.id,
  //           ],
  //         });
  //       });
  //       // Push these two txs to the included txs array.
  //       // They will be executed in order: add all hats first, then mint all hats to their respective wearers.
  //       createAndMintHatsTxs.push(createHatsTx);
  //       createAndMintHatsTxs.push(mintHatsTx);
  //       smartAccountTxs.push(
  //         ...createSmartAccountCallDatas.map(calldata => ({
  //           calldata,
  //           targetAddress: erc6551Registry,
  //         })),
  //       );
  //     }

  //     if (removedHatIds.length) {
  //       removedHatIds.forEach(hatId => {
  //         const roleHat = hatsTree.roleHats.find(hat => hat.id === hatId);
  //         if (roleHat && roleHat.payments?.length) {
  //           /**
  //            * Assumption: current state of blockchain
  //            * Fact: does the hat currently have funds to withdraw
  //            * Do: if yes, then flush the stream
  //            */

  //           const fundsToClaimStreams = roleHat.payments.filter(
  //             payment => payment.withdrawableAmount > 0n,
  //           );
  //           if (fundsToClaimStreams.length) {
  //             hatPaymentHatRemovedTxs.push({
  //               calldata: encodeFunctionData({
  //                 abi: HatsAbi,
  //                 functionName: 'transferHat',
  //                 args: [BigInt(hatId), roleHat.wearer, daoAddress],
  //               }),
  //               targetAddress: hatsProtocol,
  //             });
  //             fundsToClaimStreams.forEach(payment => {
  //               const wrappedFlushStreamTx = prepareHatsAccountFlushExecData(
  //                 payment.streamId,
  //                 payment.contractAddress,
  //                 roleHat.wearer,
  //               );
  //               hatPaymentHatRemovedTxs.push({
  //                 calldata: wrappedFlushStreamTx,
  //                 targetAddress: roleHat.smartAddress,
  //               });
  //             });
  //           }
  //           /**
  //            * Assumption: current state of blockchain
  //            * Fact: does the hat currently have funds that are not active or have not ended
  //            * Do: if yes, then cancel the stream
  //            */
  //           const streamsToCancel = roleHat.payments.filter(
  //             payment => !payment.isCancelled && payment.endDate > new Date(),
  //           );
  //           streamsToCancel.forEach(payment => {
  //             hatPaymentHatRemovedTxs.push(
  //               prepareCancelStreamTx(payment.streamId, payment.contractAddress),
  //             );
  //           });
  //           if (streamsToCancel.length || fundsToClaimStreams.length) {
  //             hatPaymentHatRemovedTxs.push({
  //               calldata: encodeFunctionData({
  //                 abi: HatsAbi,
  //                 functionName: 'transferHat',
  //                 args: [BigInt(hatId), daoAddress, roleHat.wearer],
  //               }),
  //               targetAddress: hatsProtocol,
  //             });
  //           }
  //         }

  //         // make transaction proxy through erc6551 contract
  //         removeHatTxs.push(
  //           encodeFunctionData({
  //             abi: HatsAccount1ofNAbi,
  //             functionName: 'execute',
  //             args: [
  //               hatsProtocol,
  //               0n,
  //               encodeFunctionData({
  //                 abi: HatsAbi,
  //                 functionName: 'setHatStatus',
  //                 args: [BigInt(hatId), false],
  //               }),
  //               0,
  //             ],
  //           }),
  //         );
  //       });
  //     }

  //     if (memberChangedHats.length) {
  //       memberChangedHats.map(({ id, currentWearer, newWearer }) => {
  //         const roleHat = hatsTree.roleHats.find(hat => hat.id === id);
  //         if (roleHat && roleHat.payments?.length) {
  //           /**
  //            * Assumption: current state of blockchain
  //            * Fact: does the hat currently have funds to withdraw
  //            * Do: if yes, then flush the stream
  //            */
  //           const fundsToClaimStreams = roleHat.payments.filter(
  //             payment => payment.withdrawableAmount > 0n,
  //           );
  //           if (fundsToClaimStreams.length) {
  //             hatPaymentWearerChangedTxs.push({
  //               calldata: encodeFunctionData({
  //                 abi: HatsAbi,
  //                 functionName: 'transferHat',
  //                 args: [BigInt(id), currentWearer, daoAddress],
  //               }),
  //               targetAddress: hatsProtocol,
  //             });
  //             fundsToClaimStreams.forEach(payment => {
  //               const wrappedFlushStreamTx = prepareHatsAccountFlushExecData(
  //                 payment.streamId,
  //                 payment.contractAddress,
  //                 roleHat.wearer,
  //               );
  //               hatPaymentWearerChangedTxs.push({
  //                 calldata: wrappedFlushStreamTx,
  //                 targetAddress: roleHat.smartAddress,
  //               });
  //             });
  //             hatPaymentWearerChangedTxs.push({
  //               calldata: encodeFunctionData({
  //                 abi: HatsAbi,
  //                 functionName: 'transferHat',
  //                 args: [BigInt(id), daoAddress, newWearer],
  //               }),
  //               targetAddress: hatsProtocol,
  //             });
  //           }
  //         } else {
  //           transferHatTxs.push(
  //             encodeFunctionData({
  //               abi: HatsAbi,
  //               functionName: 'transferHat',
  //               args: [BigInt(id), daoAddress, newWearer],
  //             }),
  //           );
  //         }
  //       });
  //     }

  //     if (roleDetailsChangedHats.length) {
  //       hatDetailsChangedTxs = roleDetailsChangedHats.map(({ id, details }) => {
  //         return encodeFunctionData({
  //           abi: HatsAbi,
  //           functionName: 'changeHatDetails',
  //           args: [BigInt(id), details],
  //         });
  //       });
  //     }

  //     if (addedPaymentStreams.length) {
  //       const preparedPaymentTransactions = prepareBatchLinearStreamCreation(addedPaymentStreams);
  //       hatPaymentAddedTxs.push(...preparedPaymentTransactions.preparedTokenApprovalsTransactions);
  //       hatPaymentAddedTxs.push(...preparedPaymentTransactions.preparedStreamCreationTransactions);
  //     }

  //     if (editedPaymentStreams.length) {
  //       /**
  //        * Assumption: current state of blockchain
  //        * Fact: does the hat currently have funds to withdraw
  //        * Do: if yes, then flush the stream
  //        */
  //       const paymentCancelTxs: { calldata: Hex; targetAddress: Address }[] = [];
  //       editedPaymentStreams.forEach(paymentStream => {
  //         paymentCancelTxs.push({
  //           calldata: encodeFunctionData({
  //             abi: HatsAbi,
  //             functionName: 'transferHat',
  //             args: [paymentStream.roleHatId, paymentStream.roleHatWearer, daoAddress],
  //           }),
  //           targetAddress: hatsProtocol,
  //         });
  //         const { wrappedFlushStreamTx, cancelStreamTx } = prepareHatFlushAndCancelPayment(
  //           paymentStream.streamId,
  //           paymentStream.streamContractAddress,
  //           paymentStream.roleHatWearer,
  //         );
  //         paymentCancelTxs.push({
  //           calldata: wrappedFlushStreamTx,
  //           targetAddress: paymentStream.roleHatSmartAddress,
  //         });
  //         paymentCancelTxs.push(cancelStreamTx);
  //         paymentCancelTxs.push({
  //           calldata: encodeFunctionData({
  //             abi: HatsAbi,
  //             functionName: 'transferHat',
  //             args: [paymentStream.roleHatId, daoAddress, paymentStream.roleHatWearer],
  //           }),
  //           targetAddress: hatsProtocol,
  //         });
  //       });

  //       const preparedPaymentTransactions = prepareBatchLinearStreamCreation(editedPaymentStreams);
  //       hatPaymentEditedTxs.push(...paymentCancelTxs);
  //       hatPaymentEditedTxs.push(...preparedPaymentTransactions.preparedTokenApprovalsTransactions);
  //       hatPaymentEditedTxs.push(...preparedPaymentTransactions.preparedStreamCreationTransactions);
  //     }
  //     console.log('🚀 ~ createAndMintHatsTxs:', createAndMintHatsTxs);
  //     console.log('🚀 ~ transferHatTxs:', transferHatTxs);
  //     console.log('🚀 ~ ...hatPaymentWearerChangedTxs.map:', hatPaymentWearerChangedTxs);
  //     console.log('🚀 ~ hatDetailsChangedTxs:', hatDetailsChangedTxs);
  //     console.log('🚀 ~ hatPaymentAddedTxs:', hatPaymentAddedTxs);
  //     console.log('🚀 ~ hatPaymentEditedTxs:', hatPaymentEditedTxs);
  //     console.log('🚀 ~ smartAccountTxs:', smartAccountTxs);
  //     console.log('🚀 ~ removeHatTxs:', removeHatTxs);
  //     console.log('🚀 ~ hatPaymentHatRemovedTxs:', hatPaymentHatRemovedTxs);
  //     const proposalTransactions = {
  //       targets: [
  //         ...createAndMintHatsTxs.map(() => hatsProtocol),
  //         ...smartAccountTxs.map(({ targetAddress }) => targetAddress),
  //         ...hatPaymentHatRemovedTxs.map(({ targetAddress }) => targetAddress),
  //         ...removeHatTxs.map(() => topHatAccount),
  //         ...hatPaymentWearerChangedTxs.map(({ targetAddress }) => targetAddress),
  //         ...transferHatTxs.map(() => hatsProtocol),
  //         ...hatDetailsChangedTxs.map(() => hatsProtocol),
  //         ...hatPaymentAddedTxs.map(({ targetAddress }) => targetAddress),
  //         ...hatPaymentEditedTxs.map(({ targetAddress }) => targetAddress),
  //       ],
  //       calldatas: [
  //         ...createAndMintHatsTxs,
  //         ...smartAccountTxs.map(({ calldata }) => calldata),
  //         ...hatPaymentHatRemovedTxs.map(({ calldata }) => calldata),
  //         ...removeHatTxs,
  //         ...hatPaymentWearerChangedTxs.map(({ calldata }) => calldata),
  //         ...transferHatTxs,
  //         ...hatDetailsChangedTxs,
  //         ...hatPaymentAddedTxs.map(({ calldata }) => calldata),
  //         ...hatPaymentEditedTxs.map(({ calldata }) => calldata),
  //       ],
  //       metaData: proposalMetadata,
  //       values: [
  //         ...createAndMintHatsTxs.map(() => 0n),
  //         ...smartAccountTxs.map(() => 0n),
  //         ...hatPaymentHatRemovedTxs.map(() => 0n),
  //         ...removeHatTxs.map(() => 0n),
  //         ...hatPaymentWearerChangedTxs.map(() => 0n),
  //         ...transferHatTxs.map(() => 0n),
  //         ...hatDetailsChangedTxs.map(() => 0n),
  //         ...hatPaymentAddedTxs.map(() => 0n),
  //         ...hatPaymentEditedTxs.map(() => 0n),
  //       ],
  //     };

  //     return proposalTransactions;
  //   },
  //   [
  //     hatsProtocol,
  //     hatsTree,
  //     prepareCancelStreamTx,
  //     prepareHatFlushAndCancelPayment,
  //     prepareHatsAccountFlushExecData,
  //     daoAddress,
  //     prepareBatchLinearStreamCreation,
  //     hatsAccount1ofNMasterCopy,
  //     chain.id,
  //     decentHatsMasterCopy,
  //     erc6551Registry,
  //   ],
  // );

  const createHatTx = useCallback(
    async (formRole: RoleHatFormValueEdited, adminHatId: bigint, topHatSmartAccount: Address) => {
      if (formRole.name === undefined || formRole.description === undefined) {
        throw new Error('Name or description of added Role is undefined.');
      }

      if (formRole.wearer === undefined) {
        throw new Error('Member of added Role is undefined.');
      }

      const hatStruct = await createHatStruct(
        formRole.name,
        formRole.description,
        getAddress(formRole.wearer),
        uploadHatDescription,
      );

      return {
        calldata: encodeFunctionData({
          abi: HatsAbi,
          functionName: 'createHat',
          args: [
            adminHatId, // adminHatId
            hatStruct.details, // details
            hatStruct.maxSupply, // maxSupply
            topHatSmartAccount, // eligibilityModule
            topHatSmartAccount, // toggleModule
            hatStruct.isMutable, // isMutable
            hatStruct.wearer, // wearer
          ],
        }),
        targetAddress: hatsProtocol,
      };
    },
    [uploadHatDescription, hatsProtocol],
  );

  const mintHatTx = useCallback(
    (newHatId: bigint, formHat: RoleHatFormValueEdited) => {
      if (formHat.wearer === undefined) {
        throw new Error('Hat wearer of added hat is undefined.');
      }

      return {
        calldata: encodeFunctionData({
          abi: HatsAbi,
          functionName: 'mintHat',
          args: [newHatId, getAddress(formHat.wearer)],
        }),
        targetAddress: hatsProtocol,
      };
    },
    [hatsProtocol],
  );

  const createSmartAccountTx = useCallback(
    (newHatId: bigint) => {
      return {
        calldata: encodeFunctionData({
          abi: ERC6551RegistryAbi,
          functionName: 'createAccount',
          args: [
            hatsAccount1ofNMasterCopy,
            getERC6551RegistrySalt(BigInt(chain.id), getAddress(decentHatsMasterCopy)),
            BigInt(chain.id),
            hatsProtocol,
            newHatId,
          ],
        }),
        targetAddress: erc6551Registry,
      };
    },
    [chain.id, decentHatsMasterCopy, erc6551Registry, hatsAccount1ofNMasterCopy, hatsProtocol],
  );

  const prepareAllTxs = useCallback(async (modifiedHats: RoleHatFormValueEdited[]) => {
    if (!hatsTree || !daoAddress) {
      throw new Error('Cannot prepare transactions');
    }

    const topHatAccount = hatsTree.topHat.smartAddress;
    const adminHatId = BigInt(hatsTree.adminHat.id);

    const allTxs: { calldata: Hex; targetAddress: Address }[] = [];

    // we need to keep track of how many new hats there are,
    // so that we can correctly predict the hatId for the "create new role" transaction
    let newHatCount = 0;

    // "active stream" = not cancelled and not past end date
    // "inactive stream" = cancelled or past end date

    // for each modified role
    for (let index = 0; index < modifiedHats.length; index++) {
      const formHat = modifiedHats[index];

      if (formHat.editedRole.status === EditBadgeStatus.New) {
        // New Role
        // - "create new role" transaction data
        //   - includes create hat, mint hat, create smart account

        const newHatId = predictHatId({
          adminHatId: hatsTree.adminHat.id,
          hatsCount: hatsTree.roleHatsTotalCount + newHatCount,
        });
        newHatCount++;

        allTxs.push(await createHatTx(formHat, adminHatId, topHatAccount));
        allTxs.push(mintHatTx(newHatId, formHat));
        allTxs.push(createSmartAccountTx(BigInt(newHatId)));

        //     - does it have any streams?
        const newStreams =
          !!formHat?.payments && formHat.payments.filter(payment => !payment.streamId);
        if (!!newStreams && newStreams.length > 0) {
          const newPredictedHatSmartAccount = await predictSmartAccount(newHatId);
          const preparedNewStreams = newStreams.map(stream => {
            if (
              !stream.asset ||
              !stream.startDate ||
              !stream.endDate ||
              !stream.amount?.bigintValue ||
              stream.amount.bigintValue <= 0n
            ) {
              throw new Error('Form Values inValid', {
                cause: stream,
              });
            }

            return {
              recipient: newPredictedHatSmartAccount,
              startDateTs: Math.floor(stream.startDate.getTime() / 1000),
              endDateTs: Math.ceil(stream.endDate.getTime() / 1000),
              cliffDateTs: Math.floor((stream.cliffDate?.getTime() ?? 0) / 1000),
              totalAmount: stream.amount.bigintValue,
              assetAddress: stream.asset.address,
            };
          });

          //       - allTxs.push(create new streams transactions datas)
          const newStreamTxData = prepareBatchLinearStreamCreation(preparedNewStreams);
          allTxs.push(...newStreamTxData.preparedTokenApprovalsTransactions);
          allTxs.push(...newStreamTxData.preparedStreamCreationTransactions);
        }
      } else if (formHat.editedRole.status === EditBadgeStatus.Removed) {
        // Deleted Role
        if (formHat.wearer === undefined || formHat.smartAddress === undefined) {
          throw new Error('Cannot prepare transactions for removed role without wearer');
        }

        //     - does it have any inactive streams which have funds to claim?
        const fundsToClaimStreams = formHat?.payments?.filter(
          payment => (payment?.withdrawableAmount ?? 0n) > 0n,
        );
        if (fundsToClaimStreams && fundsToClaimStreams.length) {
          //       - allTxs.push(flush stream transaction data)
          allTxs.push({
            calldata: encodeFunctionData({
              abi: HatsAbi,
              functionName: 'transferHat',
              args: [BigInt(formHat.id), getAddress(formHat.wearer), daoAddress],
            }),
            targetAddress: hatsProtocol,
          });
          for (const stream of fundsToClaimStreams) {
            if (!stream.streamId || !stream.contractAddress) {
              throw new Error(
                'Stream ID and Stream ContractAddress is required for flush stream transaction',
              );
            }
            const wrappedFlushStreamTx = prepareHatsAccountFlushExecData(
              stream.streamId,
              stream.contractAddress,
              getAddress(formHat.wearer),
            );
            allTxs.push({
              calldata: wrappedFlushStreamTx,
              targetAddress: formHat.smartAddress,
            });
          }
        }

        //     - does it have any active streams?
        const streamsToCancel = formHat?.payments?.filter(
          payment => !!payment.endDate && !payment.isCancelled && payment.endDate > new Date(),
        );
        if (!!streamsToCancel && streamsToCancel.length) {
          //       - allTxs.push(cancel stream transactions data)
          for (const stream of streamsToCancel) {
            if (!stream.streamId || !stream.contractAddress) {
              throw new Error(
                'Stream ID and Stream ContractAddress is required for cancel stream transaction',
              );
            }
            allTxs.push(prepareCancelStreamTx(stream.streamId, stream.contractAddress));
          }
        }
        if (
          (streamsToCancel && streamsToCancel.length) ||
          (fundsToClaimStreams && fundsToClaimStreams.length)
        ) {
          allTxs.push({
            calldata: encodeFunctionData({
              abi: HatsAbi,
              functionName: 'transferHat',
              args: [BigInt(formHat.id), daoAddress, getAddress(formHat.wearer)],
            }),
            targetAddress: hatsProtocol,
          });
        }

        //     - allTxs.push(deactivate role transaction data)
        allTxs.push({
          calldata: encodeFunctionData({
            abi: HatsAccount1ofNAbi,
            functionName: 'execute',
            args: [
              hatsProtocol,
              0n,
              encodeFunctionData({
                abi: HatsAbi,
                functionName: 'setHatStatus',
                args: [BigInt(formHat.id), false],
              }),
              0,
            ],
          }),
          targetAddress: topHatAccount,
        });
      } else {
        // Edited Role (existing role)
        //   - else
        //     - is the name or description changed?
        //       - allTxs.push(edit details data)
        //     - is the member changed?
        //       - does it have any inactive streams which have funds to claim?
        //         - allTxs.push(flush stream transaction data)
        //       - for each active stream
        //         - if stream was edited, too
        //           - skip
        //         - else
        //           - allTxs.push(flush stream transaction data)
        //     - for each active streams
        //       - if stream was edited
        //         - allTxs.push(flush and cancel stream transaction data)
        //         - allTxs.push(create new stream transaction data)
        //     - for each new streams
        //       - allTxs.push(create new stream transaction data)
      }
    }

    return allTxs;
  }, []);

  const createEditRolesProposal = useCallback(
    async (values: RoleFormValues, formikHelpers: FormikHelpers<RoleFormValues>) => {
      if (!publicClient) {
        throw new Error('Cannot create Roles proposal without public client');
      }

      const { setSubmitting } = formikHelpers;
      setSubmitting(true);

      if (!safe) {
        setSubmitting(false);
        throw new Error('Cannot create Roles proposal without known Safe');
      }

      // filter to hats that have been modified, or whose payments have been modified (ie includes `editedRole` prop)
      const modifiedHats: RoleHatFormValueEdited[] = values.hats
        .map(hat => {
          if (hat.editedRole === undefined) {
            return null;
          }
          return { ...hat, editedRole: hat.editedRole };
        })
        .filter(hat => hat !== null);

      let proposalData: ProposalExecuteData;
      try {
        if (!hatsTreeId) {
          // This safe has no top hat, so we prepare a proposal to create one. This will also create an admin hat,
          // along with any other hats that are added.

          if (modifiedHats.some(hat => hat.editedRole.status !== EditBadgeStatus.New)) {
            throw new Error(
              'No Hats Tree ID exists, but some modified Roles are marked as non-New.',
            );
          }

          const newHatStructs = await createHatStructsFromRolesFormValues(
            modifiedHats,
            uploadHatDescription,
          );
          proposalData = await prepareCreateTopHatProposalData(
            values.proposalMetadata,
            newHatStructs,
          );
        } else {
          if (!hatsTree) {
            throw new Error('Cannot edit Roles without a HatsTree');
          }

          const allTxs = await prepareAllTxs(modifiedHats);
          console.log('🚀 ~ allTxs:', allTxs);

          // Convert addedHats to include predicted id
          // const addedHatsWithIds = await Promise.all(
          //   addedHatsRolesValues.map(async (hat, index) => {
          //     const hatId = predictHatId({
          //       adminHatId: hatsTree.adminHat.id,
          //       hatsCount: hatsTree.roleHatsTotalCount + index,
          //     });
          //     return {
          //       ...hat,
          //       id: hatId,
          //       // @note For new hats, a randomId is created for temporary indentification
          //       formId: hat.id,
          //     };
          //   }),
          // );

          // const removedHatIds = identifyAndPrepareRemovedHats(modifiedHats);
          // const memberChangedHats = identifyAndPrepareMemberChangedHats(modifiedHats, getHat);
          // const roleDetailsChangedHats = await identifyAndPrepareRoleDetailsChangedHats(
          //   modifiedHats,
          //   uploadHatDescription,
          //   getHat,
          // );
          // const editedPaymentStreams = identifyAndPrepareEditedPaymentStreams(
          //   modifiedHats,
          //   getHat,
          //   getPayment,
          // );

          // const addedPaymentStreamsOnNewHats = await identifyAndPrepareAddedPaymentStreams(
          //   modifiedHats,
          //   addedHatsWithIds,
          //   getHat,
          //   predictSmartAccount,
          // );

          // proposalData = prepareEditHatsProposalData(
          //   values.proposalMetadata,
          //   addedHats.map((hat, index) => ({ ...hat, id: addedHatsWithIds[index].id })),
          //   removedHatIds,
          //   memberChangedHats,
          //   roleDetailsChangedHats,
          //   editedPaymentStreams,
          //   addedPaymentStreamsOnNewHats,
          // );

          proposalData = {
            targets: allTxs.map(({ targetAddress }) => targetAddress),
            calldatas: allTxs.map(({ calldata }) => calldata),
            values: allTxs.map(() => 0n),
            metaData: values.proposalMetadata,
          };
        }

        // // All done, submit the proposal!
        // await submitProposal({
        //   proposalData,
        //   nonce: values.customNonce ?? safe.nextNonce,
        //   pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
        //   successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
        //   failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
        //   successCallback: submitProposalSuccessCallback,
        // });
      } catch (e) {
        console.error(e);
        toast(t('encodingFailedMessage', { ns: 'proposal' }));
      } finally {
        formikHelpers.setSubmitting(false);
      }
    },
    [],
  );

  return {
    createEditRolesProposal,
  };
}
