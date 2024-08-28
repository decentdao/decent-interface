import { FormikHelpers } from 'formik';
import { isEqual } from 'lodash';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Address, encodeFunctionData, getAddress, Hash, Hex, zeroAddress } from 'viem';
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

const identifyAndPrepareAddedHats = async (
  modifiedHats: RoleHatFormValueEdited[],
  uploadHatDescription: (hatDescription: string) => Promise<string>,
) => {
  let roleHatFormValuesPlus: (RoleHatFormValueEdited & { wearer: Address; details: string })[] = [];

  const hatStructs = await Promise.all(
    modifiedHats
      .filter(formHat => formHat.editedRole.status === EditBadgeStatus.New)
      .map(async formHat => {
        if (formHat.name === undefined || formHat.description === undefined) {
          throw new Error('Hat name or description of added hat is undefined.');
        }

        if (formHat.wearer === undefined) {
          throw new Error('Hat wearer of added hat is undefined.');
        }

        const details = await uploadHatDescription(
          hatsDetailsBuilder({
            name: formHat.name,
            description: formHat.description,
          }),
        );

        const newHat: HatStruct = {
          maxSupply: 1,
          details,
          imageURI: '',
          isMutable: true,
          wearer: getAddress(formHat.wearer),
        };

        roleHatFormValuesPlus.push({ ...formHat, wearer: getAddress(formHat.wearer), details });
        return newHat;
      }),
  );

  return [hatStructs, roleHatFormValuesPlus] as const;
};

const identifyAndPrepareRemovedHats = (modifiedHats: RoleHatFormValueEdited[]) => {
  return modifiedHats
    .filter(hat => hat.editedRole.status === EditBadgeStatus.Removed)
    .map(hat => {
      if (hat.id === undefined) {
        throw new Error('Hat ID of removed hat is undefined.');
      }

      return hat.id;
    });
};

const identifyAndPrepareMemberChangedHats = (
  modifiedHats: RoleHatFormValueEdited[],
  getHat: (hatId: Hex) => DecentRoleHat | null,
) => {
  return modifiedHats
    .filter(
      hat =>
        hat.editedRole.status === EditBadgeStatus.Updated &&
        hat.editedRole.fieldNames.includes('member'),
    )
    .map(hat => {
      if (hat.wearer === undefined || hat.id === undefined) {
        throw new Error('Hat wearer of member changed Hat is undefined.');
      }

      const currentHat = getHat(hat.id);
      if (currentHat === null) {
        throw new Error("Couldn't find existing Hat for member changed Hat.");
      }

      const hatWearerChanged = {
        id: currentHat.id,
        currentWearer: getAddress(currentHat.wearer),
        newWearer: getAddress(hat.wearer),
      };

      return hatWearerChanged;
    })
    .filter(hat => hat.currentWearer !== hat.newWearer);
};

const identifyAndPrepareRoleDetailsChangedHats = (
  modifiedHats: RoleHatFormValueEdited[],
  uploadHatDescription: (hatDescription: string) => Promise<string>,
  getHat: (hatId: Hex) => DecentRoleHat | null,
) => {
  return Promise.all(
    modifiedHats
      .filter(
        formHat =>
          formHat.editedRole.status === EditBadgeStatus.Updated &&
          (formHat.editedRole.fieldNames.includes('roleName') ||
            formHat.editedRole.fieldNames.includes('roleDescription')),
      )
      .map(async formHat => {
        if (formHat.id === undefined) {
          throw new Error('Hat ID of existing hat is undefined.');
        }

        if (formHat.name === undefined || formHat.description === undefined) {
          throw new Error('Hat name or description of existing hat is undefined.');
        }

        const currentHat = getHat(formHat.id);
        if (currentHat === null) {
          throw new Error("Couldn't find existing Hat for details changed Hat.");
        }

        return {
          id: currentHat.id,
          details: await uploadHatDescription(
            hatsDetailsBuilder({
              name: formHat.name,
              description: formHat.description,
            }),
          ),
        };
      }),
  );
};

