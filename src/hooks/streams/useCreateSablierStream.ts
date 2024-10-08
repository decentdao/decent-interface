import groupBy from 'lodash.groupby';
import { useCallback } from 'react';
import { Address, Hex, encodeFunctionData, erc20Abi, zeroAddress, getAddress } from 'viem';
import SablierV2BatchAbi from '../../assets/abi/SablierV2Batch';
import { SablierV2LockupLinearAbi } from '../../assets/abi/SablierV2LockupLinear';
import { PreparedNewStreamData } from '../../components/pages/Roles/types';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

export function convertStreamIdToBigInt(streamId: string) {
  // streamId is formatted as ${streamContractAddress}-${chainId}-${numericId}
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
    ({ totalAmount, recipient, startDateTs, endDateTs, cliffDateTs }: PreparedNewStreamData) => {
      if (startDateTs >= endDateTs) {
        throw new Error('Start date of the stream can not be larger than end date');
      }

      if (cliffDateTs) {
        if (cliffDateTs <= startDateTs) {
          throw new Error('Cliff date can not be less or equal than start date');
        } else if (cliffDateTs >= endDateTs) {
          throw new Error('Cliff date can not be larger or equal than end date');
        }
      }

      return {
        ...prepareBasicStreamData(recipient, totalAmount),
        timestamps: {
          start: startDateTs,
          end: endDateTs,
          cliff: cliffDateTs,
        },
      };
    },
    [prepareBasicStreamData],
  );

  const prepareFlushStreamTx = useCallback((streamId: string, to: Address) => {
    // @dev This function comes from "basic" SablierV2
    // all the types of streams are inheriting from that
    // so it's safe to rely on any stream ABI

    const flushCalldata = encodeFunctionData({
      abi: SablierV2LockupLinearAbi,
      functionName: 'withdrawMax',
      args: [convertStreamIdToBigInt(streamId), to],
    });

    return flushCalldata;
  }, []);

  const prepareCancelStreamTx = useCallback((streamId: string, targetAddress: Address) => {
    // @dev This function comes from "basic" SablierV2
    // all the types of streams are inheriting from that
    // so it's safe to rely on any stream ABI
    const cancelCallData = encodeFunctionData({
      abi: SablierV2LockupLinearAbi,
      functionName: 'cancel',
      args: [convertStreamIdToBigInt(streamId)],
    });

    return { calldata: cancelCallData, targetAddress };
  }, []);

  const prepareBatchLinearStreamCreation = useCallback(
    (paymentStreams: PreparedNewStreamData[]) => {
      const preparedStreamCreationTransactions: { calldata: Hex; targetAddress: Address }[] = [];
      const preparedTokenApprovalsTransactions: { calldata: Hex; targetAddress: Address }[] = [];

      const groupedStreams = groupBy(paymentStreams, 'assetAddress');
      Object.keys(groupedStreams).forEach(assetAddress => {
        const assembledStreams: ReturnType<typeof prepareLinearStream>[] = [];
        const streams = groupedStreams[assetAddress];
        let totalStreamsAmount = 0n;
        const tokenAddress = getAddress(assetAddress);
        streams.forEach(streamData => {
          totalStreamsAmount += streamData.totalAmount;

          assembledStreams.push(prepareLinearStream(streamData));
        });

        preparedStreamCreationTransactions.push({
          calldata: encodeFunctionData({
            abi: SablierV2BatchAbi,
            functionName: 'createWithTimestampsLL',
            args: [sablierV2LockupLinear, tokenAddress, assembledStreams],
          }),
          targetAddress: sablierV2Batch,
        });

        preparedTokenApprovalsTransactions.push({
          calldata: prepareStreamTokenCallData(totalStreamsAmount),
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
    prepareLinearStream,
  };
}
