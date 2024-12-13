import * as amplitude from '@amplitude/analytics-browser';
import { Center } from '@chakra-ui/react';
import { useEffect, useCallback } from 'react';
import { ProposalBuilder } from '../../../../components/ProposalBuilder';
import { DEFAULT_PROPOSAL } from '../../../../components/ProposalBuilder/constants';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import { useHeaderHeight } from '../../../../constants/common';
import { analyticsEvents } from '../../../../insights/analyticsEvents';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import { ProposalBuilderMode } from '../../../../types';

export function SafeProposalCreatePage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.SablierProposalCreatePageOpened);
  }, []);
  const {
    governance: { type },
  } = useFractal();
  const { safe } = useDaoInfoStore();
  
  const prepareProposalData = useCallback(async ({ streams, metaData }: CreateSablierProposalForm) => {
    if (!safeAddress) {
      throw new Error('Can not create stream without DAO address set');
    }
    const targets: Address[] = [];
    const txValues: bigint[] = [];
    const calldatas: Hash[] = [];

    const groupedStreams = groupBy(streams, 'tokenAddress');

    Object.keys(groupedStreams).forEach(token => {
      const tokenAddress = getAddress(token);
      const tokenStreams = groupedStreams[token];
      const approvedTotal = tokenStreams.reduce(
        (prev, curr) => prev + (curr.totalAmount.bigintValue || 0n),
        0n,
      );
      const approveCalldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [sablierV2Batch, approvedTotal],
      });

      targets.push(tokenAddress);
      txValues.push(0n);
      calldatas.push(approveCalldata);

      const createStreamsCalldata = encodeFunctionData({
        abi: SablierV2BatchAbi,
        functionName: 'createWithDurationsLT',
        args: [
          sablierV2LockupTranched,
          tokenAddress,
          tokenStreams.map(stream => ({
            sender: safeAddress,
            recipient: getAddress(stream.recipientAddress),
            totalAmount: stream.totalAmount.bigintValue!,
            broker: {
              account: zeroAddress,
              fee: 0n,
            },
            cancelable: stream.cancelable,
            transferable: stream.transferable,
            tranches: stream.tranches.map(tranche => ({
              amount: tranche.amount.bigintValue!,
              duration: Number(tranche.duration.bigintValue!),
            })),
          })),
        ],
      });

      targets.push(sablierV2Batch);
      txValues.push(0n);
      calldatas.push(createStreamsCalldata);
    });

    return {
      targets,
      values: txValues,
      calldatas,
      metaData,
    };
  }, [values, streams, sablierV2Batch, sablierV2LockupTranched, safeAddress]);

  const HEADER_HEIGHT = useHeaderHeight();

  if (!type || !safe?.address || !safe) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <ProposalBuilder
      initialValues={{ ...DEFAULT_PROPOSAL, nonce: safe.nextNonce }}
      mode={ProposalBuilderMode.SABLIER}
      prepareProposalData={prepareProposalData}
    />
  );
}
