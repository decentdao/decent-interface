import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isHex, getAddress, encodeFunctionData } from 'viem';
import FractalRegistryAbi from '../../assets/abi/FractalRegistry';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeMultisigDAO, AzoriusGovernance, AzoriusERC20DAO, AzoriusERC721DAO } from '../../types';
import { ProposalExecuteData } from '../../types/daoProposal';
import { useCanUserCreateProposal } from '../utils/useCanUserSubmitProposal';
import useSubmitProposal from './proposal/useSubmitProposal';
import useBuildDAOTx from './useBuildDAOTx';

export const useCreateSubDAOProposal = () => {
  const { baseContracts } = useFractal();
  const { t } = useTranslation(['daoCreate', 'proposal', 'proposalMetadata']);

  const { submitProposal, pendingCreateTx } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const [build] = useBuildDAOTx();
  const {
    node: { daoAddress },
    governance,
  } = useFractal();
  const {
    contracts: { fractalRegistry },
  } = useNetworkConfig();
  const azoriusGovernance = governance as AzoriusGovernance;
  const proposeDao = useCallback(
    (
      daoData: AzoriusERC20DAO | AzoriusERC721DAO | SafeMultisigDAO,
      nonce: number | undefined,
      successCallback: (addressPrefix: string, daoAddress: string) => void,
    ) => {
      const propose = async () => {
        if (!baseContracts || !daoAddress) {
          return;
        }
        const { multiSendContract } = baseContracts;

        const builtSafeTx = await build(daoData, daoAddress, azoriusGovernance.votesToken?.address);
        if (!builtSafeTx) {
          return;
        }

        const { safeTx, predictedSafeAddress } = builtSafeTx;

        const encodedMultisend = multiSendContract.asProvider.interface.encodeFunctionData(
          'multiSend',
          [safeTx],
        );

        if (!isHex(encodedMultisend)) {
          throw new Error('encodedMultisend data is not hex??');
        }

        const encodedDeclareSubDAO = encodeFunctionData({
          abi: FractalRegistryAbi,
          functionName: 'declareSubDAO',
          args: [getAddress(predictedSafeAddress)],
        });

        const proposalData: ProposalExecuteData = {
          targets: [getAddress(multiSendContract.asProvider.address), fractalRegistry],
          values: [0n, 0n],
          calldatas: [encodedMultisend, encodedDeclareSubDAO],
          metaData: {
            title: t('Create a sub-Safe', { ns: 'proposalMetadata' }),
            description: '',
            documentationUrl: '',
          },
        };
        submitProposal({
          proposalData,
          nonce,
          pendingToastMessage: t('createSubDAOPendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
          failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
          successCallback,
        });
      };
      propose();
    },
    [
      azoriusGovernance.votesToken?.address,
      baseContracts,
      build,
      daoAddress,
      fractalRegistry,
      submitProposal,
      t,
    ],
  );

  return { proposeDao, pendingCreateTx, canUserCreateProposal } as const;
};
