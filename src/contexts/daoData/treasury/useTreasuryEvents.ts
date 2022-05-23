import { useCallback, useEffect, useState } from "react";
import { TreasuryModule } from "../../../typechain-types";
import { TypedEvent } from "../../../typechain-types/common";
import { ERC20TokenEvent, TokenEvent } from "./types";

// @todo eth deposits should be renamed to native deposits for future proofing
// @todo eth deposit emitted event only returns sender address in listeners

// @todo handle erc721 deposits/withdrawals

const useTreasuryEvents = (treasuryModuleContract?: TreasuryModule) => {
  const [nativeDeposits, setNativeDeposits] = useState<TokenEvent[]>([]);
  const [nativeWithdrawals, setNativeWithdrawals] = useState<TokenEvent[]>([]);
  const [erc20Deposits, setErc20Deposits] = useState<ERC20TokenEvent[]>([]);
  const [erc20Withdrawals, setErc20Withdrawals] = useState<ERC20TokenEvent[]>([]);

  /**
   * retreives past events and sets it to state
   *
   * @param treasuryModuleContract
   * @param filter contract query filter for specific event
   * @param setMethod state set method
   */
  const getPastEvents = useCallback(async (treasuryModuleContract: TreasuryModule, filter: any) => {
    const events = await treasuryModuleContract.queryFilter(filter);
    return events;
  }, []);

  /**
   * handles deposit events for native coins on treasury module contract
   * sets an event listener for native coin deposits
   */
  useEffect(() => {
    if (!treasuryModuleContract) {
      return;
    }
    // capture past native deposit events
    getPastEvents(treasuryModuleContract, treasuryModuleContract.filters.EthDeposited()).then((events: TypedEvent<any, any>[]) => {
      // if no events do nothing
      if (!events.length) {
        return;
      }
      // normalize native deposit events
      const depositEvents = events.map((event) => {
        return {
          address: event.args[0],
          amount: event.args[1],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
      });
      setNativeDeposits(depositEvents);
    });

    // adds listener for real-time events
    treasuryModuleContract.on(treasuryModuleContract.filters.EthDeposited(), (address, amount, event) => {
      setNativeDeposits((prevEvents) => [
        ...prevEvents,
        {
          address,
          amount,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        },
      ]);
    });

    return () => {
      treasuryModuleContract.off(treasuryModuleContract.filters.EthDeposited(), () => {});
    };
  }, [treasuryModuleContract, getPastEvents]);

  /**
   * handles withdraw events for native coins on treasury module contract
   * sets an event listener for native coin withdrawals
   */
  useEffect(() => {
    if (!treasuryModuleContract) {
      return;
    }
    // capture past native withdraw events
    getPastEvents(treasuryModuleContract, treasuryModuleContract.filters.EthWithdrawn()).then((events: TypedEvent<any, any>[]) => {
      // if no events do nothing
      if (!events.length) {
        return;
      }
      // normalize native deposit events
      const depositEvents = events.map((event) => {
        return {
          address: event.args[0],
          amount: event.args[1],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
      });
      setNativeWithdrawals(depositEvents);
    });

    // adds listener for real-time events
    treasuryModuleContract.on(treasuryModuleContract.filters.EthWithdrawn(), (addresses, amounts, event) => {
      // ? @todo Why is address and amount array types?
    });

    return () => {
      treasuryModuleContract.off(treasuryModuleContract.filters.EthWithdrawn(), () => {});
    };
  }, [treasuryModuleContract, getPastEvents]);

  /**
   * handles deposit events for erc20 coins on treasury module contract
   * sets an event listener for erc20 coin deposit
   */
  useEffect(() => {
    if (!treasuryModuleContract) {
      return;
    }
    // capture past erc20 deposit events
    getPastEvents(treasuryModuleContract, treasuryModuleContract.filters.ERC20TokensDeposited()).then((events: TypedEvent<any, any>[]) => {
      // @todo capture erc20 deposit events
    });

    // adds listener for real-time events
    treasuryModuleContract.on(treasuryModuleContract.filters.ERC20TokensDeposited(), () => {
      // @todo add listeners for erc20 deposit events
    });

    return () => {
      treasuryModuleContract.off(treasuryModuleContract.filters.ERC20TokensDeposited(), () => {});
    };
  }, [treasuryModuleContract, getPastEvents]);

  useEffect(() => {
    if (!treasuryModuleContract) {
      return;
    }
    getPastEvents(treasuryModuleContract, treasuryModuleContract.filters.ERC20TokensWithdrawn()).then((events: TypedEvent<any, any>[]) => {
      // @todo capture erc20 withdraw events
    });

    // adds listener for real-time events
    treasuryModuleContract.on(treasuryModuleContract.filters.ERC20TokensWithdrawn(), () => {
      // @todo add listeners for erc20 withdraw events
    });

    return () => {
      treasuryModuleContract.off(treasuryModuleContract.filters.ERC20TokensWithdrawn(), () => {});
    };
  }, [treasuryModuleContract, getPastEvents]);

  return { nativeDeposits, nativeWithdrawals, erc20Deposits, erc20Withdrawals };
};

export default useTreasuryEvents;
