import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { TreasuryModule } from '../../../assets/typechain-types/module-treasury';
import { TypedEvent } from '../../../assets/typechain-types/module-treasury/common';
import {
  ERC20TokenEvent,
  ERC721TokenEvent,
  TokenDepositEvent,
  TokenEventType,
  TokenWithdrawEvent,
} from '../types';

const useTreasuryEvents = (treasuryModuleContract?: TreasuryModule) => {
  const [nativeDeposits, setNativeDeposits] = useState<TokenDepositEvent[]>();
  const [nativeWithdraws, setNativeWithdraws] = useState<TokenWithdrawEvent[]>([]);
  const [erc20TokenDeposits, setErc20TokenDeposits] = useState<ERC20TokenEvent[]>([]);
  const [erc20TokenWithdraws, setErc20TokenWithdraws] = useState<ERC20TokenEvent[]>([]);
  const [erc721TokenDeposits, setErc721TokenDeposits] = useState<ERC721TokenEvent[]>([]);
  const [erc721TokenWithdraws, setErc721TokenWithdraws] = useState<ERC721TokenEvent[]>([]);

  /**
   * retreives past events and sets it to state
   *
   * @param treasuryModuleContract
   * @param filter contract query filter for specific event
   */
  const getPastEvents = useCallback(async (treasuryContract: TreasuryModule, filter: any) => {
    const events = await treasuryContract.queryFilter(filter);
    return events;
  }, []);

  /**
   * listener for native deposits
   * @param address
   * @param amount
   * @param event
   */
  const nativeDepositListener = async (
    address: string,
    amount: BigNumber,
    event: TypedEvent<any, any>
  ) => {
    const block = await event.getBlock();
    setNativeDeposits(prevEvents => [
      ...(prevEvents || []),
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

  /**
   * listener for native withdraws
   * @param addresses
   * @param amounts
   * @param event
   */
  const nativeWithdrawListener = async (
    addresses: string[],
    amounts: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    const block = await event.getBlock();
    setNativeWithdraws(prevWithDraws => [
      ...(prevWithDraws || []),
      {
        addresses,
        amount: amounts.reduce((cur, prev) => cur.add(prev), BigNumber.from(0)),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: block.timestamp,
        eventType: TokenEventType.WITHDRAW,
      },
    ]);
  };

  /**
   * listener for erc20 token deposits
   * @param contractAddresses
   * @param senders
   * @param amounts
   * @param event
   */
  const erc20DepositListener = async (
    contractAddresses: string[],
    addresses: string[],
    amounts: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    const block = await event.getBlock();
    setErc20TokenDeposits(prevDeposits => [
      ...(prevDeposits || []),
      {
        contractAddresses,
        amounts,
        addresses,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: block.timestamp,
        eventType: TokenEventType.DEPOSIT,
      },
    ]);
  };

  /**
   * listners for erc20 token withdrawns
   * @param contractAddresses
   * @param senders
   * @param amounts
   * @param event
   */
  const erc20WithdrawListener = async (
    contractAddresses: string[],
    addresses: string[],
    amounts: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    const block = await event.getBlock();
    setErc20TokenWithdraws(prevTokenWithdraws => [
      ...(prevTokenWithdraws || []),
      {
        contractAddresses,
        amounts,
        addresses,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: block.timestamp,
        eventType: TokenEventType.WITHDRAW,
      },
    ]);
  };

  /**
   * listener for erc721 token deposits
   * @param contractAddresses
   * @param senders
   * @param tokenIds
   * @param event
   */
  const erc721DepositListener = async (
    contractAddresses: string[],
    _: string[],
    tokenIds: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    const block = await event.getBlock();
    setErc721TokenDeposits(prevDeposits => [
      ...(prevDeposits || []),
      {
        contractAddresses,
        tokenIds,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: block.timestamp,
        eventType: TokenEventType.DEPOSIT,
      },
    ]);
  };

  /**
   * listners for erc721 token withdrawns
   * @param contractAddresses
   * @param senders
   * @param tokenIds
   * @param event
   */
  const erc721WithdrawListener = async (
    contractAddresses: string[],
    _: string[],
    tokenIds: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    const block = await event.getBlock();
    setErc721TokenWithdraws(prevTokenWithdraws => [
      ...(prevTokenWithdraws || []),
      {
        contractAddresses,
        tokenIds,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: block.timestamp,
        eventType: TokenEventType.WITHDRAW,
      },
    ]);
  };

  const resetState = () => {
    setNativeDeposits(undefined);
    setNativeWithdraws([]);
    setErc20TokenDeposits([]);
    setErc20TokenWithdraws([]);
    setErc721TokenDeposits([]);
    setErc721TokenWithdraws([]);
  };
  /**
   * handles deposit events for native coins on treasury module contract
   * sets an event listener for native coin deposits
   */
  useEffect(() => {
    if (!treasuryModuleContract) {
      resetState();
      return;
    }

    const getData = async () => {
      // capture past native deposit events
      const events: TypedEvent<any, any>[] = await getPastEvents(
        treasuryModuleContract,
        treasuryModuleContract.filters.EthDeposited()
      );

      if (!events.length) {
        setNativeDeposits(undefined);
        return;
      }
      // normalize native deposit events
      const depositEvents = await Promise.all(
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
      setNativeDeposits(depositEvents);
    };

    getData();

    // adds listener for real-time events
    treasuryModuleContract.on(treasuryModuleContract.filters.EthDeposited(), nativeDepositListener);

    return () => {
      treasuryModuleContract.off(
        treasuryModuleContract.filters.EthDeposited(),
        nativeDepositListener
      );
    };
  }, [treasuryModuleContract, getPastEvents]);

  /**
   * handles withdraw events for native coins on treasury module contract
   * sets an event listener for native coin withdraws
   */
  useEffect(() => {
    if (!treasuryModuleContract) {
      resetState();
      return;
    }

    const getData = async () => {
      // capture past native withdraw events
      const events: TypedEvent<any, any>[] = await getPastEvents(
        treasuryModuleContract,
        treasuryModuleContract.filters.EthWithdrawn()
      );
      // if no events do nothing
      if (!events.length) {
        setNativeWithdraws([]);
        return;
      }
      // normalize native deposit events
      const withdrawEvents = await Promise.all(
        events.map(async event => {
          const block = await event.getBlock();
          return {
            addresses: event.args[0],
            amount: event.args[1].reduce(
              (cur: BigNumber, prev: BigNumber) => cur.add(prev),
              BigNumber.from(0)
            ),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            blockTimestamp: block.timestamp,
            eventType: TokenEventType.WITHDRAW,
          };
        })
      );
      setNativeWithdraws(withdrawEvents);
    };

    getData();

    // adds listener for real-time events
    treasuryModuleContract.on(
      treasuryModuleContract.filters.EthWithdrawn(),
      nativeWithdrawListener
    );

    return () => {
      treasuryModuleContract.off(
        treasuryModuleContract.filters.EthWithdrawn(),
        nativeWithdrawListener
      );
    };
  }, [treasuryModuleContract, getPastEvents]);

  /**
   * handles deposit events for erc20 tokens on treasury module contract
   * sets an event listener for erc20 tokens deposit
   */
  useEffect(() => {
    if (!treasuryModuleContract) {
      resetState();
      return;
    }

    const getData = async () => {
      // retreive past erc20 token deposit events
      const events: TypedEvent<any, any>[] = await getPastEvents(
        treasuryModuleContract,
        treasuryModuleContract.filters.ERC20TokensDeposited()
      );
      // if no events do nothing
      if (!events.length) {
        setErc20TokenDeposits([]);
        return;
      }
      // normalize erc20 token deposit events
      const erc20Deposits = await Promise.all(
        events.map(async event => {
          const block = await event.getBlock();
          return {
            contractAddresses: event.args[0],
            addresses: event.args[1],
            amounts: event.args[2],
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            blockTimestamp: block.timestamp,
            eventType: TokenEventType.DEPOSIT,
          };
        })
      );
      setErc20TokenDeposits(erc20Deposits);
    };

    getData();

    // adds listener for real-time events
    treasuryModuleContract.on(
      treasuryModuleContract.filters.ERC20TokensDeposited(),
      erc20DepositListener
    );

    return () => {
      treasuryModuleContract.off(
        treasuryModuleContract.filters.ERC20TokensDeposited(),
        erc20DepositListener
      );
    };
  }, [treasuryModuleContract, getPastEvents]);

  /**
   * handles withdraw events for erc20 tokens on treasury module contract
   * sets an event listener for erc20 tokens withdraws
   */
  useEffect(() => {
    if (!treasuryModuleContract) {
      resetState();
      return;
    }

    const getData = async () => {
      const events: TypedEvent<any, any>[] = await getPastEvents(
        treasuryModuleContract,
        treasuryModuleContract.filters.ERC20TokensWithdrawn()
      );
      // if no events do nothing
      if (!events.length) {
        setErc20TokenWithdraws([]);
        return;
      }
      // normalize native deposit events
      const erc20TokenWithdrawEvents = await Promise.all(
        events.map(async event => {
          const block = await event.getBlock();
          return {
            contractAddresses: event.args[0],
            addresses: event.args[1],
            amounts: event.args[2],
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            blockTimestamp: block.timestamp,
            eventType: TokenEventType.WITHDRAW,
          };
        })
      );
      setErc20TokenWithdraws(erc20TokenWithdrawEvents);
    };

    getData();

    // adds listener for real-time events
    treasuryModuleContract.on(
      treasuryModuleContract.filters.ERC20TokensWithdrawn(),
      erc20WithdrawListener
    );

    return () => {
      treasuryModuleContract.off(
        treasuryModuleContract.filters.ERC20TokensWithdrawn(),
        erc20WithdrawListener
      );
    };
  }, [treasuryModuleContract, getPastEvents]);

  /**
   * handles deposit events for erc721 tokens on treasury module contract
   * sets an event listener for erc721 tokens deposit
   */
  useEffect(() => {
    if (!treasuryModuleContract) {
      resetState();
      return;
    }

    const getData = async () => {
      // retreive past erc721 token deposit events
      const events: TypedEvent<any, any>[] = await getPastEvents(
        treasuryModuleContract,
        treasuryModuleContract.filters.ERC721TokensDeposited()
      );

      // if no events do nothing
      if (!events.length) {
        setErc721TokenDeposits([]);
        return;
      }
      // normalize erc721 token deposit events
      const erc721Deposits = await Promise.all(
        events.map(async event => {
          const block = await event.getBlock();
          return {
            contractAddresses: event.args[0],
            tokenIds: event.args[2],
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            blockTimestamp: block.timestamp,
            eventType: TokenEventType.DEPOSIT,
          };
        })
      );
      setErc721TokenDeposits(erc721Deposits);
    };

    getData();

    // adds listener for real-time events
    treasuryModuleContract.on(
      treasuryModuleContract.filters.ERC721TokensDeposited(),
      erc721DepositListener
    );

    return () => {
      treasuryModuleContract.off(
        treasuryModuleContract.filters.ERC721TokensDeposited(),
        erc721DepositListener
      );
    };
  }, [treasuryModuleContract, getPastEvents]);

  /**
   * handles withdraw events for erc721 tokens on treasury module contract
   * sets an event listener for erc721 tokens withdraws
   */
  useEffect(() => {
    if (!treasuryModuleContract) {
      resetState();
      return;
    }

    const getData = async () => {
      const events: TypedEvent<any, any>[] = await getPastEvents(
        treasuryModuleContract,
        treasuryModuleContract.filters.ERC721TokensWithdrawn()
      );

      // if no events do nothing
      if (!events.length) {
        setErc721TokenWithdraws([]);
        return;
      }
      // normalize native deposit events
      const erc721TokenWithdrawEvents = await Promise.all(
        events.map(async event => {
          const block = await event.getBlock();
          return {
            contractAddresses: event.args[0],
            tokenIds: event.args[2],
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            blockTimestamp: block.timestamp,
            eventType: TokenEventType.WITHDRAW,
          };
        })
      );
      setErc721TokenWithdraws(erc721TokenWithdrawEvents);
    };

    getData();

    // adds listener for real-time events
    treasuryModuleContract.on(
      treasuryModuleContract.filters.ERC721TokensWithdrawn(),
      erc721WithdrawListener
    );

    return () => {
      treasuryModuleContract.off(
        treasuryModuleContract.filters.ERC721TokensWithdrawn(),
        erc721WithdrawListener
      );
    };
  }, [treasuryModuleContract, getPastEvents]);

  return {
    nativeDeposits,
    nativeWithdraws,
    erc20TokenDeposits,
    erc20TokenWithdraws,
    erc721TokenDeposits,
    erc721TokenWithdraws,
  };
};

export default useTreasuryEvents;
