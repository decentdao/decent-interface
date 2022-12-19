import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { ProposalExecuteData } from '../../../types';

const useSendAssets = ({
  transferAmount,
  asset,
  destinationAddress,
}: {
  transferAmount: BigNumber;
  asset: SafeBalanceUsdResponse;
  destinationAddress: string;
}) => {
  const { submitProposal } = useSubmitProposal();

  const successCallback = () => {
    //TODO: need to figure out what toast / notification to add
  };

  const sendAssets = useCallback(() => {
    const isEth = !asset.tokenAddress;
    const description = 'To:' + destinationAddress + ', amount:' + transferAmount.toString();

    const funcSignature = 'function transfer(address to, uint256 value)';
    const calldatas = [
      new ethers.utils.Interface([funcSignature]).encodeFunctionData('transfer', [
        destinationAddress,
        transferAmount,
      ]),
    ];

    const proposalData: ProposalExecuteData = {
      targets: [isEth ? destinationAddress : asset.tokenAddress],
      values: [isEth ? transferAmount : BigNumber.from('0')],
      calldatas: isEth ? ['0x'] : calldatas,
      title: 'Send Assets',
      description: description,
      documentationUrl: '',
    };

    submitProposal({ proposalData, successCallback });
  }, [destinationAddress, transferAmount, asset.tokenAddress, submitProposal]);

  return sendAssets;
};

export default useSendAssets;
