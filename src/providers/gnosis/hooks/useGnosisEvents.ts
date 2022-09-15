import { useState, useEffect, useCallback } from 'react';
import { BigNumber } from 'ethers';
import { TypedEvent } from '../../../assets/typechain-types/gnosis-safe/common';
import { TokenDepositEvent, TokenEventType, TokenWithdrawEvent } from '../../treasury/types';
import useGnosisSafe from './useGnosisSafe';

const useGnosisEvents = (safeAddress?: string) => {
  const [depositEvents, setDepositEvents] = useState<TokenDepositEvent[]>([]);
  const [withdrawEvents, setWithdrawEvents] = useState<TokenWithdrawEvent[]>([]);
  const gnosisSafe = useGnosisSafe(safeAddress);

  const getPastEvents = useCallback(
    async (filter: any) => {
      if (gnosisSafe) {
        const events = await gnosisSafe.queryFilter(filter);
        return events;
      }
      return [];
    },
    [gnosisSafe]
  );

  const depositListener = (address: string, amount: BigNumber, event: TypedEvent<any, any>) => {
    setDepositEvents(prevEvents => [
      ...prevEvents,
      {
        address,
        amount,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        eventType: TokenEventType.DEPOSIT,
      },
    ]);
  };

  const withdrawListener = (address: string, amount: BigNumber, event: TypedEvent<any, any>) => {
    setWithdrawEvents(prevEvents => [
      ...prevEvents,
      {
        addresses: [address],
        amount,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        eventType: TokenEventType.WITHDRAW,
      },
    ]);
  };

  useEffect(() => {
    if (gnosisSafe) {
      getPastEvents(gnosisSafe.filters.SafeReceived()).then((events: TypedEvent<any, any>[]) => {
        const mappedDepositEvents = events.map(event => {
          return {
            address: event.args[0],
            amount: event.args[1],
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            eventType: TokenEventType.DEPOSIT,
          };
        });
        setDepositEvents(mappedDepositEvents);
      });
      gnosisSafe.on(gnosisSafe.filters.SafeReceived(), depositListener);
      return () => {
        gnosisSafe.off(gnosisSafe.filters.SafeReceived(), depositListener);
      };
    }
  }, [gnosisSafe, getPastEvents]);

  useEffect(() => {
    if (gnosisSafe) {
      getPastEvents(gnosisSafe.filters.ExecutionSuccess()).then(
        (events: TypedEvent<any, any>[]) => {
          const mappedWithdrawEvents = events.map(event => {
            return {
              addresses: [event.args[0]],
              amount: event.args[1],
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              eventType: TokenEventType.WITHDRAW,
            };
          });
          setWithdrawEvents(mappedWithdrawEvents);
        }
      );
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
