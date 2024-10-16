import { abis } from '@fractal-framework/fractal-contracts';
import groupBy from 'lodash.groupby';
import { useCallback } from 'react';
import { Address, Hex, encodeFunctionData, erc20Abi, zeroAddress, getAddress } from 'viem';
import GnosisSafeL2 from '../../assets/abi/GnosisSafeL2';
import SablierV2BatchAbi from '../../assets/abi/SablierV2Batch';
import { PreparedNewStreamData } from '../../components/pages/Roles/types';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { SENTINEL_MODULE } from '../../utils/address';

export function convertStreamIdToBigInt(streamId: string) {
  // streamId is formatted as ${streamContractAddress}-${chainId}-${numericId}
  const lastDash = streamId.lastIndexOf('-');
  const numericId = streamId.substring(lastDash + 1);
  return BigInt(numericId);
}

export default function useCreateSablierStream() {
  const {
    contracts: { sablierV2LockupLinear, sablierV2Batch, decentSablierMasterCopy },
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

  const prepareFlushStreamTxs = useCallback(
    (args: { streamId: string; to: Address; smartAccount: Address }) => {
      if (!daoAddress) {
        throw new Error('Can not flush stream without DAO Address');
      }

      const { streamId, to, smartAccount } = args;

      const enableModuleData = encodeFunctionData({
        abi: GnosisSafeL2,
        functionName: 'enableModule',
        args: [decentSablierMasterCopy],
      });

      const disableModuleData = encodeFunctionData({
        abi: GnosisSafeL2,
        functionName: 'disableModule',
        args: [SENTINEL_MODULE, decentSablierMasterCopy],
      });

      const withdrawMaxFromStreamData = encodeFunctionData({
        abi: abis.DecentSablierStreamManagement,
        functionName: 'withdrawMaxFromStream',
        args: [sablierV2LockupLinear, smartAccount, convertStreamIdToBigInt(streamId), to],
      });

      return [
        {
          targetAddress: daoAddress,
          calldata: enableModuleData,
        },
        {
          targetAddress: decentSablierMasterCopy,
          calldata: withdrawMaxFromStreamData,
        },
        {
          targetAddress: daoAddress,
          calldata: disableModuleData,
        },
      ];
    },
    [daoAddress, decentSablierMasterCopy, sablierV2LockupLinear],
  );

  const prepareCancelStreamTxs = useCallback(
    (streamId: string) => {
      if (!daoAddress) {
        throw new Error('Can not flush stream without DAO Address');
      }

      const enableModuleData = encodeFunctionData({
        abi: GnosisSafeL2,
        functionName: 'enableModule',
        args: [decentSablierMasterCopy],
      });

      const disableModuleData = encodeFunctionData({
        abi: GnosisSafeL2,
        functionName: 'disableModule',
        args: [SENTINEL_MODULE, decentSablierMasterCopy],
      });

      const cancelStreamData = encodeFunctionData({
        abi: abis.DecentSablierStreamManagement,
        functionName: 'cancelStream',
        args: [sablierV2LockupLinear, convertStreamIdToBigInt(streamId)],
      });

      return [
        {
          targetAddress: daoAddress,
          calldata: enableModuleData,
        },
        {
          targetAddress: decentSablierMasterCopy,
          calldata: cancelStreamData,
        },
        {
          targetAddress: daoAddress,
          calldata: disableModuleData,
        },
      ];
    },
    [daoAddress, decentSablierMasterCopy, sablierV2LockupLinear],
  );

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
    prepareFlushStreamTxs,
    prepareCancelStreamTxs,
    prepareLinearStream,
  };
}
