import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { ERC721TokenEvent, TreasuryAssetNonFungible } from '../types';
import { Web3NFT } from '../models/Web3NFT';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

/**
 * handles events to generate a list of assets count and amounts.
 *
 * @param erc721Deposits
 * @param erc721Withdraws
 * @returns TreasuryAsset[]
 */
const useTreasuryAssets = (
  erc721TokenDeposits?: ERC721TokenEvent[],
  erc721TokenWithdraws?: ERC721TokenEvent[]
) => {
  // <Map<string, TreasuryAsset>>
  const [treasuryAssets] = useState<Map<string, TreasuryAssetNonFungible>>(new Map());

  const {
    state: { provider },
  } = useWeb3Provider();

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
          name: name,
          symbol: symbol,
          tokenId: token.tokenId,
          contractAddress: tokenAddress,
          tokenURI: tokenURI,
        });
      })
    );
  }, [erc721TokenDeposits, erc721TokenWithdraws, provider, treasuryAssets]);

  return Array.from(treasuryAssets.values());
};

export default useTreasuryAssets;
