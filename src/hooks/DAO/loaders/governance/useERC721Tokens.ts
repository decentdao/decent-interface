import { useCallback } from 'react';
import { erc721Abi, getAddress, getContract, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import LinearERC721VotingAbi from '../../../../assets/abi/LinearERC721Voting';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { ERC721TokenData } from '../../../../types';
import useSafeContracts from '../../../safe/useSafeContracts';

export default function useERC721Tokens() {
  const {
    governanceContracts: { erc721LinearVotingContractAddress },
    action,
  } = useFractal();
  const baseContracts = useSafeContracts();
  const publicClient = usePublicClient();
  const loadERC721Tokens = useCallback(async () => {
    if (!erc721LinearVotingContractAddress || !baseContracts || !publicClient) {
      return;
    }
    const erc721LinearVotingContract = getContract({
      abi: LinearERC721VotingAbi,
      address: getAddress(erc721LinearVotingContractAddress),
      client: publicClient,
    });
    const addresses = await erc721LinearVotingContract.read.getAllTokenAddresses();
    const erc721Tokens: ERC721TokenData[] = await Promise.all(
      addresses.map(async address => {
        const tokenContract = getContract({
          abi: erc721Abi,
          address: address,
          client: publicClient,
        });
        const votingWeight = await erc721LinearVotingContract.read.getTokenWeight([address]);
        const [name, symbol, tokenMintEvents, tokenBurnEvents] = await Promise.all([
          tokenContract.read.name(),
          tokenContract.read.symbol(),
          tokenContract.getEvents.Transfer({ from: zeroAddress }),
          tokenContract.getEvents.Transfer({ to: zeroAddress }),
        ]);
        const totalSupply = BigInt(tokenMintEvents.length - tokenBurnEvents.length);
        return { name, symbol, address: address, votingWeight, totalSupply };
      }),
    );

    action.dispatch({
      type: FractalGovernanceAction.SET_ERC721_TOKENS_DATA,
      payload: erc721Tokens,
    });
  }, [action, baseContracts, erc721LinearVotingContractAddress, publicClient]);

  return loadERC721Tokens;
}
