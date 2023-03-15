import { GnosisSafe } from '@fractal-framework/fractal-contracts';
import { TypedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { TokenDepositEvent, TokenWithdrawEvent, TokenEventType } from '../../../types';

const useGnosisEvents = (gnosisSafe?: GnosisSafe) => {
  const [depositEvents, setDepositEvents] = useState<TokenDepositEvent[]>([]);
  const [withdrawEvents, setWithdrawEvents] = useState<TokenWithdrawEvent[]>([]);
  const provider = useProvider();
  const getPastEvents = useCallback(
    async (filter: any) => {
      if (gnosisSafe && provider) {
        const providerContract = gnosisSafe.connect(provider);
        const events = await providerContract.queryFilter(filter);
        return events;
      }
      return [];
    },
    [gnosisSafe, provider]
  );

  const depositListener = async (
    address: string,
    amount: BigNumber,
    event: TypedEvent<any, any>
  ) => {
    const block = await event.getBlock();
    setDepositEvents(prevEvents => [
      ...prevEvents,
      {
        address,
        amount,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: block.timestamp,
        eventType: TokenEventType.DEPOSIT,
      },
    ]);
  };

  const withdrawListener = async (
    address: string,
    amount: BigNumber,
    event: TypedEvent<any, any>
  ) => {
    const block = await event.getBlock();
    setWithdrawEvents(prevEvents => [
      ...prevEvents,
      {
        addresses: [address],
        amount,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: block.timestamp,
        eventType: TokenEventType.WITHDRAW,
      },
    ]);
  };

  useEffect(() => {
    const getData = async () => {
      if (gnosisSafe) {
        const events: TypedEvent<any, any>[] = await getPastEvents(
          gnosisSafe.filters.SafeReceived()
        );

        const mappedDepositEvents = await Promise.all(
          events.map(async event => {
            const block = await event.getBlock();
            return {
              address: event.args[0],
              amount: event.args[1],
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              blockTimestamp: block.timestamp,
              eventType: TokenEventType.DEPOSIT,
            };
          })
        );
        setDepositEvents(mappedDepositEvents);
      }
    };
    if (gnosisSafe) {
      getData();
      gnosisSafe.on(gnosisSafe.filters.SafeReceived(), depositListener);
      return () => {
        gnosisSafe.off(gnosisSafe.filters.SafeReceived(), depositListener);
      };
    }
  }, [gnosisSafe, getPastEvents]);

  useEffect(() => {
    const getData = async () => {
      if (gnosisSafe) {
        const events: TypedEvent<any, any>[] = await getPastEvents(
          gnosisSafe.filters.ExecutionSuccess()
        );
        const mappedWithdrawEvents = await Promise.all(
          events.map(async event => {
            const block = await event.getBlock();
            return {
              addresses: [event.args[0]],
              amount: event.args[1],
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              blockTimestamp: block.timestamp,
              eventType: TokenEventType.WITHDRAW,
            };
          })
        );
        setWithdrawEvents(mappedWithdrawEvents);
      }
    };
    if (gnosisSafe) {
      getData();
      gnosisSafe.on(gnosisSafe.filters.SafeReceived(), withdrawListener);
      return () => {
        gnosisSafe.off(gnosisSafe.filters.SafeReceived(), withdrawListener);
      };
    }
  }, [gnosisSafe, getPastEvents]);

  return {
    depositEvents,
    withdrawEvents,
  };
};

export default useGnosisEvents;
