import {
  ERC721__factory,
  Azorius,
  LinearERC721Voting__factory,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';
import { useState, useEffect, useCallback } from 'react';
import { getAddress } from 'viem';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { AzoriusGovernance } from '../../../types';
import { getAzoriusModuleFromModules } from '../../../utils';
import { SENTINEL_MODULE } from '../../../utils/address';
import useSafeContracts from '../../safe/useSafeContracts';
import useSignerOrProvider from '../../utils/useSignerOrProvider';
import { useFractalModules } from '../loaders/useFractalModules';

/**
 * Retrieves list of ERC-721 voting tokens for the supplied `address`(aka `user.address`) param
 * @param {string} [proposalId] - Proposal ID. When it's provided - calculates `remainingTokenIds` and `remainingTokenAddresses` that user can use for voting on speicific proposal.
 * @param {string|null} [safeAddress] - address of Safe{Wallet}, for which voting tokens should be retrieved. If not provided - these are used from global context.
 * @param {boolean} [loadOnMount] - whether to fetch voting tokens on component mount or not. Leaves the space to fetch those tokens via getUserERC721VotingTokens
 * @returns {string[]} `totalVotingTokenIds` - list of all ERC-721 tokens that are held by `address`.
 * @returns {string[]} `totalVotingTokenAddresses` - list of contract addresses that corresponds to token `totalVotingTokenIds` array. Aka if user holds 3 tokens of from 1 NFT contract - the address of contract will be repeated 3 times.
 * @returns {string[]} `remainingTokenIds - list of tokens that `address` can use for proposal under `proposalId` param. This covers the case when user already voted for proposal but received more tokens, that weren't used in this proposal.
 * @returns {string[]} `remainingTokenAddresses` - same as `totalVotingTokenAddresses` - repeats contract address of NFT for each token ID in `remainingTokenIds` array.
 */
export default function useUserERC721VotingTokens(
  safeAddress: string | null,
  proposalId?: string,
  loadOnMount: boolean = true,
) {
  const [totalVotingTokenIds, setTotalVotingTokenIds] = useState<string[]>([]);
  const [totalVotingTokenAddresses, setTotalVotingTokenAddresses] = useState<string[]>([]);
  const [remainingTokenIds, setRemainingTokenIds] = useState<string[]>([]);
  const [remainingTokenAddresses, setRemainingTokenAddresses] = useState<string[]>([]);

  const signerOrProvider = useSignerOrProvider();
  const {
    node: { safe },
    governanceContracts: { erc721LinearVotingContractAddress },
    governance,
    readOnly: { user },
  } = useFractal();
  const baseContracts = useSafeContracts();
  const lookupModules = useFractalModules();
  const safeAPI = useSafeAPI();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { erc721Tokens } = azoriusGovernance;

  const globalContextSafeAddress = safe?.address;

  const getUserERC721VotingTokens = useCallback(
    async (_safeAddress: string | null, _proposalId?: string) => {
      const totalTokenAddresses: string[] = [];
      const totalTokenIds: string[] = [];
      const tokenAddresses: string[] = [];
      const tokenIds: string[] = [];
      const userERC721Tokens = new Map<string, Set<string>>();

      let govTokens = erc721Tokens;
      let votingContract: LinearERC721Voting | undefined;

      if (!baseContracts || !signerOrProvider || !globalContextSafeAddress) {
        return {
          totalVotingTokenAddresses: totalTokenAddresses,
          totalVotingTokenIds: totalTokenIds,
          remainingTokenAddresses: tokenAddresses,
          remainingTokenIds: tokenIds,
        };
      }

      if (_safeAddress && globalContextSafeAddress !== _safeAddress) {
        // Means getting these for any safe, primary use case - calculating user voting weight for freeze voting
        const safeInfo = await safeAPI!.getSafeInfo(getAddress(_safeAddress));
        const safeModules = await lookupModules(safeInfo.modules);
        const azoriusModule = getAzoriusModuleFromModules(safeModules);
        if (azoriusModule && azoriusModule.moduleContract) {
          const azoriusContract = azoriusModule.moduleContract as Azorius;
          // @dev assumes the first strategy is the voting contract
          const votingContractAddress = (
            await azoriusContract.getStrategies(SENTINEL_MODULE, 0)
          )[1];
          votingContract = LinearERC721Voting__factory.connect(
            votingContractAddress,
            signerOrProvider,
          );
          const addresses = await votingContract.getAllTokenAddresses();
          govTokens = await Promise.all(
            addresses.map(async tokenAddress => {
              const tokenContract = ERC721__factory.connect(tokenAddress, signerOrProvider);
              const votingWeight = (await votingContract!.getTokenWeight(tokenAddress)).toBigInt();
              const name = await tokenContract.name();
              const symbol = await tokenContract.symbol();
              let totalSupply = undefined;
              try {
                const tokenSentEvents = await tokenContract.queryFilter(
                  tokenContract.filters.Transfer(null, null),
                );
                totalSupply = BigInt(tokenSentEvents.length);
              } catch (e) {
                logError('Error while getting ERC721 total supply');
              }
              return { name, symbol, address: getAddress(tokenAddress), votingWeight, totalSupply };
            }),
          );
        }
      }
      if (erc721LinearVotingContractAddress && !votingContract) {
        votingContract = baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(
          erc721LinearVotingContractAddress,
        );
      }

      if (!govTokens || !votingContract || !user.address) {
        return {
          totalVotingTokenAddresses: totalTokenAddresses,
          totalVotingTokenIds: totalTokenIds,
          remainingTokenAddresses: tokenAddresses,
          remainingTokenIds: tokenIds,
        };
      }
      await Promise.all(
        // Using `map` instead of `forEach` to simplify usage of `Promise.all`
        // and guarantee syncronous contractFn assignment
        govTokens.map(async token => {
          const tokenContract = ERC721__factory.connect(token.address, signerOrProvider!);
          if ((await tokenContract.balanceOf(user.address!)).toBigInt() > 0n) {
            const tokenSentEvents = await tokenContract.queryFilter(
              tokenContract.filters.Transfer(user.address!, null),
            );
            const tokenReceivedEvents = await tokenContract.queryFilter(
              tokenContract.filters.Transfer(null, user.address),
            );
            const allEvents = tokenSentEvents
              .concat(tokenReceivedEvents)
              .sort(
                (a, b) => a.blockNumber - b.blockNumber || a.transactionIndex - b.transactionIndex,
              );

            const ownedTokenIds = new Set<string>();
            allEvents.forEach(({ args: { to, from, tokenId } }) => {
              if (to.toLowerCase() === user.address!.toLowerCase()) {
                ownedTokenIds.add(tokenId.toString());
              } else if (from.toLowerCase() === user.address!.toLowerCase()) {
                ownedTokenIds.delete(tokenId.toString());
              }
            });
            if (ownedTokenIds.size > 0) {
              userERC721Tokens.set(token.address, ownedTokenIds);
            }
          }
        }),
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
              totalTokenAddresses.push(tokenAddress);
              totalTokenIds.push(tokenId);
              if (_proposalId) {
                const tokenVoted = await votingContract!.hasVoted(
                  _proposalId,
                  tokenAddress,
                  tokenId,
                );
                if (!tokenVoted) {
                  tokenAddresses.push(tokenAddress);
                  tokenIds.push(tokenId);
                }
              }
            }),
          );
        }),
      );

      return {
        totalVotingTokenAddresses: totalTokenAddresses,
        totalVotingTokenIds: totalTokenIds,
        remainingTokenAddresses: tokenAddresses,
        remainingTokenIds: tokenIds,
      };
    },
    [
      erc721LinearVotingContractAddress,
      erc721Tokens,
      signerOrProvider,
      lookupModules,
      safeAPI,
      globalContextSafeAddress,
      user.address,
      baseContracts,
    ],
  );

  const loadUserERC721VotingTokens = useCallback(async () => {
    const tokensInfo = await getUserERC721VotingTokens(safeAddress, proposalId);
    if (tokensInfo) {
      setTotalVotingTokenAddresses(tokensInfo.totalVotingTokenAddresses);
      setTotalVotingTokenIds(tokensInfo.totalVotingTokenIds);
      setRemainingTokenAddresses(tokensInfo.remainingTokenAddresses);
      setRemainingTokenIds(tokensInfo.remainingTokenIds);
    }
  }, [getUserERC721VotingTokens, proposalId, safeAddress]);

  useEffect(() => {
    if (loadOnMount && erc721LinearVotingContractAddress) {
      loadUserERC721VotingTokens();
    }
  }, [loadUserERC721VotingTokens, loadOnMount, erc721LinearVotingContractAddress]);

  return {
    totalVotingTokenIds,
    totalVotingTokenAddresses,
    remainingTokenAddresses,
    remainingTokenIds,
    getUserERC721VotingTokens,
    loadUserERC721VotingTokens,
  };
}
