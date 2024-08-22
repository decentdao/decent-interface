import { FormikHelpers } from 'formik';
import isEqual from 'lodash.isequal';
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
  BaseSablierStream,
  EditBadgeStatus,
  HatStruct,
  HatWearerChangedParams,
  RoleFormValues,
  RoleHatFormValueEdited,
  SablierPayment,
  SablierPaymentFormValues,
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
import {
  DecentRoleHat,
  mapSablierPaymentFormValuesToSablierPayment,
  predictAccountAddress,
} from './../../store/roles/rolesStoreUtils';

const hatsDetailsBuilder = (data: { name: string; description: string }) => {
  return JSON.stringify({
    type: '1.0',
    data,
  });
};

const identifyAndPrepareAddedHats = (
  modifiedHats: RoleHatFormValueEdited[],
  // hatsTree: DecentTree | null | undefined,
  uploadHatDescription: (hatDescription: string) => Promise<string>,
) => {
  return Promise.all(
    modifiedHats
      .filter(hat => hat.editedRole.status === EditBadgeStatus.New)
      .map(async hat => {
        if (hat.name === undefined || hat.description === undefined) {
          throw new Error('Hat name or description of added hat is undefined.');
        }

        if (hat.wearer === undefined) {
          throw new Error('Hat wearer of added hat is undefined.');
        }

        const details = await uploadHatDescription(
          hatsDetailsBuilder({
            name: hat.name,
            description: hat.description,
          }),
        );

        const newHat: HatStruct = {
          // eligibility: hatsTree?.topHat.smartAddress,
          // toggle: hatsTree?.topHat.smartAddress,
          maxSupply: 1,
          details,
          imageURI: '',
          isMutable: true,
          wearer: getAddress(hat.wearer),
        };

        return newHat;
      }),
  );
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

      const hatWearerChanged: HatWearerChangedParams = {
        id: hat.id,
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
) => {
  return Promise.all(
    modifiedHats
      .filter(
        hat =>
          hat.editedRole.status === EditBadgeStatus.Updated &&
          (hat.editedRole.fieldNames.includes('roleName') ||
            hat.editedRole.fieldNames.includes('roleDescription')),
      )
      .map(async hat => {
        if (hat.id === undefined) {
          throw new Error('Hat ID of existing hat is undefined.');
        }

        if (hat.name === undefined || hat.description === undefined) {
          throw new Error('Hat name or description of existing hat is undefined.');
        }

        return {
          id: hat.id,
          details: await uploadHatDescription(
            hatsDetailsBuilder({
              name: hat.name,
              description: hat.description,
            }),
          ),
        };
      }),
  );
};

const identifyAndPrepareEditedPaymentStreams = (
  modifiedHats: RoleHatFormValueEdited[],
  getPayment: (hatId: Hex, streamId: string) => SablierPayment | null,
  getHat: (hatId: Hex) => DecentRoleHat | null,
) => {
  return modifiedHats.flatMap(formHat => {
    const currentHat = getHat(formHat.id);
    if (currentHat === null) {
      throw new Error("Couldn't find existing Hat for edited payment stream Hat.");
    }

    const payments = formHat.payments?.filter(payment => !!payment.streamId) || [];

    return payments
      .filter(payment => {
        if (payment.streamId === undefined) {
          return false;
        }
        const originalPayment = getPayment(formHat.id, payment.streamId);
        return !isEqual(payment, originalPayment);
      })
      .map(payment => ({
        recipient: currentHat.smartAddress,
        payment,
      }));
  });
};

const identifyAndPrepareAddedPaymentStreams = (
  modifiedHats: RoleHatFormValueEdited[],
  getHat: (hatId: Hex) => DecentRoleHat | null,
) => {
  return modifiedHats.flatMap(formHat => {
    const currentHat = getHat(formHat.id);
    if (currentHat === null) {
      throw new Error("Couldn't find existing Hat for added payment stream Hat.");
    }

    const payments = formHat.payments?.filter(payment => !payment.streamId) || [];

    return payments.map(payment => ({
      recipient: currentHat.smartAddress,
      payment,
    }));
  });
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

const prepareMintHatsTxArgs = (addedHats: HatStruct[], adminHatId: Hex, hatsCount: number) => {
  const hatIds: bigint[] = [];
  const wearers: Address[] = [];

  addedHats.forEach((hat, i) => {
    const predictedHatId = predictHatId({
      adminHatId,
      // Each predicted hat id is based on the current hat count, plus however many hat id have been predicted so far
      hatsCount: hatsCount + i,
    });
    hatIds.push(predictedHatId);
    wearers.push(hat.wearer);
  });

  return [hatIds, wearers] as const;
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
    (stream: BaseSablierStream, wearer: Address) => {
      const flushStreamTx = prepareFlushStreamTx(stream, wearer);
      const wrappedFlushStreamTx = encodeFunctionData({
        abi: HatsAccount1ofNAbi,
        functionName: 'execute',
        args: [flushStreamTx.targetAddress, 0n, flushStreamTx.calldata, 0],
      });

      return wrappedFlushStreamTx;
    },
    [prepareFlushStreamTx],
  );

  const prepareHatFlushAndCancelPayment = useCallback(
    (stream: BaseSablierStream, wearer: Address) => {
      const cancelStreamTx = prepareCancelStreamTx(stream);
      const wrappedFlushStreamTx = prepareHatsAccountFlushExecData(stream, wearer);

      return { wrappedFlushStreamTx, cancelStreamTx };
    },
    [prepareCancelStreamTx, prepareHatsAccountFlushExecData],
  );

  const prepareEditHatsProposalData = useCallback(
    (
      proposalMetadata: CreateProposalMetadata,
      addedHats: (HatStruct & { smartAddress: Address; id: bigint })[],
      removedHatIds: Hex[],
      memberChangedHats: HatWearerChangedParams[],
      roleDetailsChangedHats: {
        id: Hex;
        details: string;
      }[],
      editedPaymentStreams: {
        recipient: Address;
        payment: SablierPaymentFormValues;
      }[],
      addedPaymentStreams: {
        recipient: Address;
        payment: SablierPaymentFormValues;
      }[],
    ) => {
      if (!hatsTree || !daoAddress) {
        throw new Error('Can not edit hats without Hats Tree!');
      }

      const adminHatId = hatsTree.adminHat.id;
      const topHatAccount = hatsTree.topHat.smartAddress;

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

        // Finally, prepare a single tx to mint all the hats to the wearers
        const [hatIds, wearers] = prepareMintHatsTxArgs(
          addedHats,
          adminHatId,
          hatsTree.roleHatsTotalCount,
        );
        const mintHatsTx = encodeFunctionData({
          abi: HatsAbi,
          functionName: 'batchMintHats',
          args: [hatIds, wearers],
        });

        // finally, finally create smart account for hats.
        const createSmartAccountCallDatas = addedHats.map((_, i) => {
          return encodeFunctionData({
            abi: ERC6551RegistryAbi,
            functionName: 'createAccount',
            args: [
              hatsAccount1ofNMasterCopy,
              getERC6551RegistrySalt(BigInt(chain.id), getAddress(decentHatsMasterCopy)),
              BigInt(chain.id),
              hatsProtocol,
              hatIds[i],
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
                    payment,
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
                  payment,
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

      const preparedPaymentTransactions = prepareBatchLinearStreamCreation(addedPaymentStreams);

      addedPaymentStreams.forEach((_, i) => {
        hatPaymentAddedTxs.push(preparedPaymentTransactions.preparedTokenApprovalsTransactions[i]);
        hatPaymentAddedTxs.push(preparedPaymentTransactions.preparedStreamCreationTransactions[i]);
      });

      if (editedPaymentStreams.length) {
        const paymentCancelTxs: { calldata: Hex; targetAddress: Address }[] = [];

        editedPaymentStreams.forEach(role =>
          (role.payments ?? []).forEach(payment => {
            if (role.wearer === undefined) {
              throw new Error('Hat wearer of edited payroll role is undefined.');
            }

            if (role.smartAddress === undefined) {
              throw new Error('Hat smart address of edited payroll role is undefined');
            }

            if (payment.streamId && payment.contractAddress && payment.amount && payment.asset) {
              const { wrappedFlushStreamTx, cancelStreamTx } = prepareHatFlushAndCancelPayment(
                {
                  streamId: payment.streamId,
                  contractAddress: payment.contractAddress,
                  amount: payment.amount,
                  asset: payment.asset,
                },
                getAddress(role.wearer),
              );
              paymentCancelTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(role.id), getAddress(role.wearer), daoAddress],
                }),
                targetAddress: hatsProtocol,
              });
              paymentCancelTxs.push({
                calldata: wrappedFlushStreamTx,
                targetAddress: role.smartAddress,
              });
              paymentCancelTxs.push(cancelStreamTx);
              paymentCancelTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(role.id), daoAddress, getAddress(role.wearer)],
                }),
                targetAddress: hatsProtocol,
              });
            }

            const { wrappedFlushStreamTx, cancelStreamTx } = prepareHatFlushAndCancelPayment(
              mapSablierPaymentFormValuesToSablierPayment(payment),
              getAddress(role.wearer),
            );
            paymentCancelTxs.push({
              calldata: encodeFunctionData({
                abi: HatsAbi,
                functionName: 'transferHat',
                args: [BigInt(role.id), getAddress(role.wearer), daoAddress],
              }),
              targetAddress: hatsProtocol,
            });
            paymentCancelTxs.push({
              calldata: wrappedFlushStreamTx,
              targetAddress: role.smartAddress,
            });
            paymentCancelTxs.push(cancelStreamTx);
            paymentCancelTxs.push({
              calldata: encodeFunctionData({
                abi: HatsAbi,
                functionName: 'transferHat',
                args: [BigInt(role.id), daoAddress, getAddress(role.wearer)],
              }),
              targetAddress: hatsProtocol,
            });
          }),
        );
        const streamsData = editedPaymentStreams.flatMap(role =>
          (role.payments ?? []).map(payment => payment),
        );
        const recipients = editedPaymentStreams.flatMap(role =>
          (role.payments ?? []).map(() => {
            if (role.smartAddress === undefined) {
              throw new Error('Hat smart address for new payment on role is undefined.');
            }
            return role.smartAddress;
          }),
        );
        const preparedPaymentTransactions = prepareBatchLinearStreamCreation(
          streamsData,
          recipients,
        );

        streamsData.forEach((_, i) => {
          hatPaymentEditedTxs.push(
            preparedPaymentTransactions.preparedTokenApprovalsTransactions[i],
          );
          hatPaymentEditedTxs.push(
            preparedPaymentTransactions.preparedStreamCreationTransactions[i],
          );
        });
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

      // filter to hats that have been modified (ie includes `editedRole` prop)
      const modifiedHats: RoleHatFormValueEdited[] = values.hats
        .map(hat => {
          if (hat.editedRole === undefined) {
            return null;
          }
          return { ...hat, editedRole: hat.editedRole };
        })
        .filter(hat => hat !== null);

      try {
        const addedHats = await identifyAndPrepareAddedHats(modifiedHats, uploadHatDescription);
        const removedHatIds = identifyAndPrepareRemovedHats(modifiedHats);
        const memberChangedHats = identifyAndPrepareMemberChangedHats(modifiedHats, getHat);
        const roleDetailsChangedHats = await identifyAndPrepareRoleDetailsChangedHats(
          modifiedHats,
          uploadHatDescription,
        );
        const editedPaymentStreams = identifyAndPrepareEditedPaymentStreams(
          modifiedHats,
          getPayment,
          getHat,
        );
        const addedPaymentStreams = identifyAndPrepareAddedPaymentStreams(modifiedHats, getHat);

        let proposalData: ProposalExecuteData;
        if (!hatsTreeId) {
          // This safe has no top hat, so we prepare a proposal to create one. This will also create an admin hat,
          // along with any other hats that are added.
          proposalData = await prepareCreateTopHatProposalData(values.proposalMetadata, addedHats);
        } else {
          if (!hatsTree) {
            throw new Error('Cannot edit Roles without a HatsTree');
          }
          // This safe has a top hat, so we prepare a proposal to edit the hats that have changed.

          // Convert addedHats to include id and smartAddress
          const addedHatsWithIds = await Promise.all(
            addedHats.map(async (hat, index) => {
              const hatId = predictHatId({
                adminHatId: hatsTree.adminHat.id,
                hatsCount: hatsTree.roleHats.length + index,
              });
              const smartAddress = await predictAccountAddress({
                implementation: hatsAccount1ofNMasterCopy,
                chainId: BigInt(chain.id),
                tokenContract: hatsProtocol,
                tokenId: hatId,
                registryAddress: erc6551Registry,
                publicClient,
                decentHats: getAddress(decentHatsMasterCopy),
              });
              return {
                ...hat,
                id: hatId,
                smartAddress,
              };
            }),
          );

          proposalData = prepareEditHatsProposalData(
            values.proposalMetadata,
            addedHatsWithIds,
            removedHatIds,
            memberChangedHats,
            roleDetailsChangedHats,
            editedPaymentStreams,
            addedPaymentStreams,
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
      chain.id,
      decentHatsMasterCopy,
      erc6551Registry,
      getHat,
      getPayment,
      hatsAccount1ofNMasterCopy,
      hatsProtocol,
      hatsTree,
      hatsTreeId,
      prepareCreateTopHatProposalData,
      prepareEditHatsProposalData,
      publicClient,
      safe,
      submitProposal,
      submitProposalSuccessCallback,
      t,
      uploadHatDescription,
    ],
  );

  return {
    createEditRolesProposal,
  };
}
