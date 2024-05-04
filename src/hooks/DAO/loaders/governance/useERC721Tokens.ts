import { useCallback } from 'react';
import { getAddress, zeroAddress } from 'viem';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { ERC721TokenData } from '../../../../types';
import useSafeContracts from '../../../safe/useSafeContracts';
import useContractClient from '../../../utils/useContractClient';

export default function useERC721Tokens() {
  const { walletOrPublicClient } = useContractClient();
  const {
    governanceContracts: { erc721LinearVotingContractAddress },
    action,
  } = useFractal();
  const baseContracts = useSafeContracts();
  const loadERC721Tokens = useCallback(async () => {
    if (
      !erc721LinearVotingContractAddress ||
      !walletOrPublicClient ||
      !baseContracts ||
      !baseContracts.linearVotingERC721MasterCopyContract
    ) {
      return;
    }
    const erc721LinearVotingContract = getContract({
      address: erc721LinearVotingContractAddress,
      abi: baseContracts.linearVotingERC721MasterCopyContract.asPublic.abi,
      client: walletOrPublicClient,
    });
    const addresses = (await erc721LinearVotingContract.read.getAllTokenAddresses([])) as Address[];
    const erc721Tokens: ERC721TokenData[] = await Promise.all(
      addresses.map(async address => {
        const tokenContract = getContract({
          abi: erc721Abi,
          address,
          client: walletOrPublicClient,
        });
        const votingWeight = (await erc721LinearVotingContract.read.getTokenWeight([
          address,
        ])) as bigint;
        const name = await tokenContract.read.name();
        const symbol = await tokenContract.read.symbol();
        let totalSupply = undefined;
        try {
          const tokenMintEvents = await tokenContract.getEvents.Transfer({ from: zeroAddress });
          const tokenBurnEvents = await tokenContract.getEvents.Transfer({ to: zeroAddress });
          totalSupply = BigInt(tokenMintEvents.length - tokenBurnEvents.length);
        } catch (e) {
          logError('Error while getting ERC721 total supply');
        }
        return { name, symbol, address: getAddress(address), votingWeight, totalSupply };
      }),
    );

    action.dispatch({
      type: FractalGovernanceAction.SET_ERC721_TOKENS_DATA,
      payload: erc721Tokens,
    });
  }, [erc721LinearVotingContractAddress, walletOrPublicClient, action, baseContracts]);

  return loadERC721Tokens;
}
