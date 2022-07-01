import { BigNumber, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { useWeb3Provider } from '../../web3Data/hooks/useWeb3Provider';
import {
  ERC20TokenEvent,
  ERC721TokenEvent,
  TokenDepositEvent,
  TokenWithdrawEvent,
  TreasuryAsset,
} from './types';
import Web3Token from './Web3Token';
import Web3NFT from './Web3NFT';

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
  erc20TokenWithdraws?: ERC20TokenEvent[],
  erc721TokenDeposits?: ERC721TokenEvent[],
  erc721TokenWithdraws?: ERC721TokenEvent[]
) => {
  // <Map<string, TreasuryAsset>>
  const [treasuryAssets] = useState<Map<string, TreasuryAsset>>(new Map());

  const {
    state: { provider },
  } = useWeb3Provider();

  /**
   * calculates native coin total amounts
   */
  useEffect(() => {
    if (!nativeDeposits || !nativeDeposits.length || !nativeWithdraws) {
      treasuryAssets.clear();
      return;
    }
    let amount = BigNumber.from(0);
    nativeDeposits.forEach((event: TokenDepositEvent) => {
      amount = amount.add(event.amount);
    });

    nativeWithdraws.forEach((event: TokenWithdrawEvent) => {
      amount = amount.sub(event.amount);
    });

    // native coins are set to "0x" key,
    treasuryAssets.set('0x', {
      type: 'native',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      tokenId: BigNumber.from('0'),
      contractAddress: '',
      totalAmount: amount,
      formatedTotal: utils.formatUnits(amount, 18),
      tokenURI: '',
    });
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
          type: 'erc20',
          name: name,
          symbol: symbol,
          decimals: decimals,
          tokenId: BigNumber.from('0'),
          contractAddress: tokenAddress,
          totalAmount: token.amount,
          formatedTotal: utils.formatUnits(token.amount, decimals),
          tokenURI: '',
        });
      })
    );
  }, [erc20TokenDeposits, erc20TokenWithdraws, provider, treasuryAssets]);

  /**
   * calculates erc721 tokens
   */
  useEffect(() => {
    if (!erc721TokenDeposits || !erc721TokenDeposits.length || !erc721TokenWithdraws || !provider) {
      return;
    }

    const tokens = new Map<string, { tokenData: Web3NFT; tokenId: BigNumber }>();

    // initlizes Web3NFT class for each token
    // for each event sets the addresses to tokens Map
    // sums token amounts together for same token
    erc721TokenDeposits.forEach((event: ERC721TokenEvent) => {
      event.contractAddresses.forEach((contractAddress, i) => {
        const token = tokens.get(contractAddress);
        if (!token) {
          tokens.set(contractAddress, {
            tokenData: new Web3NFT(contractAddress, provider),
            tokenId: event.tokenIds[i],
          });
        }
        if (token) {
          tokens.set(contractAddress, {
            tokenData: token.tokenData,
            tokenId: event.tokenIds[i],
          });
        }
      });
    });

    // subtracts token amounts together for same token
    erc721TokenWithdraws.forEach((event: ERC721TokenEvent) => {
      event.contractAddresses.forEach((contractAddress, i) => {
        const token = tokens.get(contractAddress);
        if (token) {
          tokens.set(contractAddress, {
            tokenData: token.tokenData,
            tokenId: event.tokenIds[i],
          });
        }
      });
    });

    // promise using then web3Token class methods to retrive token data from blockchain.
    Promise.all(
      Array.from(tokens.values()).map(async token => {
        const name = await token.tokenData.name();
        const symbol = await token.tokenData.symbol();
        const tokenAddress = token.tokenData.tokenAddress;
        const tokenURI = await token.tokenData.tokenURI(token.tokenId);
        treasuryAssets.set(tokenAddress, {
          type: 'erc721',
          name: name,
          symbol: symbol,
          decimals: 0,
          tokenId: token.tokenId,
          contractAddress: tokenAddress,
          totalAmount: BigNumber.from('1'),
          formatedTotal: utils.formatUnits(BigNumber.from('1'), 0),
          tokenURI: tokenURI,
        });
      })
    );
  }, [erc721TokenDeposits, erc721TokenWithdraws, provider, treasuryAssets]);

  return Array.from(treasuryAssets.values());
};

export default useTreasuryAssets;
