import { Button } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address, encodeFunctionData, erc20Abi } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { useAccount } from 'wagmi';
import SablierBatchABI from '../../../../../assets/abi/SablierV2Batch.json';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../../../types';

export default function CustomProposalSubmitter({
  values,
  daoAddress,
}: {
  values: any;
  daoAddress?: string;
}) {
  const {
    governanceContracts: { votesTokenContractAddress },
  } = useFractal();
  const { address: account } = useAccount();
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
    const functionName = 'createWithMilestones';
    let recipient: string | undefined = undefined;
    let sablierBatchAddress: Address | undefined = undefined;
    let sablierLockupDynamicAddress: Address | undefined = undefined;
    let tokenAddress: Address | undefined = undefined;
    const totalAmount = '250000000000000000000000'; // 250K
    let startDate: number | undefined = undefined;
    let segments: [number | string, string, number][] = [];

    if (chainId === sepolia.id) {
      recipient = account!;
      sablierBatchAddress = '0xd2569DC4A58dfE85d807Dffb976dbC0a3bf0B0Fb'; // SablierV2Batch on Sepolia
      sablierLockupDynamicAddress = '0xc9940AD8F43aAD8e8f33A4D5dbBf0a8F7FF4429A'; // SablierV2LockupDynamic on Sepolia
      tokenAddress = votesTokenContractAddress as Address; // DAO token address
      startDate = Math.round(Date.now() / 1000) + 60 * 5; // 5 minutes from now
      segments = [
        [0, '1000000000000000000', startDate + 60 * 10], // First number represents amount of tokens denoted in units of token's decimals. Second number represents exponent, denoted as a fixed-point number. Third value is a Unix timestamp till when amount set in first value will be fully streamed
        [totalAmount, '1000000000000000000', startDate + 60 * 15], // For testing purpose - make the whole amount streamed at the start date + 10 minutes
      ]; // Array of segments, see explanation above. Additional explanation: https://github.com/sablier-labs/v2-core/blob/main/src/types/DataTypes.sol#L131-L140
    } else if (chainId === mainnet.id) {
      recipient = daoAddress!; // TODO: Change this. this will lead to stream tokens to itself
      sablierBatchAddress = '0xEa07DdBBeA804E7fe66b958329F8Fa5cDA95Bd55'; // SablierV2Batch on Mainnet
      sablierLockupDynamicAddress = '0x7CC7e125d83A581ff438608490Cc0f7bDff79127'; // SablierV2LockupDynamic on Mainnet
      tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // Mainnet USDC address
      startDate = 1711980240; // Unix timestamp
      const segmentAmount = BigNumber.from(totalAmount).div(5).toNumber();
      segments = [
        [0, '1000000000000000000', 1714572239],
        [segmentAmount, '1000000000000000000', 1714572240],
        [0, '1000000000000000000', 1717250639],
        [segmentAmount, '1000000000000000000', 1717250640],
        [0, '1000000000000000000', 1719842639],
        [segmentAmount, '1000000000000000000', 1719842640],
        [0, '1000000000000000000', 1722521039],
        [segmentAmount, '1000000000000000000', 1722521040],
        [0, '1000000000000000000', 1725199439],
        [segmentAmount, '1000000000000000000', 1725199440],
      ];
    }

    if (
      sablierLockupDynamicAddress &&
      sablierBatchAddress &&
      tokenAddress &&
      startDate &&
      recipient &&
      segments.length > 0
    ) {
      const sablierBatchData = [
        sablierLockupDynamicAddress,
        tokenAddress,
        [
          [
            daoAddress, // Tokens sender. This address will be able to cancel the stream
            startDate, // Start time
            true, // Cancelable - is it possible to cancel this stream
            false, // Transferable - is receiver able to transfer receiving rights to someone else
            recipient, // Receiver of tokens through stream
            totalAmount, // total amount of tokens sent
            ['0x0000000000000000000000000000000000000000', 0], // Optional broker
            segments, // Segments array of tuples
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
        args: [sablierBatchAddress, BigInt(totalAmount)],
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
        nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
        successCallback,
        proposalData,
      });
    }
  };
  return <Button onClick={handleSubmitProposal}>Create Sablier Stream Proposal</Button>;
}
