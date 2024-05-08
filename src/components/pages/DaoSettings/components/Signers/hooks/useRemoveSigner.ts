import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress, encodeFunctionData } from 'viem';
import GnosisSafeL2Abi from '../../../../../../assets/abi/GnosisSafeL2';
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
    if (!baseContracts || !daoAddress) {
      return;
    }
    const description = 'Remove Signers';

    const encodedRemoveOwner = encodeFunctionData({
      abi: GnosisSafeL2Abi,
      functionName: 'removeOwner',
      args: [getAddress(prevSigner), getAddress(signerToRemove), BigInt(threshold)],
    });

    const calldatas = [encodedRemoveOwner];

    const proposalData: ProposalExecuteData = {
      targets: [getAddress(daoAddress)],
      values: [0n],
      calldatas,
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
