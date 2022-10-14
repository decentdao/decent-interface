import { BigNumber, constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import {
  ERC20TokenEvent,
  TokenDepositEvent,
  TokenWithdrawEvent,
  TreasuryAssetFungible,
} from '../types';
import { Web3Token } from '../models/Web3Token';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { getMainnetAddress } from '../utils';

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
    state: { chainId, provider },
  } = useWeb3Provider();

  /**
   * calculates native coin total amounts
   */
  useEffect(() => {
    if (!nativeDeposits?.length) return;

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
      contractAddress: constants.AddressZero,
      totalAmount: amount,
      formattedTotal: utils.formatUnits(amount, 18),
    });

    setAssets(Array.from(treasuryAssets.values()));
  }, [nativeDeposits, nativeWithdraws, treasuryAssets]);

  /**
   * calculates erc20 token total amounts
   */
  useEffect(() => {
    if (!erc20TokenDeposits?.length || !erc20TokenWithdraws || !provider) return;

    const tokens = new Map<string, { tokenData: Web3Token; amount: BigNumber }>();

    // initlizes Web3Token class for each token
    // for each event sets the addresses to tokens Map
    // sums token amounts together for same token
    erc20TokenDeposits.forEach((event: ERC20TokenEvent) => {
      event.contractAddresses.forEach((contractAddress, i) => {
        const token = tokens.get(contractAddress);
        const [tokenData, amount] = !token
          ? [new Web3Token(contractAddress, provider), event.amounts[i]]
          : [token.tokenData, token.amount.add(event.amounts[i])];

        tokens.set(contractAddress, { tokenData, amount });
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

        const tokenAddress =
          chainId === 1
            ? token.tokenData.tokenAddress
            : getMainnetAddress(symbol, { fallback: token.tokenData.tokenAddress });

        treasuryAssets.set(tokenAddress, {
          name: name,
          symbol: symbol,
          decimals: decimals,
          contractAddress: tokenAddress,
          totalAmount: token.amount,
          formattedTotal: utils.formatUnits(token.amount, decimals),
        });
      })
    ).finally(() => {
      setAssets(Array.from(treasuryAssets.values()));
    });
  }, [chainId, erc20TokenDeposits, erc20TokenWithdraws, provider, treasuryAssets]);

  return assets;
};

export default useTreasuryAssets;
