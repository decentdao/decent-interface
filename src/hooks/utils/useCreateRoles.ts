import { FormikHelpers } from 'formik';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { zeroAddress, Address, encodeFunctionData, getAddress, Hex, Hash } from 'viem';
import DecentHatsAbi from '../../assets/abi/DecentHats_0_1_0_Abi';
import ERC6551RegistryAbi from '../../assets/abi/ERC6551RegistryAbi';
import GnosisSafeL2 from '../../assets/abi/GnosisSafeL2';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import HatsAccount1ofNAbi from '../../assets/abi/HatsAccount1ofN';
import {
  EditBadgeStatus,
  HatStruct,
  HatWearerChangedParams,
  RoleValue,
  RoleFormValues,
  BaseSablierStream,
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

const hatsDetailsBuilder = (data: { name: string; description: string }) => {
  return JSON.stringify({
    type: '1.0',
    data,
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
  const { hatsTree, hatsTreeId, getHat } = useRolesStore();
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

  const parseEditedHatsFormValues = useCallback(
    async (editedHats: RoleValue[]) => {
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
              eligibility: hatsTree?.topHat.smartAddress,
              toggle: hatsTree?.topHat.smartAddress,
              maxSupply: 1,
              details,
              imageURI: '',
              isMutable: true,
              wearer: getAddress(hat.wearer),
            };
          }),
      );

      // Parse removed hats
      const removedHatIds = editedHats
        .filter(hat => hat.editedRole?.status === EditBadgeStatus.Removed)
        .map(hat => hat.id);

      // Parse member changed hats
      const memberChangedHats: HatWearerChangedParams[] = editedHats
        .filter(
          hat =>
            hat.editedRole?.status === EditBadgeStatus.Updated &&
            hat.editedRole.fieldNames.includes('member'),
        )
        .map(hat => ({
          id: hat.id,
          currentWearer: getAddress(getHat(hat.id)!.wearer),
          newWearer: getAddress(hat.wearer),
        }))
        .filter(hat => hat.currentWearer !== hat.newWearer);

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

      // Parse role with edited payroll hats
      const editedPayrollHats = editedHats.filter(hat => {
        const payments = hat.payments?.filter(payment => !!payment.streamId);
        return payments?.length ? { ...hat, payments } : null;
      });

      // Parse role with added payroll hats
      const addedNewPaymentsHats: RoleValue[] = editedHats
        .map(hat => {
          const payments = hat.payments?.filter(payment => !payment.streamId);
          return payments?.length ? { ...hat, payments } : null;
        })
        .filter(hat => !!hat) as RoleValue[];

      return {
        addedHats,
        removedHatIds,
        memberChangedHats,
        roleDetailsChangedHats,
        addedNewPaymentsHats,
        editedPayrollHats,
      };
    },
    [getHat, hatsTree?.topHat.smartAddress, uploadHatDescription],
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
      edits: {
        addedHats: HatStruct[];
        removedHatIds: Hex[];
        memberChangedHats: HatWearerChangedParams[];
        roleDetailsChangedHats: {
          id: Address;
          details: string;
        }[];
        addedNewPaymentsHats: RoleValue[];
        editedPayrollHats: RoleValue[];
      },
    ) => {
      if (!hatsTree || !daoAddress) {
        throw new Error('Can not edit hats without Hats Tree!');
      }

      const adminHatId = hatsTree.adminHat.id;
      const topHatAccount = hatsTree.topHat.smartAddress;
      const {
        addedHats,
        removedHatIds,
        memberChangedHats,
        roleDetailsChangedHats,
        addedNewPaymentsHats,
        editedPayrollHats,
      } = edits;

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

      if (addedNewPaymentsHats.length) {
        const streamsData = addedNewPaymentsHats.flatMap(role =>
          (role.payments ?? []).map(payment => payment),
        );
        const recipients = addedNewPaymentsHats.flatMap(role =>
          (role.payments ?? []).map(() => role.smartAddress),
        );
        const preparedPaymentTransactions = prepareBatchLinearStreamCreation(
          streamsData,
          recipients,
        );

        streamsData.forEach((_, i) => {
          hatPaymentAddedTxs.push(
            preparedPaymentTransactions.preparedTokenApprovalsTransactions[i],
          );
          hatPaymentAddedTxs.push(
            preparedPaymentTransactions.preparedStreamCreationTransactions[i],
          );
        });
      }

      if (editedPayrollHats.length) {
        const paymentCancelTxs: { calldata: Hex; targetAddress: Address }[] = [];
        editedPayrollHats.forEach(role =>
          (role.payments ?? []).forEach(payment => {
            if (payment.streamId) {
              const { wrappedFlushStreamTx, cancelStreamTx } = prepareHatFlushAndCancelPayment(
                payment,
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
          }),
        );
        const streamsData = editedPayrollHats.flatMap(role =>
          (role.payments ?? []).map(payment => payment),
        );
        const recipients = editedPayrollHats.map(role => role.smartAddress);
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

  const createRolesEditProposal = useCallback(
    async (values: RoleFormValues, formikHelpers: FormikHelpers<RoleFormValues>) => {
      const { setSubmitting } = formikHelpers;
      setSubmitting(true);
      if (!safe) {
        setSubmitting(false);
        throw new Error('Cannot create Roles proposal without known Safe');
      }

      try {
        // filter to hats that have been modified (ie includes `editedRole` prop)
        const modifiedHats = values.hats.filter(hat => !!hat.editedRole);
        let proposalData: ProposalExecuteData;

        const editedHatStructs = await parseEditedHatsFormValues(modifiedHats);

        if (!hatsTreeId) {
          // This safe has no top hat, so we prepare a proposal to create one. This will also create an admin hat,
          // along with any other hats that are added.
          proposalData = await prepareCreateTopHatProposalData(
            values.proposalMetadata,
            editedHatStructs.addedHats,
          );
        } else {
          if (!hatsTree) {
            throw new Error('Cannot edit Roles without a HatsTree');
          }
          // This safe has a top hat, so we prepare a proposal to edit the hats that have changed.
          proposalData = prepareEditHatsProposalData(values.proposalMetadata, editedHatStructs);
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
      parseEditedHatsFormValues,
      hatsTreeId,
      submitProposal,
      t,
      submitProposalSuccessCallback,
      prepareCreateTopHatProposalData,
      hatsTree,
      prepareEditHatsProposalData,
    ],
  );

  return {
    createRolesEditProposal,
  };
}
