import { useCallback } from 'react';
import { getAddress, zeroAddress, encodeFunctionData, erc20Abi, Address } from 'viem';
import SablierV2BatchAbi from '../../assets/abi/SablierV2Batch';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { TokenBalance, ProposalExecuteData } from '../../types';
import {
  PayrollFrequency,
  StreamAbsoluteSchedule,
  StreamRelativeSchedule,
  StreamSchedule,
} from '../../types/sablier';

const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;

type DynamicOrTranchedStreamInputs = {
  months: number;
  frequency: PayrollFrequency;
  totalAmount: string;
  asset: TokenBalance;
  recipient: Address;
  startDate: number;
};

type LinearStreamInputs = {
  totalAmount: string;
  asset: TokenBalance;
  recipient: Address;
  schedule: StreamSchedule;
  cliff: StreamSchedule;
};
export default function useCreateSablierStream() {
  const {
    contracts: {
      sablierV2LockupDynamic,
      sablierV2LockupTranched,
      sablierV2LockupLinear,
      sablierV2Batch,
    },
  } = useNetworkConfig();
  const {
    node: { daoAddress },
  } = useFractal();

  const prepareStreamTokenCallData = useCallback(
    (amountInTokenDecimals: bigint) => {
      return encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [sablierV2Batch, amountInTokenDecimals],
      });
    },
    [sablierV2Batch],
  );

  const prepareBasicStreamData = useCallback(
    (recipient: Address, amountInTokenDecimals: bigint) => {
      if (!daoAddress) {
        throw new Error('Can not create sablier stream proposal while DAO is not set.');
      }
      return {
        sender: daoAddress, // Tokens sender. This address will be able to cancel the stream
        cancelable: true, // Cancelable - is it possible to cancel this stream
        transferable: false, // Transferable - is Recipient able to transfer receiving rights to someone else
        recipient, // Recipient of tokens through stream
        totalAmount: amountInTokenDecimals, // total amount of tokens sent
        broker: { account: zeroAddress, fee: 0n }, // Optional broker
      };
    },
    [daoAddress],
  );

  const prepareDynamicOrTranchedStream = useCallback(
    ({
      months,
      frequency,
      totalAmount,
      asset,
      recipient,
      startDate,
    }: DynamicOrTranchedStreamInputs) => {
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

      const tokenCalldata = prepareStreamTokenCallData(totalAmountInTokenDecimals);
      const basicStreamData = prepareBasicStreamData(recipient, totalAmountInTokenDecimals);

      const assembledStream = {
        ...basicStreamData,
        segments, // Segments array of tuples
      };

      return { tokenCalldata, assembledStream };
    },
    [prepareBasicStreamData, prepareStreamTokenCallData],
  );

  const prepareLinearStream = useCallback(
    ({ totalAmount, asset, recipient, schedule, cliff }: LinearStreamInputs) => {
      const exponent = 10n ** BigInt(asset.decimals);
      const totalAmountInTokenDecimals = BigInt(totalAmount) * exponent;

      const calculateDuration = (abstractSchedule: StreamSchedule) => {
        let duration = 0;
        const relativeSchedule = abstractSchedule as StreamRelativeSchedule;
        const absoluteSchedule = abstractSchedule as StreamAbsoluteSchedule;

        if (relativeSchedule.years || relativeSchedule.days || relativeSchedule.hours) {
          duration += relativeSchedule.years * SECONDS_IN_DAY * 365;
          duration += relativeSchedule.days * SECONDS_IN_DAY;
          duration += relativeSchedule.hours * SECONDS_IN_HOUR;
        } else if (absoluteSchedule.startDate) {
          duration = (Date.now() - absoluteSchedule.startDate + absoluteSchedule.endDate) / 1000;
        }

        return duration;
      };
      const streamDuration = calculateDuration(schedule);
      const cliffDuration = calculateDuration(cliff);

      if (!streamDuration) {
        throw new Error('Stream duration can not be 0');
      }

      const tokenCalldata = prepareStreamTokenCallData(totalAmountInTokenDecimals);
      const basicStreamData = prepareBasicStreamData(recipient, totalAmountInTokenDecimals);
      const assembledStream = {
        ...basicStreamData,
        durations: { cliff: cliffDuration, total: streamDuration + cliffDuration }, // Total duration has to include cliff duration
      };

      return { tokenCalldata, assembledStream };
    },
    [prepareBasicStreamData, prepareStreamTokenCallData],
  );

  const prepareCreateDynamicLockupProposal = useCallback(
    (inputs: DynamicOrTranchedStreamInputs) => {
      const { asset, recipient } = inputs;
      const tokenAddress = getAddress(asset.tokenAddress);
      const { tokenCalldata, assembledStream } = prepareDynamicOrTranchedStream(inputs);

      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierV2BatchAbi,
        functionName: 'createWithDurationsLD',
        args: [sablierV2LockupDynamic, tokenAddress, [assembledStream]],
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
    [sablierV2Batch, sablierV2LockupDynamic, prepareDynamicOrTranchedStream],
  );

  const prepareCreateTranchedLockupProposal = useCallback(
    (inputs: DynamicOrTranchedStreamInputs) => {
      const { asset, recipient } = inputs;
      const tokenAddress = getAddress(asset.tokenAddress);
      const {
        tokenCalldata,
        assembledStream: { segments: tranches, ...assembledTranchedStream },
      } = prepareDynamicOrTranchedStream(inputs);

      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierV2BatchAbi,
        functionName: 'createWithDurationsLT',
        args: [sablierV2LockupTranched, tokenAddress, [{ ...assembledTranchedStream, tranches }]],
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
    [prepareDynamicOrTranchedStream, sablierV2Batch, sablierV2LockupTranched],
  );

  const prepareCreateLinearLockupProposal = useCallback(
    (inputs: LinearStreamInputs) => {
      const { asset, recipient } = inputs;
      const tokenAddress = getAddress(asset.tokenAddress);
      const { tokenCalldata, assembledStream } = prepareLinearStream(inputs);
      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierV2BatchAbi,
        functionName: 'createWithDurationsLL', // Another option would be to use createWithTimestampsLD. Essentially they're doing the same
        args: [sablierV2LockupLinear, tokenAddress, [assembledStream]],
      });

      const proposalData: ProposalExecuteData = {
        targets: [tokenAddress, sablierV2Batch],
        values: [0n, 0n],
        calldatas: [tokenCalldata, sablierBatchCalldata],
        metaData: {
          title: 'Create Vesting Stream for Role',
          description: `This madafaking rocket science proposal will create AI Blockchain Crypto Currency Bitcoin BUIDL HODL Sablier V2 Vesting Stream of $$$ flowing to ${recipient}`,
          documentationUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
      };

      return proposalData;
    },
    [prepareLinearStream, sablierV2Batch, sablierV2LockupLinear],
  );

  return {
    prepareCreateDynamicLockupProposal,
    prepareCreateTranchedLockupProposal,
    prepareCreateLinearLockupProposal,
  };
}
