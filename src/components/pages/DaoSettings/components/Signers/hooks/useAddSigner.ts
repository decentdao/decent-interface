import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { encodeFunctionData, getAddress } from 'viem';
import GnosisSafeL2Abi from '../../../../../../assets/abi/GnosisSafeL2';
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
      if (!baseContracts || !daoAddress) {
        return;
      }
      const description = 'Add Signer';

      const encodedAddOwner = encodeFunctionData({
        abi: GnosisSafeL2Abi,
        functionName: 'addOwnerWithThreshold',
        args: [getAddress(newSigner), BigInt(threshold)],
      });

      const calldatas = [encodedAddOwner];

      const proposalData: ProposalExecuteData = {
        targets: [getAddress(daoAddress)],
        values: [0n],
        calldatas,
        metaData: {
          title: 'Add Signer',
          description,
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
