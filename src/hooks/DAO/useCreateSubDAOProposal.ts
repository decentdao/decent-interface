import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isHex, getAddress } from 'viem';
import { useFractal } from '../../providers/App/AppProvider';
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
    node: { safe },
    governance,
  } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;

  const daoAddress = safe?.address;

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
        const { multiSendContract, fractalRegistryContract } = baseContracts;

        const builtSafeTx = await build(daoData, daoAddress, azoriusGovernance.votesToken?.address);
        if (!builtSafeTx) {
          return;
        }

        const { safeTx, predictedSafeAddress } = builtSafeTx;

        const encodedMultisend = multiSendContract.asProvider.interface.encodeFunctionData(
          'multiSend',
          [safeTx],
        );
        const encodedDeclareSubDAO =
          fractalRegistryContract.asProvider.interface.encodeFunctionData('declareSubDAO', [
            predictedSafeAddress,
          ]);
        if (!isHex(encodedMultisend) || !isHex(encodedDeclareSubDAO)) {
          return;
        }
        const proposalData: ProposalExecuteData = {
          targets: [
            getAddress(multiSendContract.asProvider.address),
            getAddress(fractalRegistryContract.asProvider.address),
          ],
          values: [0n, 0n],
          calldatas: [encodedMultisend, encodedDeclareSubDAO],
          metaData: {
            title: t('createChildSafe', { ns: 'proposalMetadata' }),
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
    [baseContracts, build, daoAddress, submitProposal, azoriusGovernance, t],
  );

  return { proposeDao, pendingCreateTx, canUserCreateProposal } as const;
};
