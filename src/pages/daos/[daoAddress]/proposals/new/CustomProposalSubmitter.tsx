import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { ProposalExecuteData } from '../../../../../types';
import { encodeProposalTransaction } from '../../../../../utils';

export default function CustomProposalSubmitter({
  values,
  daoAddress,
}: {
  values: any;
  daoAddress?: string;
}) {
  const { submitProposal } = useSubmitProposal();
  const navigate = useNavigate();
  const { t } = useTranslation(['proposal', 'common', 'breadcrumbs']);

  const successCallback = () => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(daoAddress));
    }
  };
  const handleSubmitProposal = () => {
    const target = '0x7CC7e125d83A581ff438608490Cc0f7bDff79127'; // SablierV2LockupDynamic
    const functionName = 'createWithMilestones';
    const signature =
      'function createWithMilestones(address,address,(address,uint40,bool,bool,address,uint128,(address,uint256),(uint128,uint64,uint40)[])[])';
    const data = [
      '0x7CC7e125d83A581ff438608490Cc0f7bDff79127',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      [
        [
          '0x36bD3044ab68f600f6d3e081056F34f2a58432c4',
          1711980240,
          true,
          false,
          '0x36bD3044ab68f600f6d3e081056F34f2a58432c4',
          25000000000,
          ['0x0000000000000000000000000000000000000000', 0],
          [
            [0, '1000000000000000000', 1714572239],
            [5000000000, '1000000000000000000', 1714572240],
            [0, '1000000000000000000', 1717250639],
            [5000000000, '1000000000000000000', 1717250640],
            [0, '1000000000000000000', 1719842639],
            [5000000000, '1000000000000000000', 1719842640],
            [0, '1000000000000000000', 1722521039],
            [5000000000, '1000000000000000000', 1722521040],
            [0, '1000000000000000000', 1725199439],
            [5000000000, '1000000000000000000', 1725199440],
          ],
        ],
      ],
    ];

    const { nonce, proposalMetadata } = values;
    const calldata = encodeProposalTransaction(functionName, signature, data);
    const proposalData: ProposalExecuteData = {
      targets: [target],
      values: [0],
      calldatas: [calldata],
      metaData: {
        title: proposalMetadata.title,
        description: proposalMetadata.description,
        documentationUrl: proposalMetadata.documentationUrl,
      },
    };
    submitProposal({
      proposalData,
      nonce,
      pendingToastMessage: t('proposalCreatePendingToastMessage'),
      successToastMessage: t('proposalCreateSuccessToastMessage'),
      failedToastMessage: t('proposalCreateFailureToastMessage'),
      successCallback,
    });
  };
  return <Button onClick={handleSubmitProposal}>Submit custom Shutter DAO proposal</Button>;
}
