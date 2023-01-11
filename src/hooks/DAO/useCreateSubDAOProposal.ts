import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GnosisDAO, TokenGovernanceDAO } from '../../components/DaoCreator/provider/types/index';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { ProposalExecuteData } from '../../types/proposal';
import useSafeContracts from '../safe/useSafeContracts';
import useSubmitProposal from './proposal/useSubmitProposal';
import useBuildDAOTx from './useBuildDAOTx';

export const useCreateSubDAOProposal = () => {
  const { multiSendContract } = useSafeContracts();
  const { t } = useTranslation(['daoCreate', 'proposal', 'proposalMetadata']);

  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();
  const [build] = useBuildDAOTx();
  const {
    gnosis: { safe },
    governance: { governanceToken },
  } = useFractal();

  const proposeDao = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: (daoAddress: string) => void) => {
      const propose = async () => {
        if (!multiSendContract) {
          return;
        }

        const builtSafeTx = await build(daoData, safe.address, governanceToken?.address);
        if (!builtSafeTx) {
          return;
        }

        const { safeTx } = builtSafeTx;

        const proposalData: ProposalExecuteData = {
          targets: [multiSendContract.address],
          values: [BigNumber.from('0')],
          calldatas: [multiSendContract.interface.encodeFunctionData('multiSend', [safeTx])],
          title: t('Create a SubDAO proposal', { ns: 'proposalMetadata' }),
          description: 'to:' + multiSendContract.address + '_ txs:' + safeTx,
          documentationUrl: '',
        };
        submitProposal({
          proposalData,
          pendingToastMessage: t('createSubDAOPendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
          failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
          successCallback,
        });
      };
      propose();
    },
    [multiSendContract, build, safe.address, submitProposal, governanceToken?.address, t]
  );

  return { proposeDao, pendingCreateTx, canUserCreateProposal } as const;
};
