import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { TreasuryModule } from '../../../assets/typechain-types/module-treasury';
import { TypedEvent } from '../../../assets/typechain-types/module-treasury/common';
import { ERC20TokenEvent, ERC721TokenEvent, TokenDepositEvent, TokenWithdrawEvent } from './types';

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
  const nativeDepositListener = (
    address: string,
    amount: BigNumber,
    event: TypedEvent<any, any>
  ) => {
    setNativeDeposits(prevEvents => [
      ...(prevEvents || []),
      {
        address,
        amount,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      },
    ]);
  };

  /**
   * listener for native withdraws
   * @param addresses
   * @param amounts
   * @param event
   */
  const nativeWithdrawListener = (
    addresses: string[],
    amounts: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    setNativeWithdraws(prevWithDraws => [
      ...(prevWithDraws || []),
      {
        addresses,
        amount: amounts.reduce((cur, prev) => cur.add(prev), BigNumber.from(0)),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
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
  const erc20DepositListener = (
    contractAddresses: string[],
    _: string[],
    amounts: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    setErc20TokenDeposits(prevDeposits => [
      ...(prevDeposits || []),
      {
        contractAddresses,
        amounts,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
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
  const erc20WithdrawListener = (
    contractAddresses: string[],
    _: string[],
    amounts: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    setErc20TokenWithdraws(prevTokenWithdraws => [
      ...(prevTokenWithdraws || []),
      {
        contractAddresses,
        amounts,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
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
  const erc721DepositListener = (
    contractAddresses: string[],
    _: string[],
    tokenIds: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    setErc721TokenDeposits(prevDeposits => [
      ...(prevDeposits || []),
      {
        contractAddresses,
        tokenIds,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
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
  const erc721WithdrawListener = (
    contractAddresses: string[],
    _: string[],
    tokenIds: BigNumber[],
    event: TypedEvent<any, any>
  ) => {
    setErc721TokenWithdraws(prevTokenWithdraws => [
      ...(prevTokenWithdraws || []),
      {
        contractAddresses,
        tokenIds,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
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
    // capture past native deposit events
    getPastEvents(treasuryModuleContract, treasuryModuleContract.filters.EthDeposited()).then(
      (events: TypedEvent<any, any>[]) => {
        // if no events do nothing
        if (!events.length) {
          setNativeDeposits(undefined);
          return;
        }
        // normalize native deposit events
        const depositEvents = events.map(event => {
          return {
            address: event.args[0],
            amount: event.args[1],
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          };
        });
        setNativeDeposits(depositEvents);
      }
    );

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
    // capture past native withdraw events
    getPastEvents(treasuryModuleContract, treasuryModuleContract.filters.EthWithdrawn()).then(
      (events: TypedEvent<any, any>[]) => {
        // if no events do nothing
        if (!events.length) {
          setNativeWithdraws([]);
          return;
        }
        // normalize native deposit events
        const withdrawEvents = events.map(event => {
          return {
            addresses: event.args[0],
            amount: event.args[1].reduce(
              (cur: BigNumber, prev: BigNumber) => cur.add(prev),
              BigNumber.from(0)
            ),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          };
        });
        setNativeWithdraws(withdrawEvents);
      }
    );

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
    // retreive past erc20 token deposit events
    getPastEvents(
      treasuryModuleContract,
      treasuryModuleContract.filters.ERC20TokensDeposited()
    ).then((events: TypedEvent<any, any>[]) => {
      // if no events do nothing
      if (!events.length) {
        setErc20TokenDeposits([]);
        return;
      }
      // normalize erc20 token deposit events
      const erc20Deposits = events.map(event => {
        return {
          contractAddresses: event.args[0],
          amounts: event.args[2],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
      });
      setErc20TokenDeposits(erc20Deposits);
    });

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
    getPastEvents(
      treasuryModuleContract,
      treasuryModuleContract.filters.ERC20TokensWithdrawn()
    ).then((events: TypedEvent<any, any>[]) => {
      // if no events do nothing
      if (!events.length) {
        setErc20TokenWithdraws([]);
        return;
      }
      // normalize native deposit events
      const erc20TokenWithdrawEvents = events.map(event => {
        return {
          contractAddresses: event.args[0],
          amounts: event.args[2],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
      });
      setErc20TokenWithdraws(erc20TokenWithdrawEvents);
    });

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
    // retreive past erc721 token deposit events
    getPastEvents(
      treasuryModuleContract,
      treasuryModuleContract.filters.ERC721TokensDeposited()
    ).then((events: TypedEvent<any, any>[]) => {
      // if no events do nothing
      if (!events.length) {
        setErc721TokenDeposits([]);
        return;
      }
      // normalize erc721 token deposit events
      const erc721Deposits = events.map(event => {
        return {
          contractAddresses: event.args[0],
          tokenIds: event.args[2],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
      });
      setErc721TokenDeposits(erc721Deposits);
    });

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
    getPastEvents(
      treasuryModuleContract,
      treasuryModuleContract.filters.ERC721TokensWithdrawn()
    ).then((events: TypedEvent<any, any>[]) => {
      // if no events do nothing
      if (!events.length) {
        setErc721TokenWithdraws([]);
        return;
      }
      // normalize native deposit events
      const erc721TokenWithdrawEvents = events.map(event => {
        return {
          contractAddresses: event.args[0],
          tokenIds: event.args[2],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
      });
      setErc721TokenWithdraws(erc721TokenWithdrawEvents);
    });

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
