import { useCallback } from 'react';
import { zeroAddress, encodeFunctionData, erc20Abi, Address, Hex } from 'viem';
import SablierV2BatchAbi from '../../assets/abi/SablierV2Batch';
import { SablierV2LockupLinearAbi } from '../../assets/abi/SablierV2LockupLinear';
import {
  BaseSablierStream,
  SablierAsset,
  SablierPayment,
} from '../../components/pages/Roles/types';
import { SECONDS_IN_DAY, SECONDS_IN_HOUR } from '../../constants/common';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import {
  StreamAbsoluteSchedule,
  StreamRelativeSchedule,
  StreamSchedule,
} from '../../types/sablier';

type LinearStreamInputs = {
  totalAmount: string;
  asset: SablierAsset;
  recipient: Address;
  schedule: StreamSchedule;
  cliff: StreamSchedule | undefined;
};

export function convertStreamIdToBigInt(streamId: string) {
  // streamId is formatted as ${recipientAddress}-${chainId}-${numericId}
  const lastDash = streamId.lastIndexOf('-');
  const numericId = streamId.substring(lastDash + 1);
  return BigInt(numericId);
}

export default function useCreateSablierStream() {
  const {
    contracts: { sablierV2LockupLinear, sablierV2Batch },
  } = useNetworkConfig();
  const {
    node: { safe },
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

  const daoAddress = safe?.address;

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

  const prepareLinearStream = useCallback(
    ({ totalAmount, asset, recipient, schedule, cliff }: LinearStreamInputs) => {
      const exponent = 10n ** BigInt(asset.decimals);
      const totalAmountInTokenDecimals = BigInt(totalAmount) * exponent;

      const calculateDuration = (abstractSchedule: StreamSchedule) => {
        let duration = 0;
        const relativeSchedule = abstractSchedule as StreamRelativeSchedule;
        const absoluteSchedule = abstractSchedule as StreamAbsoluteSchedule;

        if (
          relativeSchedule &&
          (relativeSchedule.years || relativeSchedule.days || relativeSchedule.hours)
        ) {
          duration += (relativeSchedule.years ?? 0) * SECONDS_IN_DAY * 365;
          duration += (relativeSchedule.days ?? 0) * SECONDS_IN_DAY;
          duration += (relativeSchedule.hours ?? 0) * SECONDS_IN_HOUR;
        } else if (absoluteSchedule && absoluteSchedule.startDate) {
          duration = (Date.now() - absoluteSchedule.startDate + absoluteSchedule.endDate) / 1000;
        }

        return duration;
      };
      const streamDuration = calculateDuration(schedule);
      const cliffDuration = cliff ? calculateDuration(cliff) : 0;

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

  const prepareFlushStreamTx = useCallback((stream: BaseSablierStream, to: Address) => {
    if (!stream.streamId || !stream.contractAddress) {
      throw new Error('Can not flush stream without streamId or contract address');
    }

    // @dev This function comes from "basic" SablierV2
    // all the types of streams are inheriting from that
    // so it's safe to rely on any stream ABI

    const flushCalldata = encodeFunctionData({
      abi: SablierV2LockupLinearAbi,
      functionName: 'withdrawMax',
      args: [convertStreamIdToBigInt(stream.streamId), to],
    });

    return { calldata: flushCalldata, targetAddress: stream.contractAddress };
  }, []);

  const prepareCancelStreamTx = useCallback((stream: BaseSablierStream) => {
    if (!stream.streamId || !stream.contractAddress) {
      throw new Error('Can not flush stream without streamId or contract address');
    }

    // @dev This function comes from "basic" SablierV2
    // all the types of streams are inheriting from that
    // so it's safe to rely on any stream ABI
    const flushCalldata = encodeFunctionData({
      abi: SablierV2LockupLinearAbi,
      functionName: 'cancel',
      args: [convertStreamIdToBigInt(stream.streamId)],
    });

    return { calldata: flushCalldata, targetAddress: stream.contractAddress };
  }, []);

  const prepareBatchLinearStreamCreation = useCallback(
    (linearStreams: SablierPayment[], recipients: Address[]) => {
      if (linearStreams.length !== recipients.length) {
        throw new Error(
          'Parameters mismatch. Amount of created streams has to match amount of recipients',
        );
      }

      const preparedStreamCreationTransactions: { calldata: Hex; targetAddress: Address }[] = [];
      const preparedTokenApprovalsTransactions: { calldata: Hex; targetAddress: Address }[] = [];

      linearStreams.forEach((streamData, index) => {
        const recipient = recipients[index];
        const tokenAddress = streamData.asset.address;
        const schedule =
          streamData.scheduleType === 'duration' && streamData.scheduleDuration
            ? streamData.scheduleDuration.duration
            : {
                startDate: streamData.scheduleFixedDate!.startDate.getTime(),
                endDate: streamData.scheduleFixedDate!.endDate.getTime(),
              };
        const cliff =
          streamData.scheduleType === 'duration'
            ? streamData.scheduleDuration!.cliffDuration
            : streamData.scheduleFixedDate?.cliffDate !== undefined
              ? {
                  startDate: streamData.scheduleFixedDate!.cliffDate.getTime(),
                  endDate: streamData.scheduleFixedDate!.cliffDate.getTime(),
                }
              : undefined;

        // @todo - Smarter way would be to batch token approvals and streams creation, and not just build single approval + creation transactions for each stream
        const { tokenCalldata, assembledStream } = prepareLinearStream({
          recipient,
          ...streamData,
          totalAmount: streamData.amount.value,
          asset: streamData.asset,
          schedule,
          cliff,
        });

        const sablierBatchCalldata = encodeFunctionData({
          abi: SablierV2BatchAbi,
          functionName: 'createWithDurationsLL', // Another option would be to use createWithTimestampsLL. Essentially they're doing the same, `WithDurations` just simpler for usage
          args: [sablierV2LockupLinear, tokenAddress, [assembledStream]],
        });

        preparedStreamCreationTransactions.push({
          calldata: sablierBatchCalldata,
          targetAddress: sablierV2Batch,
        });
        preparedTokenApprovalsTransactions.push({
          calldata: tokenCalldata,
          targetAddress: tokenAddress,
        });
      });

      return { preparedStreamCreationTransactions, preparedTokenApprovalsTransactions };
    },
    [prepareLinearStream, sablierV2Batch, sablierV2LockupLinear],
  );

  return {
    prepareBatchLinearStreamCreation,
    prepareFlushStreamTx,
    prepareCancelStreamTx,
  };
}