const identifyAndPrepareEditedPaymentStreams = (
  modifiedHats: RoleHatFormValueEdited[],
  getHat: (hatId: Hex) => DecentRoleHat | null,
  getPayment: (hatId: Hex, streamId: string) => SablierPayment | null,
): PreparedEditedStreamData[] => {
  return modifiedHats.flatMap(formHat => {
    const currentHat = getHat(formHat.id);
    if (currentHat === null) {
      throw new Error("Couldn't find existing Hat for edited payment stream Hat.");
    }

    if (formHat.payments === undefined) {
      return [];
    }

    return formHat.payments
      .filter(payment => {
        if (payment.streamId === undefined) {
          return false;
        }
        // @note remove payments that haven't been edited
        const originalPayment = getPayment(formHat.id, payment.streamId);
        if (originalPayment === null) {
          return false;
        }
        return !isEqual(payment, originalPayment);
      })
      .map(payment => {
        if (
          !payment.streamId ||
          !payment.contractAddress ||
          !payment.asset ||
          !payment.startDate ||
          !payment.endDate ||
          !payment.amount?.bigintValue ||
          payment.amount.bigintValue <= 0n
        ) {
          throw new Error('Form Values inValid', {
            cause: payment,
          });
        }

        return {
          streamId: payment.streamId,
          recipient: currentHat.smartAddress,
          startDateTs: payment.startDate.getTime(),
          endDateTs: payment.endDate.getTime(),
          cliffDateTs: payment.cliffDate?.getTime() ?? 0,
          totalAmount: payment.amount.bigintValue,
          assetAddress: payment.asset.address,
          roleHatId: BigInt(currentHat.id),
          roleHatWearer: currentHat.wearer,
          roleHatSmartAddress: currentHat.smartAddress,
        };
      });
  });
};

const identifyAndPrepareAddedPaymentStreams = async (
  modifiedHats: RoleHatFormValueEdited[],
  addedHatsWithIds: AddedHatsWithIds[],
  getHat: (hatId: Hex) => DecentRoleHat | null,
  predictSmartAccount: (hatId: bigint) => Promise<Address>,
): Promise<PreparedNewStreamData[]> => {
  const preparedStreamDataMapped = await Promise.all(
    modifiedHats.map(async formHat => {
      if (formHat.payments === undefined || formHat.editedRole.status !== EditBadgeStatus.Updated) {
        return [];
      }

      const payments = formHat.payments.filter(payment => !payment.streamId);
      let recipientAddress: Address;
      const existingRoleHat = getHat(formHat.id);
      if (!!existingRoleHat) {
        recipientAddress = existingRoleHat.smartAddress;
      } else {
        const addedRoleHat = addedHatsWithIds.find(addedHat => addedHat.formId === formHat.id);
        if (!addedRoleHat) {
          throw new Error('Could not find added role hat for added payment stream.');
        }
        recipientAddress = await predictSmartAccount(addedRoleHat.id);
      }
      return payments.map(payment => {
        if (
          !payment.asset ||
          !payment.startDate ||
          !payment.endDate ||
          !payment.amount?.bigintValue ||
          payment.amount.bigintValue <= 0n
        ) {
          throw new Error('Form Values inValid', {
            cause: payment,
          });
        }

        return {
          recipient: recipientAddress,
          startDateTs: payment.startDate.getTime(),
          endDateTs: payment.endDate.getTime(),
          cliffDateTs: payment.cliffDate?.getTime() ?? 0,
          totalAmount: payment.amount.bigintValue,
          assetAddress: payment.asset.address,
        };
      });
    }),
  );
  return preparedStreamDataMapped.flat();
};

