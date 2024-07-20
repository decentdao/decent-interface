import { useCallback } from 'react';
import { getAddress, zeroAddress, encodeFunctionData, erc20Abi, Address, Hex } from 'viem';
import SablierV2BatchAbi from '../../assets/abi/SablierV2Batch';
import SablierV2LockupTranchedAbi from '../../assets/abi/SablierV2LockupTranched';
import {
  BaseSablierStream,
  Frequency,
  SablierAsset,
  SablierPayroll,
} from '../../components/pages/Roles/types';
import { SECONDS_IN_DAY, SECONDS_IN_HOUR } from '../../constants/common';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { TokenBalance, ProposalExecuteData } from '../../types';
import {
  StreamAbsoluteSchedule,
  StreamRelativeSchedule,
  StreamSchedule,
} from '../../types/sablier';

type DynamicOrTranchedStreamInputs = {
  frequencyNumber: number;
  frequency: Frequency;
  totalAmount: string;
  asset: SablierAsset;
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
    contracts: { sablierV2LockupTranched, sablierV2LockupLinear, sablierV2Batch },
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
      frequencyNumber,
      frequency,
      totalAmount,
      asset,
      recipient,
      startDate,
    }: DynamicOrTranchedStreamInputs) => {
      const exponent = 10n ** BigInt(asset.decimals);
      const totalAmountInTokenDecimals = BigInt(totalAmount) * exponent;
      const segmentAmount = totalAmountInTokenDecimals / BigInt(frequencyNumber);

      // Sablier sets startTime to block.timestamp - so we need to simulate startTime through streaming 0 tokens at first tranche till startDate
      const delayingByStartDateTranche = {
        amount: 0n,
        exponent,
        duration: Math.round((startDate - Date.now()) / 1000),
      };
      const tranches: { amount: bigint; exponent: bigint; duration: number }[] = [
        delayingByStartDateTranche,
      ];

      let days = 30;
      if (frequency === Frequency.Weekly) {
        days = 7;
      } else if (frequency === Frequency.EveryTwoWeeks) {
        days = 14;
      }
      const duration = days * SECONDS_IN_DAY;

      for (let i = 1; i <= frequencyNumber; i++) {
        tranches.push({
          amount: segmentAmount,
          exponent,
          duration,
        });
      }

      const totalTranchesAmount = tranches.reduce((prev, curr) => prev + curr.amount, 0n);
      if (totalTranchesAmount < totalAmountInTokenDecimals) {
        // @dev We can't always equally divide between tranches, so we're putting the leftover into the very last tranche
        tranches[tranches.length - 1].amount += totalAmountInTokenDecimals - totalTranchesAmount;
      }

      const tokenCalldata = prepareStreamTokenCallData(totalAmountInTokenDecimals);
      const basicStreamData = prepareBasicStreamData(recipient, totalAmountInTokenDecimals);

      const assembledStream = {
        ...basicStreamData,
        tranches, // Tranches array of tuples
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

  const prepareBatchTranchedStreamCreation = useCallback(
    (tranchedStreams: SablierPayroll[], recipients: Address[]) => {
      if (tranchedStreams.length !== recipients.length) {
        throw new Error(
          'Parameters mismatch. Amount of created streams has to match amount of recipients',
        );
      }

      const preparedStreamCreationTransactions: { calldata: Hex; targetAddress: Address }[] = [];
      const preparedTokenApprovalsTransactions: { calldata: Hex; tokenAddress: Address }[] = [];

      tranchedStreams.forEach((streamData, index) => {
        const recipient = recipients[index];
        const tokenAddress = streamData.asset.address;
        // @todo - Smarter way would be to batch token approvals and streams creation, and not just build single approval + creation transactions for each stream
        const { tokenCalldata, assembledStream } = prepareDynamicOrTranchedStream({
          recipient,
          totalAmount: streamData.amount.value,
          asset: streamData.asset,
          frequencyNumber: streamData.paymentFrequencyNumber,
          frequency: streamData.paymentFrequency,
          startDate: streamData.paymentStartDate.getTime(),
        });

        const sablierBatchCalldata = encodeFunctionData({
          abi: SablierV2BatchAbi,
          functionName: 'createWithDurationsLT', // Another option would be to use createWithTimestampsLT. Essentially they're doing the same, `WithDurations` just simpler for usage
          args: [sablierV2LockupTranched, tokenAddress, [assembledStream]],
        });

        preparedStreamCreationTransactions.push({
          calldata: sablierBatchCalldata,
          targetAddress: sablierV2Batch,
        });
        preparedTokenApprovalsTransactions.push({ calldata: tokenCalldata, tokenAddress });
      });

      return { preparedStreamCreationTransactions, preparedTokenApprovalsTransactions };
    },
    [prepareDynamicOrTranchedStream, sablierV2Batch, sablierV2LockupTranched],
  );

  const prepareFlushStreamTx = useCallback((stream: BaseSablierStream, to: Address) => {
    if (!stream.streamId || !stream.contractAddress) {
      throw new Error('Can not flush stream without streamId or contract address');
    }

    // @dev This function comes from "basic" SablierV2
    // all the types of streams are inheriting from that
    // so it's safe to rely on TranchedAbi
    const flushCalldata = encodeFunctionData({
      abi: SablierV2LockupTranchedAbi,
      functionName: 'withdrawMax',
      args: [BigInt(stream.streamId), to],
    });

    return { calldata: flushCalldata, targetAddress: stream.contractAddress };
  }, []);

  const prepareCancelStreamTx = useCallback((stream: BaseSablierStream) => {
    if (!stream.streamId || !stream.contractAddress) {
      throw new Error('Can not flush stream without streamId or contract address');
    }

    // @dev This function comes from "basic" SablierV2
    // all the types of streams are inheriting from that
    // so it's safe to rely on TranchedAbi
    const flushCalldata = encodeFunctionData({
      abi: SablierV2LockupTranchedAbi,
      functionName: 'cancel',
      args: [BigInt(stream.streamId)],
    });

    return { calldata: flushCalldata, targetAddress: stream.contractAddress };
  }, []);

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
    prepareCreateLinearLockupProposal,
    prepareBatchTranchedStreamCreation,
    prepareFlushStreamTx,
    prepareCancelStreamTx,
  };
}
