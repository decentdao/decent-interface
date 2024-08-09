import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isHex, Address } from 'viem';
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
  daoAddress?: Address;
}) => {
  const { submitProposal } = useSubmitProposal();
  const { t } = useTranslation(['modals']);
  const { baseContracts } = useFractal();

  const removeSigner = useCallback(async () => {
    if (!baseContracts || !daoAddress) {
      return;
    }
    const { safeSingletonContract } = baseContracts;
    const description = 'Remove Signers';

    const encodedRemoveOwner = safeSingletonContract.asProvider.interface.encodeFunctionData(
      'removeOwner',
      [prevSigner, signerToRemove, BigInt(threshold)],
    );

    if (!isHex(encodedRemoveOwner)) {
      return;
    }

    const calldatas = [encodedRemoveOwner];

    const proposalData: ProposalExecuteData = {
      targets: [daoAddress],
      values: [0n],
      calldatas,
      metaData: {
        title: 'Remove Signers',
        description,
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
