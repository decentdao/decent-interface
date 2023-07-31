import {
  ERC721__factory,
  Azorius,
  LinearERC721Voting__factory,
} from '@fractal-framework/fractal-contracts';
import { utils, BigNumber } from 'ethers';
import { useState, useEffect, useCallback } from 'react';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../types';
import { getAzoriusModuleFromModules } from '../../../utils';
import useSignerOrProvider from '../../utils/useSignerOrProvider';
import { useFractalModules } from '../loaders/useFractalModules';

export default function useAddressERC721VotingTokens(
  proposalId?: string,
  address?: string,
  safeAddress?: string | null
) {
  const [totalVotingTokenIds, setTotalVotingTokenIds] = useState<string[]>([]);
  const [totalVotingTokenAddresses, setTotalVotingTokenAddresses] = useState<string[]>([]);
  const [remainingTokenIds, setRemainingTokenIds] = useState<string[]>([]);
  const [remainingTokenAddresses, setRemainingTokenAddresses] = useState<string[]>([]);
  const [tokenIdsByAddressMap, setTokenIdsByAddressMap] = useState<Map<string, Set<string>>>(
    new Map()
  );

  const signerOrProvider = useSignerOrProvider();
  const {
    node: { daoAddress },
    governanceContracts: { erc721LinearVotingContract },
    governance,
    clients: { safeService },
  } = useFractal();
  const lookupModules = useFractalModules();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { erc721Tokens } = azoriusGovernance;

  const getUserERC721VotingTokens = useCallback(async () => {
    if (!address) {
      return;
    }
    let govTokens = erc721Tokens;
    let votingContract = erc721LinearVotingContract?.asSigner;

    if (safeAddress && daoAddress !== safeAddress) {
      // Means getting these for any safe, primary use case - calculating user voting weight for freeze voting
      const safeInfo = await safeService.getSafeInfo(utils.getAddress(safeAddress));
      const safeModules = await lookupModules(safeInfo.modules);
      const azoriusModule = getAzoriusModuleFromModules(safeModules);
      if (azoriusModule && azoriusModule.moduleContract) {
        const azoriusContract = azoriusModule.moduleContract as Azorius;
        const votingContractAddress = await azoriusContract
          .queryFilter(azoriusContract.filters.EnabledStrategy())
          .then(strategiesEnabled => {
            return strategiesEnabled[0].args.strategy;
          });
        votingContract = LinearERC721Voting__factory.connect(
          votingContractAddress,
          signerOrProvider
        );
        const addresses = await votingContract.getAllTokenAddresses();
        govTokens = await Promise.all(
          addresses.map(async tokenAddress => {
            const tokenContract = ERC721__factory.connect(tokenAddress, signerOrProvider);
            const votingWeight = await votingContract!.getTokenWeight(tokenAddress);
            const name = await tokenContract.name();
            const symbol = await tokenContract.symbol();
            let totalSupply = undefined;
            try {
              const tokenSentEvents = await tokenContract.queryFilter(
                tokenContract.filters.Transfer(null, null)
              );
              totalSupply = BigNumber.from(tokenSentEvents.length);
            } catch (e) {
              logError('Error while getting ERC721 total supply');
            }
            return { name, symbol, address: tokenAddress, votingWeight, totalSupply };
          })
        );
      }
    }

    const totalTokenAddresses: string[] = [];
    const totalTokenIds: string[] = [];
    const tokenAddresses: string[] = [];
    const tokenIds: string[] = [];
    const userERC721Tokens = new Map<string, Set<string>>();

    if (!govTokens || !votingContract) {
      return;
    }
    await Promise.all(
      // Using `map` instead of `forEach` to simplify usage of `Promise.all`
      // and guarantee syncronous contractFn assignment
      govTokens.map(async token => {
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
            totalTokenAddresses.push(tokenAddress);
            totalTokenIds.push(tokenId);
            if (proposalId) {
              const tokenVoted = await votingContract!.hasVoted(proposalId, tokenAddress, tokenId);
              if (!tokenVoted) {
                tokenAddresses.push(tokenAddress);
                tokenIds.push(tokenId);
              }
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
  }, [
    erc721LinearVotingContract,
    proposalId,
    erc721Tokens,
    signerOrProvider,
    address,
    lookupModules,
    safeAddress,
    safeService,
    daoAddress,
  ]);

  useEffect(() => {
    getUserERC721VotingTokens();
  }, [getUserERC721VotingTokens]);

  return {
    totalVotingTokenIds,
    totalVotingTokenAddresses,
    remainingTokenAddresses,
    remainingTokenIds,
    tokenIdsByAddressMap,
    getUserERC721VotingTokens,
  };
}
