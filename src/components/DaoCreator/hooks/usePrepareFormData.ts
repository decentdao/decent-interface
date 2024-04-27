import { IVotes__factory } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { getAddress } from 'viem';
import { useEthersProvider } from '../../../providers/Ethers/hooks/useEthersProvider';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import {
  SafeMultisigDAO,
  DAOFreezeGuardConfig,
  BigIntValuePair,
  TokenCreationType,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
} from '../../../types';
import { getEstimatedNumberOfBlocks } from '../../../utils/contract';
import { couldBeENS } from '../../../utils/url';

type FreezeGuardConfigParam = { freezeGuard?: DAOFreezeGuardConfig<BigIntValuePair> };

export function usePrepareFormData() {
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  // Helper function to prepare freezeGuard data
  const prepareFreezeGuardData = useCallback(
    async (
      freezeGuard: DAOFreezeGuardConfig<BigIntValuePair>,
    ): Promise<DAOFreezeGuardConfig | undefined> => {
      if (provider) {
        return {
          executionPeriod: await getEstimatedNumberOfBlocks(
            freezeGuard.executionPeriod.bigintValue!,
            provider,
          ),
          timelockPeriod: await getEstimatedNumberOfBlocks(
            freezeGuard.timelockPeriod.bigintValue!,
            provider,
          ),
          freezeVotesThreshold: freezeGuard.freezeVotesThreshold.bigintValue!,
          freezeProposalPeriod: await getEstimatedNumberOfBlocks(
            freezeGuard.freezeProposalPeriod.bigintValue!,
            provider,
          ),
          freezePeriod: await getEstimatedNumberOfBlocks(
            freezeGuard.freezePeriod.bigintValue!,
            provider,
          ),
        };
      }
    },
    [provider],
  );

  const checkVotesToken = useCallback(
    async (address: string) => {
      if (provider) {
        try {
          const votesContract = IVotes__factory.connect(address, provider);
          await votesContract.delegates('0x0000000000000000000000000000000000000001');
          await votesContract.getVotes('0x0000000000000000000000000000000000000001');
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    [provider],
  );

  const prepareMultisigFormData = useCallback(
    async ({
      trustedAddresses,
      freezeGuard,
      ...rest
    }: SafeMultisigDAO & FreezeGuardConfigParam) => {
      const resolvedAddresses = await Promise.all(
        trustedAddresses.map(async inputValue => {
          if (couldBeENS(inputValue) && signer) {
            const resolvedAddress = await signer.resolveName(inputValue);
            return resolvedAddress;
          }
          return inputValue;
        }),
      );
      let freezeGuardData;
      if (freezeGuard) {
        freezeGuardData = await prepareFreezeGuardData(freezeGuard);
      }
      return {
        trustedAddresses: resolvedAddresses,
        ...freezeGuardData,
        ...rest,
      };
    },
    [signer, prepareFreezeGuardData],
  );

  const prepareAzoriusERC20FormData = useCallback(
    async ({
      tokenSupply,
      tokenAllocations,
      parentAllocationAmount,
      quorumPercentage,
      timelock,
      votingPeriod,
      executionPeriod,
      freezeGuard,
      tokenImportAddress,
      tokenCreationType,
      ...rest
    }: AzoriusERC20DAO<BigIntValuePair> & FreezeGuardConfigParam): Promise<
      AzoriusERC20DAO | undefined
    > => {
      if (provider) {
        const resolvedTokenAllocations = await Promise.all(
          tokenAllocations.map(async allocation => {
            let address = allocation.address;
            if (couldBeENS(address) && signer) {
              address = await signer.resolveName(allocation.address);
            }
            return { amount: allocation.amount.bigintValue!, address: address };
          }),
        );
        let freezeGuardData;
        if (freezeGuard) {
          freezeGuardData = await prepareFreezeGuardData(freezeGuard);
        }
        const isTokenImported =
          tokenCreationType === TokenCreationType.IMPORTED && !!tokenImportAddress;
        let isVotesToken: boolean | undefined = false;
        if (isTokenImported) {
          isVotesToken = await checkVotesToken(tokenImportAddress);
        }
        return {
          tokenSupply: tokenSupply.bigintValue!,
          parentAllocationAmount: parentAllocationAmount?.bigintValue!,
          quorumPercentage: quorumPercentage.bigintValue!,
          timelock: await getEstimatedNumberOfBlocks(timelock.bigintValue!, provider),
          executionPeriod: await getEstimatedNumberOfBlocks(executionPeriod.bigintValue!, provider),
          votingPeriod: await getEstimatedNumberOfBlocks(votingPeriod.bigintValue!, provider),
          tokenAllocations: resolvedTokenAllocations,
          tokenImportAddress,
          tokenCreationType,
          isTokenImported,
          isVotesToken,
          ...freezeGuardData,
          ...rest,
        };
      }
    },
    [signer, checkVotesToken, provider, prepareFreezeGuardData],
  );

  const prepareAzoriusERC721FormData = useCallback(
    async ({
      quorumPercentage,
      timelock,
      executionPeriod,
      votingPeriod,
      freezeGuard,
      nfts,
      quorumThreshold,
      ...rest
    }: AzoriusERC721DAO<BigIntValuePair> & FreezeGuardConfigParam): Promise<
      AzoriusERC721DAO | undefined
    > => {
      if (provider && signer) {
        let freezeGuardData;
        if (freezeGuard) {
          freezeGuardData = await prepareFreezeGuardData(freezeGuard);
        }

        const resolvedNFTs = await Promise.all(
          nfts.map(async nft => {
            let address = nft.tokenAddress;
            if (couldBeENS(address) && nft.tokenAddress) {
              address = getAddress(await signer.resolveName(nft.tokenAddress));
            }
            return {
              tokenAddress: address,
              tokenWeight: nft.tokenWeight.bigintValue!,
            };
          }),
        );

        return {
          quorumPercentage: quorumPercentage.bigintValue!,
          timelock: await getEstimatedNumberOfBlocks(timelock.bigintValue!, provider),
          executionPeriod: await getEstimatedNumberOfBlocks(executionPeriod.bigintValue!, provider),
          votingPeriod: await getEstimatedNumberOfBlocks(votingPeriod.bigintValue!, provider),
          nfts: resolvedNFTs,
          quorumThreshold: quorumThreshold.bigintValue!,
          ...freezeGuardData,
          ...rest,
        };
      }
    },
    [prepareFreezeGuardData, provider, signer],
  );
  return {
    prepareMultisigFormData,
    prepareAzoriusERC20FormData,
    prepareAzoriusERC721FormData,
    checkVotesToken,
  };
}
