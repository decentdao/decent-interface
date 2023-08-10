import { BigNumber } from 'ethers';
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
  const {
    baseContracts: { safeSingletonContract },
  } = useFractal();

  const removeSigner = useCallback(async () => {
    const description = 'Remove Signers';

    const calldatas = [
      safeSingletonContract.asSigner.interface.encodeFunctionData('removeOwner', [
        prevSigner,
        signerToRemove,
        BigNumber.from(threshold),
      ]),
    ];

    const proposalData: ProposalExecuteData = {
      targets: [daoAddress!],
      values: [BigNumber.from('0')],
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
  }, [
    safeSingletonContract.asSigner.interface,
    prevSigner,
    signerToRemove,
    threshold,
    daoAddress,
    submitProposal,
    nonce,
    t,
  ]);

  return removeSigner;
};

export default useRemoveSigner;
