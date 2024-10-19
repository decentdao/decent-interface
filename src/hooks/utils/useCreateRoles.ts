import {
  HatsModulesClient,
  HATS_MODULES_FACTORY_ADDRESS,
  HATS_MODULES_FACTORY_ABI,
  checkAndEncodeArgs,
} from '@hatsprotocol/modules-sdk';
import { FormikHelpers } from 'formik';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Address, encodeFunctionData, getAddress, Hex, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { DecentHatsTempAbi } from '../../assets/abi/DecentHatsTempAbi';
import ERC6551RegistryAbi from '../../assets/abi/ERC6551RegistryAbi';
import GnosisSafeL2 from '../../assets/abi/GnosisSafeL2';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import HatsAccount1ofNAbi from '../../assets/abi/HatsAccount1ofN';
import { HatsElectionsEligibilityAbi } from '../../assets/abi/HatsElectionsEligibilityAbi';

import {
  EditBadgeStatus,
  HATS_ADDRESS,
  HatStruct,
  HatStructWithPayments,
  RoleFormValues,
  RoleHatFormValueEdited,
  SablierPaymentFormValues,
  TermedParams,
} from '../../components/pages/Roles/types';
import { ERC6551_REGISTRY_SALT } from '../../constants/common';
import { DAO_ROUTES } from '../../constants/routes';
import { getRandomBytes } from '../../helpers';
import { generateSalt } from '../../models/helpers/utils';
import { useFractal } from '../../providers/App/AppProvider';
import useIPFSClient from '../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { predictHatId, useRolesStore } from '../../store/roles';
import { CreateProposalMetadata, ProposalExecuteData } from '../../types';
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
      hatsAccount1ofNMasterCopy,
      erc6551Registry,
      keyValuePairs,
      sablierV2LockupLinear,
      decentHatsMasterCopy,
      decentAutonomousAdminMasterCopy,
      zodiacModuleProxyFactory,
    },
  } = useNetworkConfig();

  const { t } = useTranslation(['roles', 'navigation', 'modals', 'common']);

  const { submitProposal } = useSubmitProposal();
  const { prepareBatchLinearStreamCreation, prepareFlushStreamTxs, prepareCancelStreamTxs } =
    useCreateSablierStream();
  const ipfsClient = useIPFSClient();
  const publicClient = usePublicClient();
  const navigate = useNavigate();

  const hatsModulesClient = useMemo(() => {
    if (!publicClient) {
      return null;
    }
    const client = new HatsModulesClient({
      publicClient,
    });
    return client;
  }, [publicClient]);

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
    async (
      name: string,
      description: string,
      wearer: Address,
      isTermed: boolean,
      termedParams: TermedParams[],
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
        isMutable: !isTermed,
        wearer: wearer,
        isTermed,
        termedParams,
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
      isTermed: boolean,
      termedParams: TermedParams[],
    ) => {
      const newHat = await createHatStruct(name, description, wearer, isTermed, termedParams);

      if (daoAddress === null) {
        throw new Error('Can not create Hat Struct (with payments) without DAO Address');
      }

      const newHatWithPayments: HatStructWithPayments = {
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
    (payments: SablierPaymentFormValues[]) => {
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
  const parseRoleTermsFromFormRoleTerms = useCallback(
    (formRoleTerms: { termEndDate?: Date; nominee?: string }[]) => {
      return formRoleTerms.map(term => {
        if (term.termEndDate === undefined) {
          throw new Error('Term end date of added Role is undefined.');
        }
        if (term.nominee === undefined) {
          throw new Error('Nominee of added Role is undefined.');
        }
        return {
          termEndDateTs: BigInt(term.termEndDate.getTime() / 1000),
          nominatedWearers: [getAddress(term.nominee)],
        };
      });
    },
    [],
  );

  const createHatStructsForNewTreeFromRolesFormValues = useCallback(
    async (modifiedRoles: RoleHatFormValueEdited[]) => {
      return Promise.all(
        modifiedRoles.map(role => {
          if (role.name === undefined || role.description === undefined) {
            throw new Error('Hat name or description of added hat is undefined.');
          }

          if (role.wearer === undefined) {
            throw new Error('Hat wearer of added hat is undefined.');
          }
          const sablierPayments = parseSablierPaymentsFromFormRolePayments(role.payments ?? []);

          const roleTerms = parseRoleTermsFromFormRoleTerms(role.roleTerms ?? []);

          // @note for new termed roles, we set the first wearer to the first nominee
          const wearer = role.isTermed
            ? getAddress(roleTerms[0].nominatedWearers[0])
            : getAddress(role.wearer);

          return createHatStructWithPayments(
            role.name,
            role.description,
            wearer,
            sablierPayments,
            role.isTermed ?? false,
            roleTerms,
          );
        }),
      );
    },
    [
      createHatStructWithPayments,
      parseSablierPaymentsFromFormRolePayments,
      parseRoleTermsFromFormRoleTerms,
    ],
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

  const prepareCreateTopHatProposalData = useCallback(
    async (proposalMetadata: CreateProposalMetadata, modifiedHats: RoleHatFormValueEdited[]) => {
      if (!daoAddress) {
        throw new Error('Can not create top hat without DAO Address');
      }

      const enableModuleData = encodeFunctionData({
        abi: GnosisSafeL2,
        functionName: 'enableModule',
        args: [decentHatsMasterCopy],
      });

      const disableModuleData = encodeFunctionData({
        abi: GnosisSafeL2,
        functionName: 'disableModule',
        args: [SENTINEL_MODULE, decentHatsMasterCopy],
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

      const adminHat = {
        maxSupply: 1,
        details: adminHatDetails,
        imageURI: '',
        isMutable: true,
        wearer: zeroAddress,
        sablierParams: [],
        isTermed: false,
        termedParams: [],
      };

      if (!hatsModulesClient) {
        throw new Error('Cannot create Roles proposal without hatsModulesClient');
      }
      await hatsModulesClient.prepare();
      // @note for now the id argument seems to be the implementation address rather than the module id
      const module = hatsModulesClient.getModuleById('0xd3b916a8F0C4f9D1d5B6Af29c3C012dbd4f3149E');
      if (!module) {
        throw new Error('Could not find module');
      }
      const addedHats = await createHatStructsForNewTreeFromRolesFormValues(modifiedHats);
      console.log('🚀 ~ addedHats:', addedHats);
      const createAndDeclareTreeData = encodeFunctionData({
        // @todo replace with published abi from package
        abi: DecentHatsTempAbi,
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
            hatsModuleFactory: HATS_MODULES_FACTORY_ADDRESS,
            hatsElectionEligibilityImplementation: getAddress(module.implementationAddress),
            moduleProxyFactory: zodiacModuleProxyFactory,
            decentAutonomousAdminMasterCopy: decentAutonomousAdminMasterCopy,
          },
        ],
      });

      return {
        targets: [daoAddress, decentHatsMasterCopy, daoAddress],
        calldatas: [enableModuleData, createAndDeclareTreeData, disableModuleData],
        metaData: proposalMetadata,
        values: [0n, 0n, 0n],
      };
    },
    [
      daoAddress,
      daoName,
      decentHatsMasterCopy,
      decentAutonomousAdminMasterCopy,
      erc6551Registry,
      hatsAccount1ofNMasterCopy,
      hatsDetailsBuilder,
      hatsProtocol,
      keyValuePairs,
      uploadHatDescription,
      createHatStructsForNewTreeFromRolesFormValues,
      hatsModulesClient,
      zodiacModuleProxyFactory,
    ],
  );

  const createEligibilityModuleTx = useCallback(
    async (hatId: bigint, firstTermEnd: bigint, adminHatId: bigint) => {
      if (!hatsModulesClient) {
        throw new Error('Cannot create Roles proposal without hatsModulesClient');
      }
      await hatsModulesClient.prepare();
      const module = hatsModulesClient.getModuleById('0xd3b916a8F0C4f9D1d5B6Af29c3C012dbd4f3149E');
      if (!module) {
        throw new Error('Could not find module');
      }

      const immutableArgs = [adminHatId, 0n];
      // @todo: add args termEndDateTs
      const { encodedImmutableArgs, encodedMutableArgs } = checkAndEncodeArgs({
        module,
        immutableArgs,
        mutableArgs: [firstTermEnd],
      });

      const salt = BigInt(generateSalt(encodedMutableArgs, getRandomBytes()));
      const createElectionEligibilityInstanceTx = {
        calldata: encodeFunctionData({
          abi: HATS_MODULES_FACTORY_ABI,
          functionName: 'createHatsModule',
          args: [
            getAddress(module.implementationAddress),
            BigInt(hatId),
            encodedImmutableArgs,
            encodedMutableArgs,
            salt,
          ],
        }),
      };
      const predictedElectionEligibilityInstance = await hatsModulesClient.predictHatsModuleAddress(
        {
          moduleId: getAddress(module.id),
          hatId: hatId,
          immutableArgs: immutableArgs,
          saltNonce: salt,
        },
      );

      return {
        electionDeployModuleTx: {
          calldata: createElectionEligibilityInstanceTx.calldata,
          targetAddress: HATS_MODULES_FACTORY_ADDRESS,
        },
        predictedElectionEligibilityInstance: predictedElectionEligibilityInstance,
      };
    },
    [hatsModulesClient],
  );

  const createNewHatTx = useCallback(
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
        false,
        [],
      );

      return {
        calldata: encodeFunctionData({
          abi: HatsAbi,
          functionName: 'createHat',
          args: [
            adminHatId, // adminHatId
            hatStruct.details, // details
            hatStruct.maxSupply, // maxSupply
            // methinks these next two properties can/should be a "dead" (0x0000...4a75) address
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
  const createNewTermedHatTxs = useCallback(
    async (formRole: RoleHatFormValueEdited, adminHatId: bigint) => {
      if (formRole.name === undefined || formRole.description === undefined) {
        throw new Error('Name or description of added Role is undefined.');
      }

      if (formRole.wearer === undefined) {
        throw new Error('Member of added Role is undefined.');
      }
      if (formRole.roleTerms?.[0].termEndDate === undefined) {
        throw new Error('Term end date of added Role is undefined.');
      }
      if (formRole.roleTerms?.[0].nominee === undefined) {
        throw new Error('Nominee of added Role is undefined.');
      }

      let firstWearer = getAddress(formRole.wearer);
      let txData: { calldata: Hex; targetAddress: Address }[] = [];
      let eligibilityModule = HATS_ADDRESS;

      const { electionDeployModuleTx, predictedElectionEligibilityInstance } =
        await createEligibilityModuleTx(
          BigInt(formRole.id),
          // @todo fix this to be the correct term end date
          BigInt(Date.now()),
          adminHatId,
        );
      txData.push(electionDeployModuleTx);
      eligibilityModule = predictedElectionEligibilityInstance;
      firstWearer = getAddress(formRole.roleTerms[0].nominee);

      const hatStruct = await createHatStruct(
        formRole.name,
        formRole.description,
        getAddress(firstWearer),
        true,
        [
          {
            // @todo fix this to be the correct term end date
            termEndDateTs: BigInt(Date.now()),
            nominatedWearers: [getAddress(formRole.roleTerms[0].nominee)],
          },
        ],
      );

      txData.push({
        calldata: encodeFunctionData({
          abi: HatsAbi,
          functionName: 'createHat',
          args: [
            adminHatId, // adminHatId
            hatStruct.details, // details
            hatStruct.maxSupply, // maxSupply
            HATS_ADDRESS, // toggleModule
            eligibilityModule, // eligibilityModule
            !formRole.isTermed ? hatStruct.isMutable : false, // isMutable
            hatStruct.wearer, // wearer
          ],
        }),
        targetAddress: hatsProtocol,
      });
      if (eligibilityModule !== HATS_ADDRESS) {
        if (formRole.roleTerms?.[0].termEndDate === undefined) {
          throw new Error('Term end date of added Role is undefined.');
        }
        // create transactions to start first term right away
        txData.push({
          calldata: encodeFunctionData({
            abi: HatsElectionsEligibilityAbi,
            functionName: 'elect',
            // @todo fix this to be the correct term end date
            args: [BigInt(Date.now()), [hatStruct.wearer]],
          }),
          targetAddress: eligibilityModule,
        });
        txData.push({
          calldata: encodeFunctionData({
            abi: HatsElectionsEligibilityAbi,
            functionName: 'startNextTerm',
            args: [],
          }),
          targetAddress: eligibilityModule,
        });
      }

      return txData;
    },
    [createHatStruct, hatsProtocol, createEligibilityModuleTx],
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
            ERC6551_REGISTRY_SALT,
            BigInt(chain.id),
            hatsProtocol,
            newHatId,
          ],
        }),
        targetAddress: erc6551Registry,
      };
    },
    [chain.id, erc6551Registry, hatsAccount1ofNMasterCopy, hatsProtocol],
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

  const getStreamsWithFundsToClaimFromFromHat = useCallback((formHat: RoleHatFormValueEdited) => {
    return (formHat.payments ?? []).filter(
      payment => (payment?.withdrawableAmount ?? 0n) > 0n && !payment.isCancelling,
    );
  }, []);

  const getNewStreamsFromFormHat = useCallback((formHat: RoleHatFormValueEdited) => {
    return (formHat.payments ?? []).filter(payment => !payment.streamId);
  }, []);

  const getCancelledStreamsFromFormHat = useCallback((formHat: RoleHatFormValueEdited) => {
    return (formHat.payments ?? []).filter(payment => payment.isCancelling && !!payment.streamId);
  }, []);

  const getStreamsWithFundsToClaimFromFormHat = useCallback((formHat: RoleHatFormValueEdited) => {
    return (formHat.payments ?? []).filter(payment => (payment?.withdrawableAmount ?? 0n) > 0n);
  }, []);

  const getActiveStreamsFromFormHat = useCallback((formHat: RoleHatFormValueEdited) => {
    return (formHat.payments ?? []).filter(
      payment => !payment.isCancelled && !!payment.endDate && payment.endDate > new Date(),
    );
  }, []);

  const prepareCreateRolesModificationsProposalData = useCallback(
    async (proposalMetadata: CreateProposalMetadata, modifiedHats: RoleHatFormValueEdited[]) => {
      if (!hatsTree || !daoAddress) {
        throw new Error('Cannot prepare transactions without hats tree or DAO address');
      }

      if (!publicClient) {
        throw new Error('Cannot prepare transactions without public client');
      }

      const topHatAccount = hatsTree.topHat.smartAddress;
      const adminHatId = BigInt(hatsTree.adminHat.id);

      const allTxs: { calldata: Hex; targetAddress: Address }[] = [];

      // The Algorithm
      //
      // for each modified role
      //
      // New Role
      //   - allTxs.push(create hat)
      //   - allTxs.push(mint hat)
      //   - allTxs.push(create smart account)
      //   - does it have any streams?
      //     - allTxs.push(create new streams transactions datas)
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

      // we need to keep track of how many new hats there are,
      // so that we can correctly predict the hatId for the "create new role" transaction
      let newHatCount = 0;

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
          const newHatId = predictHatId({
            adminHatId: hatsTree.adminHat.id,
            hatsCount: hatsTree.roleHatsTotalCount + newHatCount,
          });
          newHatCount++;
          if (formHat.isTermed) {
            allTxs.push(...(await createNewTermedHatTxs(formHat, adminHatId)));
          } else {
            allTxs.push(await createNewHatTx(formHat, adminHatId, topHatAccount));
          }
          allTxs.push(mintHatTx(newHatId, formHat));
          allTxs.push(createSmartAccountTx(BigInt(newHatId)));

          // if there are streams to create
          const newStreams = getNewStreamsFromFormHat(formHat);

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
          if (formHat.smartAddress === undefined) {
            throw new Error(
              'Cannot prepare transactions for removed role without smart account address',
            );
          }

          // @todo: For all instances of `getAddress(formHat.wearer)` we should confirm that at this point, `formHat.wearer` is definitely an `Address` type.
          const originalHat = getHat(formHat.id);
          if (!originalHat) {
            throw new Error('Cannot find original hat');
          }

          allTxs.push({
            calldata: encodeFunctionData({
              abi: HatsAbi,
              functionName: 'transferHat',
              args: [BigInt(formHat.id), getAddress(originalHat.wearer), daoAddress],
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
                to: getAddress(originalHat.wearer),
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
          if (formHat.editedRole.fieldNames.includes('member') && !formHat.isTermed) {
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
                  args: [BigInt(formHat.id), originalHat.wearer, daoAddress],
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
                  to: originalHat.wearer,
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
                  args: [BigInt(formHat.id), originalHat.wearer, newWearer],
                }),
                targetAddress: hatsProtocol,
              });
            }
          }
          if (formHat.editedRole.fieldNames.includes('payments') && !formHat.isTermed) {
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
                    args: [BigInt(formHat.id), originalHat.wearer, daoAddress],
                  }),
                  targetAddress: hatsProtocol,
                });

                // flush withdrawable streams to the original wearer
                if (stream.withdrawableAmount && stream.withdrawableAmount > 0n) {
                  const flushStreamTxCalldata = prepareFlushStreamTxs({
                    streamId: stream.streamId,
                    to: originalHat.wearer,
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
          if (formHat.editedRole.fieldNames.includes('term')) {
            if (formHat.isTermed) {
              // @note {assumption}: We are only dealing with the next term here
              const latestTerm = formHat.roleTerms?.pop();

              if (!latestTerm) {
                throw new Error('No term data found');
              }
              if (latestTerm.termEndDate === undefined) {
                throw new Error('Term end date of added Role is undefined.');
              }
              if (latestTerm.nominee === undefined) {
                throw new Error('Nominee of added Role is undefined.');
              }
              // @note {assumption}: We have already determined the eligibility address is the election module
              // @todo double check assumption
              if (formHat.eligibility === undefined) {
                throw new Error(
                  'Cannot prepare transactions for edited role without eligibility address',
                );
              }
              if (formHat.smartAddress === undefined) {
                throw new Error(
                  'Cannot prepare transactions for edited role without smart address',
                );
              }
              const originalHat = getHat(formHat.id);
              if (!originalHat) {
                throw new Error('Cannot find original hat');
              }

              allTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsElectionsEligibilityAbi,
                  functionName: 'setNextTerm',
                  // @todo fix this to be the latest term end date
                  args: [BigInt(Date.now())],
                }),
                targetAddress: formHat.eligibility,
              });
              allTxs.push({
                calldata: encodeFunctionData({
                  abi: HatsElectionsEligibilityAbi,
                  functionName: 'elect',
                  // @todo fix this to be the latest term end date
                  args: [BigInt(Date.now()), [getAddress(latestTerm.nominee)]],
                }),
                targetAddress: formHat.eligibility,
              });

              // @note {assumption at proposal creation}: previous term is on going
              // const previousTerm = formHat.roleTerms?.[formHat.roleTerms.length - 2];
              // @todo fix this to be the previous term end date
              if (Date.now() ?? 0 < Date.now()) {
                allTxs.push({
                  calldata: encodeFunctionData({
                    abi: HatsElectionsEligibilityAbi,
                    functionName: 'startNextTerm',
                    args: [],
                  }),
                  targetAddress: formHat.eligibility,
                });
                // flush funds from previous term
                // @note {assumption}: no stream should need to be cancelled if past previous term
                const streamsWithFundsToClaim = getStreamsWithFundsToClaimFromFromHat(formHat);
                if (streamsWithFundsToClaim.length) {
                  for (const stream of streamsWithFundsToClaim) {
                    if (!stream.streamId || !stream.contractAddress) {
                      throw new Error(
                        'Stream ID and Stream ContractAddress is required for flush stream transaction',
                      );
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
                    const flushStreamTxCalldata = prepareFlushStreamTxs({
                      streamId: stream.streamId,
                      to: originalHat.wearer,
                      smartAccount: formHat.smartAddress,
                    });

                    allTxs.push(...flushStreamTxCalldata);
                  }
                }
                if (streamsWithFundsToClaim.length) {
                  // transfer hat to nominee from DAO
                  allTxs.push({
                    calldata: encodeFunctionData({
                      abi: HatsAbi,
                      functionName: 'transferHat',
                      args: [BigInt(formHat.id), daoAddress, getAddress(latestTerm.nominee)],
                    }),
                    targetAddress: hatsProtocol,
                  });
                } else {
                  // transfer hat to nominee from wearer
                  allTxs.push({
                    calldata: encodeFunctionData({
                      abi: HatsAbi,
                      functionName: 'transferHat',
                      args: [
                        BigInt(formHat.id),
                        getAddress(formHat.wearer),
                        getAddress(latestTerm.nominee),
                      ],
                    }),
                    targetAddress: hatsProtocol,
                  });
                }
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
      createNewHatTx,
      createNewTermedHatTxs,
      createSmartAccountTx,
      daoAddress,
      getActiveStreamsFromFormHat,
      getCancelledStreamsFromFormHat,
      getHat,
      getNewStreamsFromFormHat,
      getStreamsWithFundsToClaimFromFormHat,
      getStreamsWithFundsToClaimFromFromHat,
      hatsDetailsBuilder,
      hatsProtocol,
      hatsTree,
      mintHatTx,
      predictSmartAccount,
      prepareCancelStreamTxs,
      prepareFlushStreamTxs,
      uploadHatDescription,
      publicClient,
    ],
  );

  const createEditRolesProposal = useCallback(
    async (values: RoleFormValues, formikHelpers: FormikHelpers<RoleFormValues>) => {
      if (!publicClient) {
        throw new Error('Cannot create Roles proposal without public client');
      }

      if (!safe) {
        throw new Error('Cannot create Roles proposal without known Safe');
      }

      const { setSubmitting } = formikHelpers;
      setSubmitting(true);

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
        if (!!hatsTreeId) {
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
