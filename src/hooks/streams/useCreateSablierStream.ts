import groupBy from 'lodash.groupby';
import { useCallback } from 'react';
import { Address, Hex, encodeFunctionData, erc20Abi, getAddress, zeroAddress } from 'viem';
import SablierV2BatchAbi from '../../assets/abi/SablierV2Batch';
import { SablierV2LockupLinearAbi } from '../../assets/abi/SablierV2LockupLinear';
import { BaseSablierStream, SablierPayment } from '../../components/pages/Roles/types';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

type LinearStreamInputs = {
  totalAmount: bigint;
  recipient: Address;
  startDate: Date;
  endDate: Date;
  cliffDate: Date | undefined;
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

  const prepareLinearStream = useCallback(
    ({ totalAmount, recipient, startDate, endDate, cliffDate }: LinearStreamInputs) => {
      const streamDuration = Math.ceil(
        (Date.now() - startDate.getTime() + endDate.getTime()) / 1000,
      );
      const cliffDuration = cliffDate ? Math.ceil(cliffDate.getTime()) : 0;

      if (!streamDuration) {
        throw new Error('Stream duration can not be 0');
      }
      const basicStreamData = prepareBasicStreamData(recipient, totalAmount);
      const assembledStream = {
        ...basicStreamData,
        durations: {
          cliff: cliffDuration,
          total: streamDuration + cliffDuration, // Total duration has to include cliff duration
        },
      };

      return assembledStream;
    },
    [prepareBasicStreamData],
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

      const groupedStreams = groupBy(linearStreams, 'asset.address');
      Object.keys(groupedStreams).forEach(assetAddress => {
        const assembledStreams: ReturnType<typeof prepareLinearStream>[] = [];
        const streams = groupedStreams[assetAddress];
        const tokenAddress = getAddress(assetAddress);
        let totalStreamsAmount = 0n;

        streams.forEach((streamData, index) => {
          if (!streamData.amount.bigintValue || streamData.amount.bigintValue <= 0n) {
            console.error(
              'Error creating linear stream - stream amount must be bigger than 0',
              streamData,
            );
            throw new Error('Stream total amount must be greater than 0');
          }
          totalStreamsAmount += streamData.amount.bigintValue;
          const recipient = recipients[index];

          const assembledStream = prepareLinearStream({
            recipient,
            ...streamData,
            totalAmount: streamData.amount.bigintValue,
          });
          assembledStreams.push(assembledStream);
        });

        const sablierBatchCalldata = encodeFunctionData({
          abi: SablierV2BatchAbi,
          functionName: 'createWithDurationsLL', // @dev Another option would be to use `createWithTimestampsLL`. Essentially they're doing the same, `WithDurations` just simpler for usage
          args: [sablierV2LockupLinear, tokenAddress, assembledStreams],
        });

        preparedStreamCreationTransactions.push({
          calldata: sablierBatchCalldata,
          targetAddress: sablierV2Batch,
        });

        const tokenCalldata = prepareStreamTokenCallData(totalStreamsAmount);

        preparedTokenApprovalsTransactions.push({
          calldata: tokenCalldata,
          targetAddress: tokenAddress,
        });
      });

      return { preparedStreamCreationTransactions, preparedTokenApprovalsTransactions };
    },
    [prepareLinearStream, prepareStreamTokenCallData, sablierV2Batch, sablierV2LockupLinear],
  );

  return {
    prepareBatchLinearStreamCreation,
    prepareFlushStreamTx,
    prepareCancelStreamTx,
  };
}
