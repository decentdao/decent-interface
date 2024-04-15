import { ERC721__factory } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { zeroAddress } from 'viem';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { ERC721TokenData } from '../../../../types';
import useSafeContracts from '../../../safe/useSafeContracts';
import useSignerOrProvider from '../../../utils/useSignerOrProvider';

export default function useERC721Tokens() {
  const signerOrProvider = useSignerOrProvider();
  const {
    governanceContracts: { erc721LinearVotingContractAddress },
    action,
  } = useFractal();
  const baseContracts = useSafeContracts();
  const loadERC721Tokens = useCallback(async () => {
    if (!erc721LinearVotingContractAddress || !signerOrProvider || !baseContracts) {
      return;
    }
    const erc721LinearVotingContract =
      baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(
        erc721LinearVotingContractAddress,
      );
    const addresses = await erc721LinearVotingContract.getAllTokenAddresses();
    const erc721Tokens: ERC721TokenData[] = await Promise.all(
      addresses.map(async address => {
        const tokenContract = ERC721__factory.connect(address, signerOrProvider);
        const votingWeight = (await erc721LinearVotingContract.getTokenWeight(address)).toBigInt();
        const name = await tokenContract.name();
        const symbol = await tokenContract.symbol();
        let totalSupply = undefined;
        try {
          const tokenMintEvents = await tokenContract.queryFilter(
            tokenContract.filters.Transfer(zeroAddress, null),
          );
          const tokenBurnEvents = await tokenContract.queryFilter(
            tokenContract.filters.Transfer(null, zeroAddress),
          );
          totalSupply = BigInt(tokenMintEvents.length - tokenBurnEvents.length);
        } catch (e) {
          logError('Error while getting ERC721 total supply');
        }
        return { name, symbol, address, votingWeight, totalSupply };
      }),
    );

    action.dispatch({
      type: FractalGovernanceAction.SET_ERC721_TOKENS_DATA,
      payload: erc721Tokens,
    });
  }, [erc721LinearVotingContractAddress, signerOrProvider, action, baseContracts]);

  return loadERC721Tokens;
}
