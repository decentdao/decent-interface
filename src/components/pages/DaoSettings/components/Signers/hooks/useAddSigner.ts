import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress, isHex } from 'viem';
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
      daoAddress: Address | null;
      close: () => void;
    }) => {
      if (!baseContracts || !daoAddress) {
        return;
      }
      const { safeSingletonContract } = baseContracts;
      const description = 'Add Signer';

      const encodedAddOwner = safeSingletonContract.asSigner.interface.encodeFunctionData(
        'addOwnerWithThreshold',
        [newSigner, BigInt(threshold)],
      );
      if (!isHex(encodedAddOwner)) {
        return;
      }
      const calldatas = [encodedAddOwner];

      const proposalData: ProposalExecuteData = {
        targets: [getAddress(daoAddress)],
        values: [0n],
        calldatas,
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
