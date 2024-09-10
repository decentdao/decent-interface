import { FormikHelpers } from 'formik';
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
  EditBadgeStatus,
  HatStruct,
  RoleFormValues,
  RoleHatFormValueEdited,
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
    },
  } = useNetworkConfig();

  const { t } = useTranslation(['roles', 'navigation', 'modals', 'common']);

  const { submitProposal } = useSubmitProposal();
  const { prepareBatchLinearStreamCreation, prepareFlushStreamTx, prepareCancelStreamTx } =
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

      const newHat: HatStruct = {
        maxSupply: 1,
        details,
        imageURI: '',
        isMutable: true,
        wearer: wearer,
      };

      return newHat;
    },
    [hatsDetailsBuilder, uploadHatDescription],
  );

  const createHatStructFromRoleFormValues = useCallback(
    async (role: RoleHatFormValueEdited) => {
      if (role.name === undefined || role.description === undefined) {
        throw new Error('Hat name or description of added hat is undefined.');
      }

      if (role.wearer === undefined) {
        throw new Error('Hat wearer of added hat is undefined.');
      }

      return createHatStruct(role.name, role.description, getAddress(role.wearer));
    },
    [createHatStruct],
  );

  const createHatStructsFromRolesFormValues = useCallback(
    async (modifiedRoles: RoleHatFormValueEdited[]) => {
      return Promise.all(modifiedRoles.map(role => createHatStructFromRoleFormValues(role)));
    },
    [createHatStructFromRoleFormValues],
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
    async (proposalMetadata: CreateProposalMetadata, modifiedHats: RoleHatFormValueEdited[]) => {
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

      const addedHats = await createHatStructsFromRolesFormValues(modifiedHats);

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
      daoName,
      decentHatsMasterCopy,
      erc6551Registry,
      hatsAccount1ofNMasterCopy,
      hatsDetailsBuilder,
      hatsProtocol,
      keyValuePairs,
      uploadHatDescription,
      createHatStructsFromRolesFormValues,
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
    [createHatStruct, hatsProtocol],
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

  const createBatchLinearStreamCreationTx = useCallback(
    (formStreams: SablierPaymentFormValues[], roleSmartAccountAddress: Address) => {
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

  const prepareCreateRolesModificationsProposalData = useCallback(
    async (proposalMetadata: CreateProposalMetadata, modifiedHats: RoleHatFormValueEdited[]) => {
      if (!hatsTree || !daoAddress) {
        throw new Error('Cannot prepare transactions without hats tree or DAO address');
      }

      const topHatAccount = hatsTree.topHat.smartAddress;
      const adminHatId = BigInt(hatsTree.adminHat.id);

      const allTxs: { calldata: Hex; targetAddress: Address }[] = [];

      // we need to keep track of how many new hats there are,
      // so that we can correctly predict the hatId for the "create new role" transaction
      let newHatCount = 0;

      // "active stream" = not cancelled and not past end date
      // "inactive stream" = cancelled or past end date

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
          /**
           * New Role
           * Create new hat, mint it, create smart account, and create new streams
           */
          const newHatId = predictHatId({
            adminHatId: hatsTree.adminHat.id,
            hatsCount: hatsTree.roleHatsTotalCount + newHatCount,
          });
          newHatCount++;

          allTxs.push(await createHatTx(formHat, adminHatId, topHatAccount));
          allTxs.push(mintHatTx(newHatId, formHat));
          allTxs.push(createSmartAccountTx(BigInt(newHatId)));

          const newStreams = (formHat.payments ?? []).filter(payment => !payment.streamId);
          if (newStreams.length > 0) {
            const newPredictedHatSmartAccount = await predictSmartAccount(newHatId);
            const newStreamTxData = createBatchLinearStreamCreationTx(
              newStreams,
              newPredictedHatSmartAccount,
            );
            allTxs.push(...newStreamTxData.preparedTokenApprovalsTransactions);
            allTxs.push(...newStreamTxData.preparedStreamCreationTransactions);
          }
        } else if (formHat.editedRole.status === EditBadgeStatus.Removed) {
          /**
           * Removed Role
           * Transfer hat to DAO, flush streams, cancel streams, transfer hat to back to wearer, set hat status to false
           */
          if (formHat.smartAddress === undefined) {
            throw new Error(
              'Cannot prepare transactions for removed role without smart account address',
            );
          }
          allTxs.push({
            calldata: encodeFunctionData({
              abi: HatsAbi,
              functionName: 'transferHat',
              args: [BigInt(formHat.id), getAddress(formHat.wearer), daoAddress],
            }),
            targetAddress: hatsProtocol,
          });

          const fundsToClaimStreams = (formHat.payments ?? []).filter(
            payment => (payment?.withdrawableAmount ?? 0n) > 0n,
          );
          if (fundsToClaimStreams.length) {
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

          const streamsToCancel = (formHat.payments ?? []).filter(
            payment => !!payment.endDate && !payment.isCancelled && payment.endDate > new Date(),
          );
          if (streamsToCancel.length) {
            for (const stream of streamsToCancel) {
              if (!stream.streamId || !stream.contractAddress) {
                throw new Error(
                  'Stream ID and Stream ContractAddress is required for cancel stream transaction',
                );
              }
              allTxs.push(prepareCancelStreamTx(stream.streamId, stream.contractAddress));
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
            /**
             * Updated Role Name or Description Transaction
             * Upload the new details to IPFS, Change hat details
             */
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
            /**
             * Updated Role Member
             * Transfer hat to DAO, flush withdrawable streams, transfer hat to new wearer
             */

            if (formHat.smartAddress === undefined) {
              throw new Error('Cannot prepare transactions for edited role without smart address');
            }
            const originalHat = getHat(formHat.id);
            if (!originalHat) {
              throw new Error('Cannot find original hat');
            }
            const fundsToClaimStreams = (formHat.payments ?? []).filter(
              payment => (payment?.withdrawableAmount ?? 0n) > 0n && !payment.isCancelling,
            );

            if (fundsToClaimStreams.length) {
              allTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(formHat.id), originalHat.wearer, daoAddress],
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
                  originalHat.wearer,
                );
                allTxs.push({
                  calldata: wrappedFlushStreamTx,
                  targetAddress: formHat.smartAddress,
                });
              }
              // transfer hat from DAO to new wearer if there are any funds to claim
              allTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(formHat.id), daoAddress, getAddress(formHat.wearer)],
                }),
                targetAddress: hatsProtocol,
              });
            } else {
              // transfer hat from original wearer to new wearer if there are no funds to claim
              allTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsAbi,
                  functionName: 'transferHat',
                  args: [BigInt(formHat.id), originalHat.wearer, getAddress(formHat.wearer)],
                }),
                targetAddress: hatsProtocol,
              });
            }
          }
          if (formHat.editedRole.fieldNames.includes('payments')) {
            /**
             * New Streams
             * Create new streams
             */
            const newStreams = (formHat.payments ?? []).filter(payment => !payment.streamId);
            if (newStreams.length) {
              if (!formHat.smartAddress) {
                throw new Error(
                  'Cannot prepare transactions for edited role without smart address',
                );
              }
              const newPredictedHatSmartAccount = await predictSmartAccount(BigInt(formHat.id));
              const newStreamTxData = createBatchLinearStreamCreationTx(
                newStreams,
                newPredictedHatSmartAccount,
              );
              allTxs.push(...newStreamTxData.preparedTokenApprovalsTransactions);
              allTxs.push(...newStreamTxData.preparedStreamCreationTransactions);
            }

            /**
             * Cancelled Streams
             * Transfer hat to DAO, flush withdrawable streams, cancel streams
             */
            const cancelledStreams = (formHat.payments ?? []).filter(
              payment => payment.isCancelling && !!payment.streamId,
            );
            if (cancelledStreams.length) {
              for (const stream of cancelledStreams) {
                if (!stream.streamId || !stream.contractAddress || !formHat.smartAddress) {
                  throw new Error('Stream data is missing for cancel stream transaction');
                }
                // transfer hat to DAO
                allTxs.push({
                  calldata: encodeFunctionData({
                    abi: HatsAbi,
                    functionName: 'transferHat',
                    args: [BigInt(formHat.id), getAddress(formHat.wearer), daoAddress],
                  }),
                  targetAddress: hatsProtocol,
                });
                // flush withdrawable streams
                if (stream.withdrawableAmount && stream.withdrawableAmount > 0n) {
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
                // cancel stream
                allTxs.push(prepareCancelStreamTx(stream.streamId, stream.contractAddress));
              }
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
      createBatchLinearStreamCreationTx,
      createHatTx,
      createSmartAccountTx,
      daoAddress,
      getHat,
      hatsDetailsBuilder,
      hatsProtocol,
      hatsTree,
      mintHatTx,
      predictSmartAccount,
      prepareCancelStreamTx,
      prepareHatsAccountFlushExecData,
      uploadHatDescription,
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

        // // All done, submit the proposal!
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
        toast(t('encodingFailedMessage', { ns: 'proposal' }));
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
