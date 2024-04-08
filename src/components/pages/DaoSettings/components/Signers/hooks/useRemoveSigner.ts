import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSubmitProposal from '../../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { ProposalExecuteData } from '../../../../../../types';

const useRemoveSigner = ({
  prevSigner,
  signerToRemove,
  threshold,
  nonce,
  daoAddress,
}: {
  prevSigner: string;
  signerToRemove: string;
  threshold: number;
  nonce: number | undefined;
  daoAddress: string | null;
}) => {
  const { submitProposal } = useSubmitProposal();
  const { t } = useTranslation(['modals']);
  const { baseContracts } = useFractal();

  const removeSigner = useCallback(async () => {
    if (!baseContracts) {
      return;
    }
    const { safeSingletonContract } = baseContracts;
    const description = 'Remove Signers';

    const calldatas = [
      safeSingletonContract.asProvider.interface.encodeFunctionData('removeOwner', [
        prevSigner,
        signerToRemove,
        BigInt(threshold),
      ]),
    ];

    const proposalData: ProposalExecuteData = {
      targets: [daoAddress!],
      values: [0n],
      calldatas: calldatas,
      metaData: {
        title: 'Remove Signers',
        description: description,
        documentationUrl: '',
      },
    };

    await submitProposal({
      proposalData,
      nonce,
      pendingToastMessage: t('removeSignerPendingToastMessage'),
      successToastMessage: t('removeSignerSuccessToastMessage'),
      failedToastMessage: t('removeSignerFailureToastMessage'),
    });
  }, [baseContracts, prevSigner, signerToRemove, threshold, daoAddress, submitProposal, nonce, t]);

  return removeSigner;
};

export default useRemoveSigner;
