import { useCallback } from 'react';
import { getAddress, zeroAddress, encodeFunctionData, erc20Abi, Address } from 'viem';
import SablierV2BatchAbi from '../../assets/abi/SablierV2Batch';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { TokenBalance, ProposalExecuteData } from '../../types';
import { PayrollFrequency } from '../../types/sablier';

const SECONDS_IN_DAY = 24 * 60 * 60;
export default function useCreateSablierStream() {
  const {
    contracts: { sablierV2LockupDynamic, sablierV2LockupTranched, sablierV2Batch },
  } = useNetworkConfig();
  const {
    node: { daoAddress },
  } = useFractal();

  const prepareCreateDynamicLockupProposal = useCallback(
    ({
      months,
      frequency,
      totalAmount,
      asset,
      recipient,
      startDate,
    }: {
      months: number;
      frequency: PayrollFrequency;
      totalAmount: string;
      asset: TokenBalance;
      recipient: Address;
      startDate: number;
    }) => {
      if (!daoAddress) {
        throw new Error('Can not create sablier stream proposal while DAO is not set.');
      }
      const tokenAddress = getAddress(asset.tokenAddress);
      const exponent = 10n ** BigInt(asset.decimals);
      const totalAmountInTokenDecimals = BigInt(totalAmount) * exponent;
      let totalSegments = months;
      if (frequency === 'weekly') {
        // @todo - obviously this isn't correct and we need proper calculation of how many weeks are in the amount of months entered
        totalSegments = months * 4;
      } else if (frequency === 'biweekly') {
        // @todo - again, not correct - need to get exact number of 2-weeks cycles from the total number of months
        totalSegments = months * 2;
      }
      const segmentAmount = totalAmountInTokenDecimals / BigInt(totalSegments);
      // Sablier sets startTime to block.timestamp - so we need to simulate startTime through streaming 0 tokens at first segment till startDate
      const segments: { amount: bigint; exponent: bigint; duration: number }[] = [
        { amount: 0n, exponent, duration: Math.round(startDate - Date.now() / 1000) },
      ];

      let days = 30;
      if (frequency === 'weekly') {
        days = 7;
      } else if (frequency === 'biweekly') {
        days = 14;
      }
      const duration = days * SECONDS_IN_DAY;

      for (let i = 1; i <= totalSegments; i++) {
        segments.push({
          amount: segmentAmount,
          exponent,
          duration,
        });
      }

      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierV2BatchAbi,
        functionName: 'createWithDurationsLD', // Another option would be to use createWithTimestampsLD. Essentially they're doing the same
        args: [
          sablierV2LockupDynamic,
          tokenAddress,
          [
            {
              sender: daoAddress, // Tokens sender. This address will be able to cancel the stream
              cancelable: true, // Cancelable - is it possible to cancel this stream
              transferable: false, // Transferable - is Recipient able to transfer receiving rights to someone else
              recipient, // Recipient of tokens through stream
              totalAmount: totalAmountInTokenDecimals, // total amount of tokens sent
              broker: { account: zeroAddress, fee: 0n }, // Optional broker
              segments, // Segments array of tuples
            },
          ],
        ],
      });

      const tokenCalldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [sablierV2Batch, totalAmountInTokenDecimals],
      });
      const proposalData: ProposalExecuteData = {
        targets: [tokenAddress, sablierV2Batch],
        values: [0n, 0n],
        calldatas: [tokenCalldata, sablierBatchCalldata],
        metaData: {
          title: 'Create Payroll Stream for Role',
          description: `This madafaking rocket science proposal will create AI Blockchain Crypto Currency Bitcoin BUIDL HODL Sablier V2 Stream of $$$ flowing to ${recipient}`,
          documentationUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
      };

      return proposalData;
    },
    [sablierV2Batch, sablierV2LockupDynamic, daoAddress],
  );

  const prepareCreateTranchedLockupProposal = useCallback(
    ({
      months,
      frequency,
      totalAmount,
      asset,
      recipient,
      startDate,
    }: {
      months: number;
      frequency: PayrollFrequency;
      totalAmount: string;
      asset: TokenBalance;
      recipient: Address;
      startDate: number;
    }) => {
      if (!daoAddress) {
        throw new Error('Can not create sablier stream proposal while DAO is not set.');
      }
      const tokenAddress = getAddress(asset.tokenAddress);
      const exponent = 10n ** BigInt(asset.decimals);
      const totalAmountInTokenDecimals = BigInt(totalAmount) * exponent;
      let totalSegments = months;
      if (frequency === 'weekly') {
        // @todo - obviously this isn't correct and we need proper calculation of how many weeks are in the amount of months entered
        totalSegments = months * 4;
      } else if (frequency === 'biweekly') {
        // @todo - again, not correct - need to get exact number of 2-weeks cycles from the total number of months
        totalSegments = months * 2;
      }
      const segmentAmount = totalAmountInTokenDecimals / BigInt(totalSegments);
      // Sablier sets startTime to block.timestamp - so we need to simulate startTime through streaming 0 tokens at first segment till startDate
      const tranches: { amount: bigint; exponent: bigint; duration: number }[] = [
        { amount: 0n, exponent, duration: Math.round(startDate - Date.now() / 1000) },
      ];

      let days = 30;
      if (frequency === 'weekly') {
        days = 7;
      } else if (frequency === 'biweekly') {
        days = 14;
      }
      const duration = days * SECONDS_IN_DAY;

      for (let i = 1; i <= totalSegments; i++) {
        tranches.push({
          amount: segmentAmount,
          exponent,
          duration,
        });
      }

      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierV2BatchAbi,
        functionName: 'createWithDurationsLT', // Another option would be to use createWithTimestampsLD. Essentially they're doing the same
        args: [
          sablierV2LockupTranched,
          tokenAddress,
          [
            {
              sender: daoAddress, // Tokens sender. This address will be able to cancel the stream
              cancelable: true, // Cancelable - is it possible to cancel this stream
              transferable: false, // Transferable - is Recipient able to transfer receiving rights to someone else
              recipient, // Recipient of tokens through stream
              totalAmount: totalAmountInTokenDecimals, // total amount of tokens sent
              broker: { account: zeroAddress, fee: 0n }, // Optional broker
              tranches,
            },
          ],
        ],
      });

      const tokenCalldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [sablierV2Batch, totalAmountInTokenDecimals],
      });
      const proposalData: ProposalExecuteData = {
        targets: [tokenAddress, sablierV2Batch],
        values: [0n, 0n],
        calldatas: [tokenCalldata, sablierBatchCalldata],
        metaData: {
          title: 'Create Payroll Stream for Role',
          description: `This madafaking rocket science proposal will create AI Blockchain Crypto Currency Bitcoin BUIDL HODL Sablier V2 Stream of $$$ flowing to ${recipient}`,
          documentationUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
      };

      return proposalData;
    },
    [daoAddress, sablierV2Batch, sablierV2LockupTranched],
  );

  return { prepareCreateDynamicLockupProposal, prepareCreateTranchedLockupProposal };
}
