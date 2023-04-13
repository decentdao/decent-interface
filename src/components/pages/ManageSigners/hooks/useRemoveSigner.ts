import { BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDAOProposals } from '../../../../hooks/DAO/loaders/useProposals';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import { ProposalExecuteData } from '../../../../types';

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

  const { t } = useTranslation(['modals', 'proposalMetadata']);
  const loadDAOProposals = useDAOProposals();
  const removeSigner = useCallback(async () => {
    const description = 'Remove Signers';

    const funcSignature =
      'function removeOwner(address prevOwner, address owner, uint256 _threshold)';
    const calldatas = [
      new ethers.utils.Interface([funcSignature]).encodeFunctionData('removeOwner', [
        prevSigner,
        signerToRemove,
        BigNumber.from(threshold),
      ]),
    ];

    const proposalData: ProposalExecuteData = {
      targets: [daoAddress!],
      values: [BigNumber.from('0')],
      calldatas: calldatas,
      title: 'Remove Signers',
      description: description,
      documentationUrl: '',
    };

    await submitProposal({
      proposalData,
      successCallback: () => {
        loadDAOProposals();
      },
      nonce,
      pendingToastMessage: t('sendAssetsPendingToastMessage'),
      successToastMessage: t('sendAssetsSuccessToastMessage'),
      failedToastMessage: t('sendAssetsFailureToastMessage'),
      safeAddress: daoAddress!,
    });
  }, [
    prevSigner,
    signerToRemove,
    threshold,
    daoAddress,
    submitProposal,
    nonce,
    t,
    loadDAOProposals,
  ]);

  return removeSigner;
};

export default useRemoveSigner;
