import { BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDAOProposals } from '../../../../hooks/DAO/loaders/useProposals';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import { ProposalExecuteData } from '../../../../types';

const useAddSigner = ({
  newSigner,
  threshold,
  nonce,
  daoAddress,
}: {
  newSigner: string;
  threshold: number | undefined;
  nonce: number | undefined;
  daoAddress: string | null;
}) => {
  const { submitProposal } = useSubmitProposal();

  const { t } = useTranslation(['modals', 'proposalMetadata']);
  const loadDAOProposals = useDAOProposals();
  const addSigner = useCallback(async () => {
    const description = 'Add Signer';

    console.log('newSigner: ', newSigner);
    console.log('threshold: ', threshold);

    const funcSignature = 'function addOwnerWithThreshold(address owner, uint256 _threshold)';
    const calldatas = [
      new ethers.utils.Interface([funcSignature]).encodeFunctionData('addOwnerWithThreshold', [
        newSigner,
        BigNumber.from(threshold),
      ]),
    ];

    const proposalData: ProposalExecuteData = {
      targets: [daoAddress!],
      values: [BigNumber.from('0')],
      calldatas: calldatas,
      title: 'Add Signer',
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
  }, [newSigner, threshold, daoAddress, submitProposal, nonce, t, loadDAOProposals]);

  return addSigner;
};

export default useAddSigner;
