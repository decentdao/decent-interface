import { BigNumber, ethers, utils } from 'ethers';
import { useEffect, useState, useMemo } from 'react';
import {
  ERC20TokenEvent,
  TokenDepositEvent,
  TokenWithdrawEvent,
  TreasuryAssetFungible,
} from '../types';
import { Web3Token } from '../models/Web3Token';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

/**
 * handles events to generate a list of assets count and amounts.
 *
 * @param nativeDeposits
 * @param nativeWithdraws
 * @param erc20Deposits
 * @param erc20Withdraws
 * @param erc721Deposits
 * @param erc721Withdraws
 * @returns TreasuryAsset[]
 */
const useTreasuryAssets = (
  nativeDeposits?: TokenDepositEvent[],
  nativeWithdraws?: TokenWithdrawEvent[],
  erc20TokenDeposits?: ERC20TokenEvent[],
  erc20TokenWithdraws?: ERC20TokenEvent[]
) => {
  // <Map<string, TreasuryAsset>>
  const treasuryAssets = useMemo<Map<string, TreasuryAssetFungible>>(() => new Map(), []);
  const [assets, setAssets] = useState<TreasuryAssetFungible[]>([]);

  const {
    state: { provider },
  } = useWeb3Provider();

  /**
   * calculates native coin total amounts
   */
  useEffect(() => {
    if (!nativeDeposits || !nativeDeposits.length) {
      treasuryAssets.clear();
      return;
    }
    let amount = BigNumber.from(0);
    nativeDeposits.forEach((event: TokenDepositEvent) => {
      amount = amount.add(event.amount);
    });
    if (nativeWithdraws) {
      nativeWithdraws.forEach((event: TokenWithdrawEvent) => {
        amount = amount.sub(event.amount);
      });
    }

    // native coins are set to "0x" key,
    treasuryAssets.set('0x', {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      contractAddress: ethers.constants.AddressZero,
      totalAmount: amount,
      formatedTotal: utils.formatUnits(amount, 18),
    });
    setAssets(Array.from(treasuryAssets.values()));
  }, [nativeDeposits, nativeWithdraws, treasuryAssets]);

  /**
   * calculates erc20 token total amounts
   */
  useEffect(() => {
    if (!erc20TokenDeposits || !erc20TokenDeposits.length || !erc20TokenWithdraws || !provider) {
      return;
    }

    const tokens = new Map<string, { tokenData: Web3Token; amount: BigNumber }>();

    // initlizes Web3Token class for each token
    // for each event sets the addresses to tokens Map
    // sums token amounts together for same token
    erc20TokenDeposits.forEach((event: ERC20TokenEvent) => {
      event.contractAddresses.forEach((contractAddress, i) => {
        const token = tokens.get(contractAddress);
        if (!token) {
          tokens.set(contractAddress, {
            tokenData: new Web3Token(contractAddress, provider),
            amount: event.amounts[i],
          });
        }
        if (token) {
          tokens.set(contractAddress, {
            tokenData: token.tokenData,
            amount: token.amount.add(event.amounts[i]),
          });
        }
      });
    });

    // subtracts token amounts together for same token
    erc20TokenWithdraws.forEach((event: ERC20TokenEvent) => {
      event.contractAddresses.forEach((contractAddress, i) => {
        const token = tokens.get(contractAddress);
        if (token) {
          tokens.set(contractAddress, {
            tokenData: token.tokenData,
            amount: token.amount.sub(event.amounts[i]),
          });
        }
      });
    });

    // promise using then web3Token class methods to retrive token data from blockchain.
    Promise.all(
      Array.from(tokens.values()).map(async token => {
        const name = await token.tokenData.name();
        const symbol = await token.tokenData.symbol();
        const decimals = await token.tokenData.decimals();
        const tokenAddress = token.tokenData.tokenAddress;
        treasuryAssets.set(tokenAddress, {
          name: name,
          symbol: symbol,
          decimals: decimals,
          contractAddress: tokenAddress,
          totalAmount: token.amount,
          formatedTotal: utils.formatUnits(token.amount, decimals),
        });
      })
    ).finally(() => {
      setAssets(Array.from(treasuryAssets.values()));
    });
  }, [erc20TokenDeposits, erc20TokenWithdraws, provider, treasuryAssets]);

  return assets;
};

export default useTreasuryAssets;
