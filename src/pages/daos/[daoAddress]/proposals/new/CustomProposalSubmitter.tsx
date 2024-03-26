import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { encodeFunctionData, erc20Abi } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import SablierBatchABI from '../../../../../assets/abi/SablierV2Batch.json';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../../../types';

export default function CustomProposalSubmitter({
  values,
  daoAddress,
}: {
  values: any;
  daoAddress?: string;
}) {
  const { chainId } = useNetworkConfig();
  const { submitProposal } = useSubmitProposal();
  const navigate = useNavigate();
  const { t } = useTranslation(['proposal', 'common', 'breadcrumbs']);

  const successCallback = () => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(daoAddress));
    }
  };
  const handleSubmitProposal = () => {
    const { nonce, proposalMetadata } = values;
    const submitProposalBasicProps = {
      nonce,
      pendingToastMessage: t('proposalCreatePendingToastMessage'),
      successToastMessage: t('proposalCreateSuccessToastMessage'),
      failedToastMessage: t('proposalCreateFailureToastMessage'),
      successCallback,
    };
    const functionName = 'createWithMilestones';

    if (chainId === sepolia.id) {
      const recipient = '0x2884b7Bf17Ca966bB2e4099bf384734a48885Df0';
      const sablierBatchAddress = '0xd2569DC4A58dfE85d807Dffb976dbC0a3bf0B0Fb'; // SablierV2Batch
      const sablierLockupDynamicAddress = '0xc9940AD8F43aAD8e8f33A4D5dbBf0a8F7FF4429A'; // SablierV2LockupDynamic
      const tokenAddress = '0xa60196673256ae375c8ce2bb6b404c07b6b4a56a'; // Test DAO token address
      const startDate = Math.round(Date.now() / 1000);

      const sablierBatchData = [
        sablierLockupDynamicAddress, // Address of LockupDynamic contract. Will be called by batch internally to create streams
        tokenAddress, // Address of token to stream
        [
          [
            daoAddress, // Tokens sender. This address will be able to cancel the stream
            startDate, // Start time
            true, // Cancelable - is it possible to cancel this stream
            false, // Transferable - is receiver able to transfer receiving rights to someone else
            recipient, // Receiver of tokens through stream
            250000, // total amount of tokens sent
            ['0x0000000000000000000000000000000000000000', 0], // Optional broker
            [
              [0, '1000000000000000000', startDate], // First number represents amount of tokens denoted in units of token's decimals. Second number represents exponent, denoted as a fixed-point number. Third value is a Unix timestamp till when amount set in first value will be fully streamed
              [250000, '1000000000000000000', startDate + 60 * 10], // For testing purpose - make the whole amount streamed at the start date + 10 minutes
            ], // Array of segments, see explanation above. Additional explanation: https://github.com/sablier-labs/v2-core/blob/main/src/types/DataTypes.sol#L131-L140
          ],
        ],
      ];

      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierBatchABI,
        functionName,
        args: sablierBatchData,
      });
      const tokenCalldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [sablierBatchAddress, BigInt('1000000000000000000000000')],
      });

      const proposalData: ProposalExecuteData = {
        targets: [tokenAddress, sablierBatchAddress],
        values: [0, 0],
        calldatas: [tokenCalldata, sablierBatchCalldata],
        metaData: {
          title: proposalMetadata.title,
          description: proposalMetadata.description,
          documentationUrl: proposalMetadata.documentationUrl,
        },
      };
      submitProposal({
        ...submitProposalBasicProps,
        proposalData,
      });
    } else if (chainId === mainnet.id) {
      const recipient = daoAddress; // TODO: Change this. this will lead to stream tokens to itself
      const sablierBatchAddress = '0xEa07DdBBeA804E7fe66b958329F8Fa5cDA95Bd55';
      const sablierLockupDynamicAddress = '0x7CC7e125d83A581ff438608490Cc0f7bDff79127'; // SablierV2LockupDynamic
      const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // Mainnet USDC address
      const startTime = 1711980240; // Unix timestamp
      const sablierBatchData = [
        sablierLockupDynamicAddress,
        tokenAddress,
        [
          [
            // Note - the order of inputs while using SablierV2Batch is different from order when using SablierV2LockupDynamic
            daoAddress, // Tokens sender. This address will be able to cancel the stream
            startTime, // Start time
            true, // Cancelable - is it possible to cancel this stream
            false, // Transferable - is receiver able to transfer receiving rights to someone else
            recipient, // Receiver of tokens through stream
            25000000000, // total amount of tokens sent
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
      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierBatchABI,
        functionName,
        args: sablierBatchData,
      });
      const tokenCalldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [sablierBatchAddress, BigInt('25000000000000000000000000000')],
      });
      const proposalData: ProposalExecuteData = {
        targets: [tokenAddress, sablierBatchAddress],
        values: [0, 0],
        calldatas: [tokenCalldata, sablierBatchCalldata],
        metaData: {
          title: proposalMetadata.title,
          description: proposalMetadata.description,
          documentationUrl: proposalMetadata.documentationUrl,
        },
      };
      submitProposal({
        ...submitProposalBasicProps,
        proposalData,
      });
    }
  };
  return <Button onClick={handleSubmitProposal}>Submit custom Shutter DAO proposal</Button>;
}
