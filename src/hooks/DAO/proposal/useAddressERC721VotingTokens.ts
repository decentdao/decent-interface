import { ERC721__factory } from '@fractal-framework/fractal-contracts';
import { useState, useEffect } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../types';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

export default function useAddressERC721VotingTokens(proposalId: string, address?: string) {
  const [totalVotingTokenIds, setTotalVotingTokenIds] = useState<string[]>([]);
  const [totalVotingTokenAddresses, setTotalVotingTokenAddresses] = useState<string[]>([]);
  const [remainingTokenIds, setRemainingTokenIds] = useState<string[]>([]);
  const [remainingTokenAddresses, setRemainingTokenAddresses] = useState<string[]>([]);
  const [tokenIdsByAddressMap, setTokenIdsByAddressMap] = useState<Map<string, Set<string>>>(
    new Map()
  );

  const signerOrProvider = useSignerOrProvider();
  const {
    governanceContracts: { erc721LinearVotingContract },
    governance,
  } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { erc721Tokens } = azoriusGovernance;

  useEffect(() => {
    const getUserERC721VotingTokens = async () => {
      const totalTokenAddresses: string[] = [];
      const totalTokenIds: string[] = [];
      const tokenAddresses: string[] = [];
      const tokenIds: string[] = [];
      const userERC721Tokens = new Map<string, Set<string>>();
      if (!erc721Tokens || !erc721LinearVotingContract || !address) {
        return;
      }
      await Promise.all(
        // Using `map` instead of `forEach` to simplify usage of `Promise.all`
        // and guarantee syncronous contractFn assignment
        erc721Tokens.map(async token => {
          const tokenContract = ERC721__factory.connect(token.address, signerOrProvider);
          if ((await tokenContract.balanceOf(address)).gt(0)) {
            const tokenSentEvents = await tokenContract.queryFilter(
              tokenContract.filters.Transfer(address!, null)
            );
            const tokenReceivedEvents = await tokenContract.queryFilter(
              tokenContract.filters.Transfer(null, address)
            );
            const allEvents = tokenSentEvents
              .concat(tokenReceivedEvents)
              .sort(
                (a, b) => a.blockNumber - b.blockNumber || a.transactionIndex - b.transactionIndex
              );

            const ownedTokenIds = new Set<string>();
            allEvents.forEach(({ args: { to, from, tokenId } }) => {
              if (to.toLowerCase() === address.toLowerCase()) {
                ownedTokenIds.add(tokenId.toString());
              } else if (from.toLowerCase() === address.toLowerCase()) {
                ownedTokenIds.delete(tokenId.toString());
              }
            });
            if (ownedTokenIds.size > 0) {
              userERC721Tokens.set(token.address, ownedTokenIds);
            }
          }
        })
      );

      const tokenIdsSets = [...userERC721Tokens.values()];
      const tokenAddressesKeys = [...userERC721Tokens.keys()];

      await Promise.all(
        // Same here
        tokenIdsSets.map(async (tokenIdsSet, setIndex) => {
          const tokenAddress = tokenAddressesKeys[setIndex];
          // Damn, this is so ugly
          // Probably using Moralis API might improve this
          // But I also don't want to intruduce another API for this single thing
          // Maybe, if we will encounter need to wider support of ERC-1155 - we will bring it and improve this piece of crap as well :D
          await Promise.all(
            [...tokenIdsSet.values()].map(async tokenId => {
              const tokenVoted = await erc721LinearVotingContract.asSigner.hasVoted(
                proposalId,
                tokenAddress,
                tokenId
              );
              totalTokenAddresses.push(tokenAddress);
              totalTokenIds.push(tokenId);
              if (!tokenVoted) {
                tokenAddresses.push(tokenAddress);
                tokenIds.push(tokenId);
              }
            })
          );
        })
      );

      setTotalVotingTokenAddresses(totalTokenAddresses);
      setTotalVotingTokenIds(totalTokenIds);
      setRemainingTokenAddresses(tokenAddresses);
      setRemainingTokenIds(tokenIds);
      setTokenIdsByAddressMap(userERC721Tokens);
    };

    getUserERC721VotingTokens();
  }, [erc721LinearVotingContract, proposalId, erc721Tokens, signerOrProvider, address]);

  return {
    totalVotingTokenIds,
    totalVotingTokenAddresses,
    remainingTokenAddresses,
    remainingTokenIds,
    tokenIdsByAddressMap,
  };
}
