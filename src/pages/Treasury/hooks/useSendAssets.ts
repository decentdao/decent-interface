import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber, constants, ethers } from 'ethers';
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
    //TODO: need to add a toast and close modal
  };

  const tokenAddress = asset.tokenAddress ? asset.tokenAddress : constants.AddressZero;

  const sendAssets = useCallback(() => {
    const funcSignature = 'function transfer(address to, uint256 value)';
    const calldatas = [
      new ethers.utils.Interface([funcSignature]).encodeFunctionData('transfer', [
        destinationAddress,
        transferAmount,
      ]),
    ];

    const proposalData: ProposalExecuteData = {
      targets: [tokenAddress],
      values: [BigNumber.from('0')],
      calldatas: calldatas,
      title: 'Send Assets',
      description: 'to:' + destinationAddress + ' amt:' + transferAmount.toString(),
      documentationUrl: '',
    };

    submitProposal({ proposalData, successCallback });
  }, [destinationAddress, transferAmount, submitProposal, tokenAddress]);

  return sendAssets;
};

export default useSendAssets;
