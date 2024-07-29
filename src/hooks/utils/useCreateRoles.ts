import { FormikHelpers } from 'formik';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { zeroAddress, Address, encodeFunctionData, getAddress, Hex, Hash } from 'viem';
import DecentHatsAbi from '../../assets/abi/DecentHats_0_1_0_Abi';
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
import { useRolesState } from '../../state/useRolesState';
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

const predictHatId = ({ adminHatId, hatsCount }: { adminHatId: Hex; hatsCount: number }) => {
  // 1 byte = 8 bits = 2 string characters
  const adminLevelBinary = adminHatId.slice(0, 14); // Top Admin ID 1 byte 0x + 4 bytes (tree ID) + next **16 bits** (admin level ID)

  // Each next level is next **16 bits**
  // Since we're operating only with direct child of top level admin - we don't care about nested levels
  // @dev At least for now?
  const newSiblingId = (hatsCount + 1).toString(16).padStart(4, '0');

  // Total length of Hat ID is **32 bytes** + 2 bytes for 0x
  return BigInt(`${adminLevelBinary}${newSiblingId}`.padEnd(66, '0'));
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
  const { hatsTree, hatsTreeId, getHat } = useRolesState();
  const {
    addressPrefix,
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

      // Parse role with added payroll hats
      const rolePaymentsAddedHats = [
        ...editedHats.filter(
          hat =>
            hat.editedRole?.status === EditBadgeStatus.Updated &&
            hat.editedRole.fieldNames.includes('payments'),
        ),
      ];

      return {
        addedHats,
        removedHatIds,
        memberChangedHats,
        roleDetailsChangedHats,
        rolePaymentsAddedHats,
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

  const prepareChangeHatWearerTx = useCallback(
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

  const prepareDeleteHatStreamTx = useCallback(
    (streams: BaseSablierStream[], wearer: Address) => {
      const cancelStreamTx = prepareCancelStreamTx(streams[0]);
      const wrappedFlushStreamTx = prepareChangeHatWearerTx(streams[0], wearer);

      return { wrappedFlushStreamTx, cancelStreamTx };
    },
    [prepareCancelStreamTx, prepareChangeHatWearerTx],
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
        rolePaymentsAddedHats: RoleValue[];
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
        rolePaymentsAddedHats,
      } = edits;

      const createAndMintHatsTxs: Hex[] = [];
      let removeHatTxs: Hex[] = [];
      let transferHatTxs: Hex[] = [];
      let hatDetailsChangedTxs: Hex[] = [];

      let hatPaymentAddedTxs: { calldata: Hex; targetAddress: Address }[] = [];
      let hatPaymentTokenApprovalTxs: { calldata: Hex; tokenAddress: Address }[] = [];

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
        const mintHatsTx = encodeFunctionData({
          abi: HatsAbi,
          functionName: 'batchMintHats',
          args: prepareMintHatsTxArgs(addedHats, adminHatId, hatsTree.roleHatsTotalCount),
        });

        // Push these two txs to the included txs array.
        // They will be executed in order: add all hats first, then mint all hats to their respective wearers.
        createAndMintHatsTxs.push(createHatsTx);
        createAndMintHatsTxs.push(mintHatsTx);
      }

      if (removedHatIds.length) {
        removeHatTxs = removedHatIds.map(hatId => {
          const roleHat = hatsTree.roleHats.find(hat => hat.id === hatId);
          if (roleHat) {
            if (roleHat.payments?.length) {
              // @todo Do not add flush out stream transaction if available balance to withdraw is 0
              const { wrappedFlushStreamTx, cancelStreamTx } = prepareDeleteHatStreamTx(
                roleHat.payments,
                roleHat.wearer,
              );
              hatPaymentHatRemovedTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(hatId), roleHat.wearer, daoAddress],
                }),
                targetAddress: hatsProtocol,
              });
              hatPaymentHatRemovedTxs.push({
                calldata: wrappedFlushStreamTx,
                targetAddress: roleHat.smartAddress,
              });
              hatPaymentHatRemovedTxs.push(cancelStreamTx);
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
              if (roleHat.payments && roleHat.payments.length) {
                // @todo Do not add flush out stream transaction if available balance to withdraw is 0
                const wrappedFlushStreamTx = prepareChangeHatWearerTx(
                  roleHat.payments[0],
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

      if (rolePaymentsAddedHats.length) {
        const streamsData = rolePaymentsAddedHats.flatMap(role =>
          (role.payments ?? []).map(payment => payment),
        );
        const recipients = rolePaymentsAddedHats.map(role => role.smartAddress);
        const preparedPaymentTransactions = prepareBatchLinearStreamCreation(
          streamsData,
          recipients,
        );

        hatPaymentTokenApprovalTxs = preparedPaymentTransactions.preparedTokenApprovalsTransactions;
        hatPaymentAddedTxs = preparedPaymentTransactions.preparedStreamCreationTransactions;
      }

      const proposalTransactions = {
        targets: [
          ...createAndMintHatsTxs.map(() => hatsProtocol),
          ...removeHatTxs.map(() => topHatAccount),
          ...transferHatTxs.map(() => hatsProtocol),
          ...hatDetailsChangedTxs.map(() => hatsProtocol),
          ...hatPaymentTokenApprovalTxs.map(({ tokenAddress }) => tokenAddress),
          ...hatPaymentAddedTxs.map(({ targetAddress }) => targetAddress),
        ],
        calldatas: [
          ...createAndMintHatsTxs,
          ...removeHatTxs,
          ...transferHatTxs,
          ...hatDetailsChangedTxs,
          ...hatPaymentTokenApprovalTxs.map(({ calldata }) => calldata),
          ...hatPaymentAddedTxs.map(({ calldata }) => calldata),
        ],
        metaData: proposalMetadata,
        values: [
          ...hatPaymentHatRemovedTxs.map(() => 0n),
          ...hatPaymentWearerChangedTxs.map(() => 0n),
          ...createAndMintHatsTxs.map(() => 0n),
          ...removeHatTxs.map(() => 0n),
          ...transferHatTxs.map(() => 0n),
          ...hatDetailsChangedTxs.map(() => 0n),
          ...hatPaymentTokenApprovalTxs.map(() => 0n),
          ...hatPaymentAddedTxs.map(() => 0n),
        ],
      };

      return proposalTransactions;
    },
    [
      hatsProtocol,
      hatsTree,
      prepareChangeHatWearerTx,
      prepareDeleteHatStreamTx,
      daoAddress,
      prepareBatchLinearStreamCreation,
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