const prepareAddHatsTxArgs = (addedHats: HatStruct[], adminHatId: Hex, topHatAccount: Address) => {
  const admins: bigint[] = [];
  const details: string[] = [];
  const maxSupplies: number[] = [];
  const eligibilityModules: Address[] = [];
  const toggleModules: Address[] = [];
  const mutables: boolean[] = [];
  const imageURIs: string[] = [];

  addedHats.forEach(hat => {
    admins.push(BigInt(adminHatId));
    details.push(hat.details);
    maxSupplies.push(hat.maxSupply);
    eligibilityModules.push(topHatAccount);
    toggleModules.push(topHatAccount);
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

  const prepareEditHatsProposalData = useCallback(
    (
      proposalMetadata: CreateProposalMetadata,
      addedHats: PreparedAddedHatsData[],
      removedHatIds: Hex[],
      memberChangedHats: PreparedMemberChangeData[],
      roleDetailsChangedHats: PreparedChangedRoleDetailsData[],
      editedPaymentStreams: PreparedEditedStreamData[],
      addedPaymentStreams: PreparedNewStreamData[],
    ) => {
      if (!hatsTree || !daoAddress) {
        throw new Error('Can not edit hats without Hats Tree!');
      }

      const topHatAccount = hatsTree.topHat.smartAddress;
      const adminHatId = hatsTree.adminHat.id;

      const createAndMintHatsTxs: Hex[] = [];
      let removeHatTxs: Hex[] = [];
      let transferHatTxs: Hex[] = [];
      let hatDetailsChangedTxs: Hex[] = [];

      let smartAccountTxs: { calldata: Hex; targetAddress: Address }[] = [];
      let hatPaymentAddedTxs: { calldata: Hex; targetAddress: Address }[] = [];
      let hatPaymentEditedTxs: { calldata: Hex; targetAddress: Address }[] = [];

      let hatPaymentWearerChangedTxs: { calldata: Hex; targetAddress: Address }[] = [];
      let hatPaymentHatRemovedTxs: { calldata: Hex; targetAddress: Address }[] = [];

      if (addedHats.length) {
        // First, prepare a single tx to create all the hats
        const createHatsTx = encodeFunctionData({
          abi: HatsAbi,
          functionName: 'batchCreateHats',
          args: prepareAddHatsTxArgs(addedHats, adminHatId, topHatAccount),
        });

        const mintHatsTx = encodeFunctionData({
          abi: HatsAbi,
          functionName: 'batchMintHats',
          // @note hatIds[], wearers[]
          args: [addedHats.map(h => h.id), addedHats.map(h => h.wearer)],
        });

        // finally, finally create smart account for hats.
        const createSmartAccountCallDatas = addedHats.map(hat => {
          return encodeFunctionData({
            abi: ERC6551RegistryAbi,
            functionName: 'createAccount',
            args: [
              hatsAccount1ofNMasterCopy,
              getERC6551RegistrySalt(BigInt(chain.id), getAddress(decentHatsMasterCopy)),
              BigInt(chain.id),
              hatsProtocol,
              hat.id,
            ],
          });
        });
        // Push these two txs to the included txs array.
        // They will be executed in order: add all hats first, then mint all hats to their respective wearers.
        createAndMintHatsTxs.push(createHatsTx);
        createAndMintHatsTxs.push(mintHatsTx);
        smartAccountTxs.push(
          ...createSmartAccountCallDatas.map(calldata => ({
            calldata,
            targetAddress: erc6551Registry,
          })),
        );
      }

      if (removedHatIds.length) {
        removeHatTxs = removedHatIds.map(hatId => {
          const roleHat = hatsTree.roleHats.find(hat => hat.id === hatId);
          if (roleHat) {
            if (roleHat.payments?.length) {
              const wrappedFlushStreamTxs: Hex[] = [];
              const cancelStreamTxs: { calldata: Hex; targetAddress: Address }[] = [];
              roleHat.payments.forEach(payment => {
                if (payment?.streamId) {
                  const { wrappedFlushStreamTx, cancelStreamTx } = prepareHatFlushAndCancelPayment(
                    payment.streamId,
                    payment.asset.address,
                    roleHat.wearer,
                  );
                  wrappedFlushStreamTxs.push(wrappedFlushStreamTx);
                  cancelStreamTxs.push(cancelStreamTx);
                }
              });
              hatPaymentHatRemovedTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(hatId), roleHat.wearer, daoAddress],
                }),
                targetAddress: hatsProtocol,
              });
              wrappedFlushStreamTxs.forEach(wrappedFlushStreamTx => {
                hatPaymentHatRemovedTxs.push({
                  calldata: wrappedFlushStreamTx,
                  targetAddress: roleHat.smartAddress,
                });
              });
              cancelStreamTxs.forEach(cancelStreamTx => {
                hatPaymentHatRemovedTxs.push(cancelStreamTx);
              });
              hatPaymentHatRemovedTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(hatId), daoAddress, roleHat.wearer],
                }),
                targetAddress: hatsProtocol,
              });
            }
          }

          // make transaction proxy through erc6551 contract
          return encodeFunctionData({
            abi: HatsAccount1ofNAbi,
            functionName: 'execute',
            args: [
              hatsProtocol,
              0n,
              encodeFunctionData({
                abi: HatsAbi,
                functionName: 'setHatStatus',
                args: [BigInt(hatId), false],
              }),
              0,
            ],
          });
        });
      }

      if (memberChangedHats.length) {
        transferHatTxs = memberChangedHats
          .map(({ id, currentWearer, newWearer }) => {
            const roleHat = hatsTree.roleHats.find(hat => hat.id === id);
            if (roleHat && roleHat.payments?.length) {
              const payment = roleHat.payments[0];
              if (payment?.streamId) {
                const wrappedFlushStreamTx = prepareHatsAccountFlushExecData(
                  payment.streamId,
                  payment.asset.address,
                  roleHat.wearer,
                );
                hatPaymentWearerChangedTxs.push({
                  calldata: encodeFunctionData({
                    abi: HatsAbi,
                    functionName: 'transferHat',
                    args: [BigInt(id), currentWearer, daoAddress],
                  }),
                  targetAddress: hatsProtocol,
                });
                hatPaymentWearerChangedTxs.push({
                  calldata: wrappedFlushStreamTx,
                  targetAddress: roleHat.smartAddress,
                });
                hatPaymentWearerChangedTxs.push({
                  calldata: encodeFunctionData({
                    abi: HatsAbi,
                    functionName: 'transferHat',
                    args: [BigInt(id), daoAddress, newWearer],
                  }),
                  targetAddress: hatsProtocol,
                });
              }
            } else {
              return encodeFunctionData({
                abi: HatsAbi,
                functionName: 'transferHat',
                args: [BigInt(id), currentWearer, newWearer],
              });
            }
          })
          .filter(data => !!data) as Hash[];
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

      if (addedPaymentStreams.length) {
        const preparedPaymentTransactions = prepareBatchLinearStreamCreation(addedPaymentStreams);
        hatPaymentAddedTxs.push(...preparedPaymentTransactions.preparedTokenApprovalsTransactions);
        hatPaymentAddedTxs.push(...preparedPaymentTransactions.preparedTokenApprovalsTransactions);
      }

      if (editedPaymentStreams.length) {
        const paymentCancelTxs: { calldata: Hex; targetAddress: Address }[] = [];
        editedPaymentStreams.forEach(paymentStream => {
          const preparedHatFlushAndCancelTxs = prepareHatFlushAndCancelPayment(
            paymentStream.streamId,
            paymentStream.assetAddress,
            paymentStream.roleHatWearer,
          );
          paymentCancelTxs.push({
            calldata: encodeFunctionData({
              abi: HatsAbi,
              functionName: 'transferHat',
              args: [BigInt(paymentStream.roleHatId), paymentStream.roleHatWearer, daoAddress],
            }),
            targetAddress: hatsProtocol,
          });
          paymentCancelTxs.push({
            calldata: preparedHatFlushAndCancelTxs.wrappedFlushStreamTx,
            targetAddress: paymentStream.roleHatSmartAddress,
          });
          paymentCancelTxs.push(preparedHatFlushAndCancelTxs.cancelStreamTx);
          paymentCancelTxs.push({
            calldata: encodeFunctionData({
              abi: HatsAbi,
              functionName: 'transferHat',
              args: [BigInt(paymentStream.roleHatId), daoAddress, paymentStream.roleHatWearer],
            }),
            targetAddress: hatsProtocol,
          });

          const { wrappedFlushStreamTx, cancelStreamTx } = prepareHatFlushAndCancelPayment(
            paymentStream.streamId,
            paymentStream.assetAddress,
            paymentStream.roleHatWearer,
          );
          paymentCancelTxs.push({
            calldata: encodeFunctionData({
              abi: HatsAbi,
              functionName: 'transferHat',
              args: [paymentStream.roleHatId, paymentStream.roleHatWearer, daoAddress],
            }),
            targetAddress: hatsProtocol,
          });
          paymentCancelTxs.push({
            calldata: wrappedFlushStreamTx,
            targetAddress: paymentStream.roleHatSmartAddress,
          });
          paymentCancelTxs.push(cancelStreamTx);
          paymentCancelTxs.push({
            calldata: encodeFunctionData({
              abi: HatsAbi,
              functionName: 'transferHat',
              args: [paymentStream.roleHatId, daoAddress, paymentStream.roleHatWearer],
            }),
            targetAddress: hatsProtocol,
          });
        });

        const preparedPaymentTransactions = prepareBatchLinearStreamCreation(editedPaymentStreams);
        hatPaymentEditedTxs.push(...paymentCancelTxs);
        hatPaymentEditedTxs.push(...preparedPaymentTransactions.preparedTokenApprovalsTransactions);
        hatPaymentEditedTxs.push(...preparedPaymentTransactions.preparedStreamCreationTransactions);
      }

      const proposalTransactions = {
        targets: [
          ...createAndMintHatsTxs.map(() => hatsProtocol),
          ...smartAccountTxs.map(({ targetAddress }) => targetAddress),
          ...removeHatTxs.map(() => topHatAccount),
          ...transferHatTxs.map(() => hatsProtocol),
          ...hatDetailsChangedTxs.map(() => hatsProtocol),
          ...hatPaymentAddedTxs.map(({ targetAddress }) => targetAddress),
          ...hatPaymentEditedTxs.map(({ targetAddress }) => targetAddress),
        ],
        calldatas: [
          ...createAndMintHatsTxs,
          ...smartAccountTxs.map(({ calldata }) => calldata),
          ...removeHatTxs,
          ...transferHatTxs,
          ...hatDetailsChangedTxs,
          ...hatPaymentAddedTxs.map(({ calldata }) => calldata),
          ...hatPaymentEditedTxs.map(({ calldata }) => calldata),
        ],
        metaData: proposalMetadata,
        values: [
          ...createAndMintHatsTxs.map(() => 0n),
          ...smartAccountTxs.map(() => 0n),
          ...removeHatTxs.map(() => 0n),
          ...transferHatTxs.map(() => 0n),
          ...hatDetailsChangedTxs.map(() => 0n),
          ...hatPaymentAddedTxs.map(() => 0n),
          ...hatPaymentEditedTxs.map(() => 0n),
        ],
      };

      return proposalTransactions;
    },
    [
      hatsProtocol,
      hatsTree,
      prepareHatFlushAndCancelPayment,
      prepareHatsAccountFlushExecData,
      daoAddress,
      prepareBatchLinearStreamCreation,
      hatsAccount1ofNMasterCopy,
      chain.id,
      decentHatsMasterCopy,
      erc6551Registry,
    ],
  );

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

      // find all new hats and prepare them for creation
      try {
        const [addedHats, addedHatsRolesValues] = await identifyAndPrepareAddedHats(
          modifiedHats,
          uploadHatDescription,
        );

        let proposalData: ProposalExecuteData;

        if (!hatsTreeId) {
          // This safe has no top hat, so we prepare a proposal to create one. This will also create an admin hat,
          // along with any other hats that are added.
          proposalData = await prepareCreateTopHatProposalData(values.proposalMetadata, addedHats);
        } else {
          if (!hatsTree) {
            throw new Error('Cannot edit Roles without a HatsTree');
          }
          // Convert addedHats to include predicted id
          const addedHatsWithIds = await Promise.all(
            addedHatsRolesValues.map(async (hat, index) => {
              const hatId = predictHatId({
                adminHatId: hatsTree.adminHat.id,
                hatsCount: hatsTree.roleHats.length + index,
              });
              return {
                ...hat,
                id: hatId,
                // @note For new hats, a randomId is created for temporary indentification
                formId: hat.id,
              };
            }),
          );

          const removedHatIds = identifyAndPrepareRemovedHats(modifiedHats);
          const memberChangedHats = identifyAndPrepareMemberChangedHats(modifiedHats, getHat);
          const roleDetailsChangedHats = await identifyAndPrepareRoleDetailsChangedHats(
            modifiedHats,
            uploadHatDescription,
            getHat,
          );
          const editedPaymentStreams = identifyAndPrepareEditedPaymentStreams(
            modifiedHats,
            getHat,
            getPayment,
          );

          const addedPaymentStreamsOnNewHats = await identifyAndPrepareAddedPaymentStreams(
            modifiedHats,
            addedHatsWithIds,
            getHat,
            predictSmartAccount,
          );

          proposalData = prepareEditHatsProposalData(
            values.proposalMetadata,
            addedHats.map((hat, index) => ({ ...hat, id: addedHatsWithIds[index].id })),
            removedHatIds,
            memberChangedHats,
            roleDetailsChangedHats,
            editedPaymentStreams,
            addedPaymentStreamsOnNewHats,
          );
        }

        // All done, submit the proposal!
        await submitProposal({
          proposalData,
          nonce: values.customNonce ?? safe.nextNonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
          successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
          failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
          successCallback: submitProposalSuccessCallback,
        });
      } catch (e) {
        console.error(e);
        toast(t('encodingFailedMessage', { ns: 'proposal' }));
      } finally {
        formikHelpers.setSubmitting(false);
      }
    },
    [
      safe,
      hatsTreeId,
      hatsTree,
      uploadHatDescription,
      predictSmartAccount,
      getHat,
      getPayment,
      submitProposal,
      submitProposalSuccessCallback,
      prepareCreateTopHatProposalData,
      prepareEditHatsProposalData,
      publicClient,
      t,
    ],
  );

  return {
    createEditRolesProposal,
  };
}
