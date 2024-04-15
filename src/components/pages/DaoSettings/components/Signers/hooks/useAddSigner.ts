import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSubmitProposal from '../../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { ProposalExecuteData } from '../../../../../../types';

const useAddSigner = () => {
  const { submitProposal } = useSubmitProposal();
  const { t } = useTranslation(['modals']);
  const { baseContracts } = useFractal();
  const addSigner = useCallback(
    async ({
      newSigner,
      threshold,
      nonce,
      daoAddress,
      close,
    }: {
      newSigner: string;
      threshold: number;
      nonce: number;
      daoAddress: string | null;
      close: () => void;
    }) => {
      if (!baseContracts) {
        return;
      }
      const { safeSingletonContract } = baseContracts;
      const description = 'Add Signer';

      const calldatas = [
        safeSingletonContract.asSigner.interface.encodeFunctionData('addOwnerWithThreshold', [
          newSigner,
          BigInt(threshold),
        ]),
      ];

      const proposalData: ProposalExecuteData = {
        targets: [daoAddress!],
        values: [0n],
        calldatas: calldatas,
        metaData: {
          title: 'Add Signer',
          description: description,
          documentationUrl: '',
        },
      };

      await submitProposal({
        proposalData,
        successCallback: close,
        nonce,
        pendingToastMessage: t('addSignerPendingToastMessage'),
        successToastMessage: t('addSignerSuccessToastMessage'),
        failedToastMessage: t('addSignerFailureToastMessage'),
      });
    },
    [baseContracts, submitProposal, t],
  );

  return addSigner;
};

export default useAddSigner;
