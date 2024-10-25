import { abis } from '@fractal-framework/fractal-contracts';
import { FormikHelpers } from 'formik';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Address, encodeFunctionData, getAddress, Hex, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import GnosisSafeL2 from '../../assets/abi/GnosisSafeL2';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import HatsAccount1ofNAbi from '../../assets/abi/HatsAccount1ofN';
import { EditBadgeStatus, RoleHatFormValue, EditedRole } from '../../components/pages/Roles/types';
import { SendAssetsData } from '../../components/ui/modals/SendAssetsModal';
import { ERC6551_REGISTRY_SALT } from '../../constants/common';
import { DAO_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import useIPFSClient from '../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../store/roles/useRolesStore';
import { BigIntValuePair, CreateProposalMetadata, ProposalExecuteData } from '../../types';
import { SENTINEL_MODULE } from '../../utils/address';
import { prepareSendAssetsActionData } from '../../utils/dao/prepareSendAssetsProposalData';
import useSubmitProposal from '../DAO/proposal/useSubmitProposal';
import useCreateSablierStream from '../streams/useCreateSablierStream';
import { predictAccountAddress } from './../../store/roles/rolesStoreUtils';

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
      sablierV2LockupLinear,
    },
  } = useNetworkConfig();

  const { t } = useTranslation(['roles', 'navigation', 'modals', 'common']);

  const { submitProposal } = useSubmitProposal();
  const { prepareBatchLinearStreamCreation, prepareFlushStreamTxs, prepareCancelStreamTxs } =
    useCreateSablierStream();
  const ipfsClient = useIPFSClient();
  const publicClient = usePublicClient();
  const navigate = useNavigate();

  const hatsDetailsBuilder = useCallback((data: { name: string; description: string }) => {
    return JSON.stringify({
      type: '1.0',
      data,
    });
  }, []);

  const uploadHatDescription = useCallback(
    async (hatDescription: string) => {
      const response = await ipfsClient.add(hatDescription);
      return `ipfs://${response.Hash}`;
    },
    [ipfsClient],
  );

  const createHatStruct = useCallback(
    async (name: string, description: string, wearer: Address) => {
      const details = await uploadHatDescription(
        hatsDetailsBuilder({
          name: name,
          description: description,
        }),
      );

      const newHat = {
        maxSupply: 1 as const,
        details,
        imageURI: '',
        isMutable: true,
        wearer: wearer,
      };

      return newHat;
    },
    [hatsDetailsBuilder, uploadHatDescription],
  );

  const createHatStructWithPayments = useCallback(
    async (
      name: string,
      description: string,
      wearer: Address,
      payments: {
        totalAmount: bigint;
        asset: Address;
        startTimestamp: number;
        cliffTimestamp: number;
        endTimestamp: number;
      }[],
    ) => {
      if (daoAddress === null) {
        throw new Error('Can not create Hat Struct (with payments) without DAO Address');
      }

      const newHat = await createHatStruct(name, description, wearer);

      const newHatWithPayments = {
        ...newHat,
        sablierParams: payments.map(payment => ({
          sablier: sablierV2LockupLinear,
          sender: daoAddress,
          totalAmount: payment.totalAmount,
          asset: payment.asset,
          cancelable: true,
          transferable: true,
          timestamps: {
            start: payment.startTimestamp,
            cliff: payment.cliffTimestamp,
            end: payment.endTimestamp,
          },
          broker: { account: zeroAddress, fee: 0n },
        })),
      };

      return newHatWithPayments;
    },
    [createHatStruct, daoAddress, sablierV2LockupLinear],
  );

  const parseSablierPaymentsFromFormRolePayments = useCallback(
    (
      payments: {
        asset?: {
          address: Address;
          name: string;
          symbol: string;
          decimals: number;
          logo: string;
        };
        amount?: BigIntValuePair;
        startDate?: Date;
        endDate?: Date;
        cliffDate?: Date;
      }[],
    ) => {
      return payments.map(payment => {
        if (
          !payment.amount?.bigintValue ||
          !payment.asset ||
          !payment.startDate ||
          !payment.endDate
        ) {
          throw new Error('Missing required payment information');
        }

        return {
          totalAmount: payment.amount.bigintValue,
          asset: payment.asset.address,
          startTimestamp: Math.floor(payment.startDate.getTime() / 1000),
          cliffTimestamp: payment.cliffDate ? Math.floor(payment.cliffDate.getTime() / 1000) : 0,
          endTimestamp: Math.floor(payment.endDate.getTime() / 1000),
        };
      });
    },
    [],
  );

  const createHatStructsForNewTreeFromRolesFormValues = useCallback(
    async (modifiedRoles: (RoleHatFormValue & { editedRole: EditedRole })[]) => {
      return Promise.all(
        modifiedRoles.map(role => {
          if (role.name === undefined || role.description === undefined) {
            throw new Error('Hat name or description of added hat is undefined.');
          }

          if (role.wearer === undefined) {
            throw new Error('Hat wearer of added hat is undefined.');
          }

          const sablierPayments = parseSablierPaymentsFromFormRolePayments(role.payments ?? []);

          return createHatStructWithPayments(
            role.name,
            role.description,
            getAddress(role.wearer),
            sablierPayments,
          );
        }),
      );
    },
    [createHatStructWithPayments, parseSablierPaymentsFromFormRolePayments],
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
      });
    },
    [publicClient, hatsAccount1ofNMasterCopy, chain.id, hatsProtocol, erc6551Registry],
  );

  const getEnableDisableDecentHatsModuleData = useCallback(() => {
    const enableDecentHatsModuleData = encodeFunctionData({
      abi: GnosisSafeL2,
      functionName: 'enableModule',
      args: [decentHatsMasterCopy],
    });

    const disableDecentHatsModuleData = encodeFunctionData({
      abi: GnosisSafeL2,
      functionName: 'disableModule',
      args: [SENTINEL_MODULE, decentHatsMasterCopy],
    });

    return { enableDecentHatsModuleData, disableDecentHatsModuleData };
  }, [decentHatsMasterCopy]);

  const prepareCreateTopHatProposalData = useCallback(
    async (
      proposalMetadata: CreateProposalMetadata,
      modifiedHats: (RoleHatFormValue & { editedRole: EditedRole })[],
    ) => {
      if (!daoAddress) {
        throw new Error('Can not create top hat without DAO Address');
      }

      const { enableDecentHatsModuleData, disableDecentHatsModuleData } =
        getEnableDisableDecentHatsModuleData();

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

      const adminHat = {
        maxSupply: 1,
        details: adminHatDetails,
        imageURI: '',
        isMutable: true,
        wearer: zeroAddress,
        sablierParams: [],
      };

      const addedHats = await createHatStructsForNewTreeFromRolesFormValues(modifiedHats);

      const createAndDeclareTreeData = encodeFunctionData({
        abi: abis.DecentHats_0_1_0,
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
        targets: [daoAddress, decentHatsMasterCopy, daoAddress],
        calldatas: [
          enableDecentHatsModuleData,
          createAndDeclareTreeData,
          disableDecentHatsModuleData,
        ],
        metaData: proposalMetadata,
        values: [0n, 0n, 0n],
      };
    },
    [
      daoAddress,
      getEnableDisableDecentHatsModuleData,
      uploadHatDescription,
      hatsDetailsBuilder,
      daoName,
      createHatStructsForNewTreeFromRolesFormValues,
      hatsProtocol,
      hatsAccount1ofNMasterCopy,
      erc6551Registry,
      keyValuePairs,
      decentHatsMasterCopy,
    ],
  );

  const prepareNewHatTxs = useCallback(
    async (formRole: RoleHatFormValue & { editedRole: EditedRole }) => {
      if (formRole.name === undefined || formRole.description === undefined) {
        throw new Error('Role name or description is undefined.');
      }

      if (formRole.wearer === undefined) {
        throw new Error('Role member is undefined.');
      }

      if (!hatsTree) {
        throw new Error('Cannot create new hat without hats tree');
      }

      if (!daoAddress) {
        throw new Error('Cannot create new hat without DAO address');
      }

      if (!formRole.resolvedWearer) {
        throw new Error('Cannot create new hat without resolved wearer');
      }

      const hatStruct = await createHatStructWithPayments(
        formRole.name,
        formRole.description,
        formRole.resolvedWearer,
        parseSablierPaymentsFromFormRolePayments(formRole.payments ?? []),
      );

      const { enableDecentHatsModuleData, disableDecentHatsModuleData } =
        getEnableDisableDecentHatsModuleData();

      const createNewRoleData = encodeFunctionData({
        abi: abis.DecentHats_0_1_0,
        functionName: 'createRoleHat',
        args: [
          hatsProtocol,
          BigInt(hatsTree.adminHat.id),
          hatStruct,
          BigInt(hatsTree.topHat.id),
          hatsTree.topHat.smartAddress,
          erc6551Registry,
          hatsAccount1ofNMasterCopy,
          ERC6551_REGISTRY_SALT,
        ],
      });

      // Transfer top hat to the DecentHats module so it is authorised to create hats on the tree
      const transferTopHatToDecentHatsData = encodeFunctionData({
        abi: HatsAbi,
        functionName: 'transferHat',
        args: [BigInt(hatsTree.topHat.id), daoAddress, decentHatsMasterCopy],
      });

      return [
        {
          targetAddress: hatsProtocol,
          calldata: transferTopHatToDecentHatsData,
        },
        {
          targetAddress: daoAddress,
          calldata: enableDecentHatsModuleData,
        },
        {
          targetAddress: decentHatsMasterCopy,
          calldata: createNewRoleData,
        },
        {
          targetAddress: daoAddress,
          calldata: disableDecentHatsModuleData,
        },
      ];
    },
    [
      hatsTree,
      daoAddress,
      createHatStructWithPayments,
      parseSablierPaymentsFromFormRolePayments,
      getEnableDisableDecentHatsModuleData,
      hatsProtocol,
      erc6551Registry,
      hatsAccount1ofNMasterCopy,
      decentHatsMasterCopy,
    ],
  );

  const createBatchLinearStreamCreationTx = useCallback(
    (
      formStreams: {
        asset?: {
          address: Address;
          name: string;
          symbol: string;
          decimals: number;
          logo: string;
        };
        amount?: BigIntValuePair;
        startDate?: Date;
        endDate?: Date;
        cliffDate?: Date;
      }[],
      roleSmartAccountAddress: Address,
    ) => {
      const preparedStreams = formStreams.map(stream => {
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
          recipient: roleSmartAccountAddress,
          startDateTs: Math.floor(stream.startDate.getTime() / 1000),
          endDateTs: Math.ceil(stream.endDate.getTime() / 1000),
          cliffDateTs: Math.floor((stream.cliffDate?.getTime() ?? 0) / 1000),
          totalAmount: stream.amount.bigintValue,
          assetAddress: stream.asset.address,
        };
      });

      return prepareBatchLinearStreamCreation(preparedStreams);
    },
    [prepareBatchLinearStreamCreation],
  );

  const getStreamsWithFundsToClaimFromFromHat = useCallback(
    (formHat: RoleHatFormValue & { editedRole: EditedRole }) => {
      return (formHat.payments ?? []).filter(
        payment => (payment?.withdrawableAmount ?? 0n) > 0n && !payment.isCancelling,
      );
    },
    [],
  );

  const getNewStreamsFromFormHat = useCallback(
    (formHat: RoleHatFormValue & { editedRole: EditedRole }) => {
      return (formHat.payments ?? []).filter(payment => !payment.streamId);
    },
    [],
  );

  const getCancelledStreamsFromFormHat = useCallback(
    (formHat: RoleHatFormValue & { editedRole: EditedRole }) => {
      return (formHat.payments ?? []).filter(payment => payment.isCancelling && !!payment.streamId);
    },
    [],
  );

  const getStreamsWithFundsToClaimFromFormHat = useCallback(
    (formHat: RoleHatFormValue & { editedRole: EditedRole }) => {
      return (formHat.payments ?? []).filter(payment => (payment?.withdrawableAmount ?? 0n) > 0n);
    },
    [],
  );

  const getActiveStreamsFromFormHat = useCallback(
    (formHat: RoleHatFormValue & { editedRole: EditedRole }) => {
      return (formHat.payments ?? []).filter(
        payment => !payment.isCancelled && !!payment.endDate && payment.endDate > new Date(),
      );
    },
    [],
  );

  const prepareCreateRolesModificationsProposalData = useCallback(
    async (
      proposalMetadata: CreateProposalMetadata,
      modifiedHats: (RoleHatFormValue & { editedRole: EditedRole })[],
    ) => {
      if (!hatsTree || !daoAddress) {
        throw new Error('Cannot prepare transactions without hats tree or DAO address');
      }

      const topHatAccount = hatsTree.topHat.smartAddress;

      const allTxs: { calldata: Hex; targetAddress: Address }[] = [];

      // The Algorithm
      //
      // for each modified role
      //
      // New Role
      //   - Transfer the top hat to the DecentHats module, so it can create new hats on the safe's behalf
      //   - allTxs.push(createRoleHat). This will (in the DecentHats contract):
      //     - create hat,
      //     - mint hat,
      //     - create smart account for the hat,
      //     - create new streams on the hat if any added
      //  - createRoleHat will transfer the top hat back to the safe
      // Deleted Role
      //   - for each inactive stream with funds to claim
      //     - allTxs.push(flush stream transaction data)
      //   - for each active stream
      //     - allTxs.push(flush stream transaction data)
      //     - allTxs.push(cancel stream transaction data)
      //   - allTxs.push(deactivate role transaction data)
      // Edited Role
      //   - is the name or description changed?
      //     - allTxs.push(edit details data)
      //   - is the member changed?
      //     - for each stream with funds to claim
      //       - if stream is not set to be cancelled
      //         - allTxs.push(flush stream transaction data)
      //   - for each cancelled stream
      //     - allTxs.push(flush stream transaction data)
      //   - for each new stream
      //     - allTxs.push(create new stream transactions datas)

      for (let index = 0; index < modifiedHats.length; index++) {
        const formHat = modifiedHats[index];
        if (
          formHat.name === undefined ||
          formHat.description === undefined ||
          formHat.wearer === undefined
        ) {
          throw new Error('Role details are missing', {
            cause: formHat,
          });
        }

        if (formHat.editedRole.status === EditBadgeStatus.New) {
          allTxs.push(...(await prepareNewHatTxs(formHat)));
        } else if (formHat.editedRole.status === EditBadgeStatus.Removed) {
          if (formHat.smartAddress === undefined) {
            throw new Error(
              'Cannot prepare transactions for removed role without smart account address',
            );
          }

          const originalHat = getHat(formHat.id);
          if (!originalHat) {
            throw new Error('Cannot find original hat');
          }

          allTxs.push({
            calldata: encodeFunctionData({
              abi: HatsAbi,
              functionName: 'transferHat',
              args: [BigInt(formHat.id), originalHat.wearerAddress, daoAddress],
            }),
            targetAddress: hatsProtocol,
          });

          const streamsWithFundsToClaim = getStreamsWithFundsToClaimFromFormHat(formHat);

          if (streamsWithFundsToClaim.length) {
            // This role is being removed.
            // We need to flush out any unclaimed funds from streams on this role to the original wearer.
            for (const stream of streamsWithFundsToClaim) {
              if (!stream.streamId || !stream.contractAddress) {
                throw new Error(
                  'Stream ID and Stream ContractAddress is required for flush stream transaction',
                );
              }

              const flushStreamTxCalldata = prepareFlushStreamTxs({
                streamId: stream.streamId,
                to: getAddress(originalHat.wearerAddress),
                smartAccount: formHat.smartAddress,
              });

              allTxs.push(...flushStreamTxCalldata);
            }
          }

          const activeStreams = getActiveStreamsFromFormHat(formHat);

          if (activeStreams.length) {
            for (const stream of activeStreams) {
              if (!stream.streamId || !stream.contractAddress) {
                throw new Error(
                  'Stream ID and Stream ContractAddress is required for cancel stream transaction',
                );
              }
              allTxs.push(...prepareCancelStreamTxs(stream.streamId));
            }
          }

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
        } else if (formHat.editedRole.status === EditBadgeStatus.Updated) {
          if (
            formHat.editedRole.fieldNames.includes('roleName') ||
            formHat.editedRole.fieldNames.includes('roleDescription')
          ) {
            const details = await uploadHatDescription(
              hatsDetailsBuilder({
                name: formHat.name,
                description: formHat.description,
              }),
            );
            allTxs.push({
              calldata: encodeFunctionData({
                abi: HatsAbi,
                functionName: 'changeHatDetails',
                args: [BigInt(formHat.id), details],
              }),
              targetAddress: hatsProtocol,
            });
          }
          if (formHat.editedRole.fieldNames.includes('member')) {
            const newWearer = getAddress(formHat.wearer);
            if (formHat.smartAddress === undefined) {
              throw new Error('Cannot prepare transactions for edited role without smart address');
            }

            // formHat's `wearer` is the new wearer. We grab the original wearer (before this member change attempt)
            // on the hat, because we need that address to transfer to the new wearer.
            const originalHat = getHat(formHat.id);
            if (!originalHat) {
              throw new Error('Cannot find original hat');
            }

            const streamsWithFundsToClaim = getStreamsWithFundsToClaimFromFromHat(formHat);

            if (streamsWithFundsToClaim.length) {
              // If there are unclaimed funds on any streams on the hat, we need to flush them to the original wearer.
              // First, we transfer the hat to the Safe, which will then be able to withdraw the funds on behalf of the original wearer.
              // Finally, we transfer the hat from the Safe to the new wearer.
              allTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(formHat.id), originalHat.wearerAddress, daoAddress],
                }),
                targetAddress: hatsProtocol,
              });

              for (const stream of streamsWithFundsToClaim) {
                if (!stream.streamId || !stream.contractAddress) {
                  throw new Error(
                    'Stream ID and Stream ContractAddress is required for flush stream transaction',
                  );
                }

                const flushStreamTxCalldata = prepareFlushStreamTxs({
                  streamId: stream.streamId,
                  to: originalHat.wearerAddress,
                  smartAccount: formHat.smartAddress,
                });

                allTxs.push(...flushStreamTxCalldata);
              }

              allTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(formHat.id), daoAddress, newWearer],
                }),
                targetAddress: hatsProtocol,
              });
            } else {
              // Since there are no streams with funds to claim, we can just transfer the hat directly to the new wearer.
              allTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(formHat.id), originalHat.wearerAddress, newWearer],
                }),
                targetAddress: hatsProtocol,
              });
            }
          }

          if (formHat.editedRole.fieldNames.includes('payments')) {
            const cancelledStreamsOnHat = getCancelledStreamsFromFormHat(formHat);
            if (cancelledStreamsOnHat.length) {
              // This role edit includes stream cancels. In case there are any unclaimed funds on these streams,
              // we need to flush them out to the original wearer.

              const originalHat = getHat(formHat.id);
              if (!originalHat) {
                throw new Error('Cannot find original hat');
              }

              for (const stream of cancelledStreamsOnHat) {
                if (!stream.streamId || !stream.contractAddress || !formHat.smartAddress) {
                  throw new Error('Stream data is missing for cancel stream transaction');
                }

                // First transfer hat from the original wearer to the Safe
                allTxs.push({
                  calldata: encodeFunctionData({
                    abi: HatsAbi,
                    functionName: 'transferHat',
                    args: [BigInt(formHat.id), originalHat.wearerAddress, daoAddress],
                  }),
                  targetAddress: hatsProtocol,
                });

                // flush withdrawable streams to the original wearer
                if (stream.withdrawableAmount && stream.withdrawableAmount > 0n) {
                  const flushStreamTxCalldata = prepareFlushStreamTxs({
                    streamId: stream.streamId,
                    to: originalHat.wearerAddress,
                    smartAccount: formHat.smartAddress,
                  });

                  allTxs.push(...flushStreamTxCalldata);
                }

                // Cancel the stream
                allTxs.push(...prepareCancelStreamTxs(stream.streamId));

                // Finally, transfer the hat back to the correct wearer.
                // Because a payment cancel can occur in the same role edit as a member change, we need to ensure hat is
                // finally transferred to the correct wearer. Instead of transferring to `originalHat.wearer` here,
                // `formHat.wearer` will represent the new wearer if the role member was changed, but will otherwise remain
                // the original wearer since the member form field was untouched.
                allTxs.push({
                  calldata: encodeFunctionData({
                    abi: HatsAbi,
                    functionName: 'transferHat',
                    args: [BigInt(formHat.id), daoAddress, getAddress(formHat.wearer)],
                  }),
                  targetAddress: hatsProtocol,
                });
              }
            }

            const newStreamsOnHat = getNewStreamsFromFormHat(formHat);
            if (newStreamsOnHat.length) {
              if (!formHat.smartAddress) {
                throw new Error(
                  'Cannot prepare transactions for edited role without smart address',
                );
              }
              const newPredictedHatSmartAccount = await predictSmartAccount(BigInt(formHat.id));
              const newStreamTxData = createBatchLinearStreamCreationTx(
                newStreamsOnHat,
                newPredictedHatSmartAccount,
              );
              allTxs.push(...newStreamTxData.preparedTokenApprovalsTransactions);
              allTxs.push(...newStreamTxData.preparedStreamCreationTransactions);
            }
          }
        } else {
          throw new Error('Invalid Edited Status');
        }
      }

      return {
        targets: allTxs.map(({ targetAddress }) => targetAddress),
        calldatas: allTxs.map(({ calldata }) => calldata),
        values: allTxs.map(() => 0n),
        metaData: proposalMetadata,
      };
    },
    [
      hatsTree,
      daoAddress,
      prepareNewHatTxs,
      getHat,
      hatsProtocol,
      getStreamsWithFundsToClaimFromFormHat,
      getActiveStreamsFromFormHat,
      prepareFlushStreamTxs,
      prepareCancelStreamTxs,
      uploadHatDescription,
      hatsDetailsBuilder,
      getStreamsWithFundsToClaimFromFromHat,
      getCancelledStreamsFromFormHat,
      getNewStreamsFromFormHat,
      predictSmartAccount,
      createBatchLinearStreamCreationTx,
    ],
  );

  const createEditRolesProposal = useCallback(
    async (
      values: {
        proposalMetadata: CreateProposalMetadata;
        hats: RoleHatFormValue[];
        customNonce?: number;
        actions: SendAssetsData[];
      },
      formikHelpers: FormikHelpers<{
        proposalMetadata: CreateProposalMetadata;
        hats: RoleHatFormValue[];
        actions: SendAssetsData[];
      }>,
    ) => {
      if (!publicClient) {
        throw new Error('Cannot create Roles proposal without public client');
      }

      if (!safe) {
        throw new Error('Cannot create Roles proposal without known Safe');
      }

      const { setSubmitting } = formikHelpers;
      setSubmitting(true);

      // filter to hats that have been modified, or whose payments have been modified (ie includes `editedRole` prop)
      const modifiedHats: (RoleHatFormValue & { editedRole: EditedRole })[] = (
        await Promise.all(
          values.hats.map(async hat => {
            if (hat.editedRole === undefined) {
              return null;
            }
            return {
              ...hat,
              editedRole: hat.editedRole,
              wearer: hat.resolvedWearer,
            };
          }),
        )
      ).filter(hat => hat !== null);

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

          proposalData = await prepareCreateTopHatProposalData(
            values.proposalMetadata,
            modifiedHats,
          );
        } else {
          if (!hatsTree) {
            throw new Error('Cannot edit Roles without a HatsTree');
          }

          proposalData = await prepareCreateRolesModificationsProposalData(
            values.proposalMetadata,
            modifiedHats,
          );
        }

        // Add "send assets" actions to the proposal data
        values.actions.forEach(action => {
          const actionData = prepareSendAssetsActionData({
            transferAmount: action.transferAmount,
            asset: action.asset,
            destinationAddress: action.destinationAddress,
          });
          proposalData.targets.push(actionData.target);
          proposalData.values.push(actionData.value);
          proposalData.calldatas.push(actionData.calldata);
        });

        // All done, submit the proposal!
        await submitProposal({
          proposalData,
          nonce: values.customNonce ?? safe.nextNonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
          successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
          failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
          successCallback: () => {
            if (daoAddress) {
              navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
            }
          },
        });
      } catch (e) {
        console.error(e);
        toast.error(t('encodingFailedMessage', { ns: 'proposal' }));
      } finally {
        formikHelpers.setSubmitting(false);
      }
    },
    [
      addressPrefix,
      daoAddress,
      hatsTree,
      hatsTreeId,
      navigate,
      prepareCreateRolesModificationsProposalData,
      prepareCreateTopHatProposalData,
      publicClient,
      safe,
      submitProposal,
      t,
    ],
  );

  return {
    createEditRolesProposal,
  };
}
