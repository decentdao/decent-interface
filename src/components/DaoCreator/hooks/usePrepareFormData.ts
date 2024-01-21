import { IVotes__factory } from '@fractal-framework/fractal-contracts';

import { useCallback } from 'react';
import { useEthersProvider } from '../../../hooks/utils/useEthersProvider';
import { useEthersSigner } from '../../../hooks/utils/useEthersSigner';
import {
  SafeMultisigDAO,
  DAOFreezeGuardConfig,
  BigNumberValuePair,
  TokenCreationType,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
} from '../../../types';
import { getEstimatedNumberOfBlocks } from '../../../utils/contract';
import { couldBeENS } from '../../../utils/url';

type FreezeGuardConfigParam = { freezeGuard?: DAOFreezeGuardConfig<BigNumberValuePair> };

export function usePrepareFormData() {
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  // Helper function to prepare freezeGuard data
  const prepareFreezeGuardData = useCallback(
    async (
      freezeGuard: DAOFreezeGuardConfig<BigNumberValuePair>
    ): Promise<DAOFreezeGuardConfig> => {
      return {
        executionPeriod: await getEstimatedNumberOfBlocks(
          freezeGuard.executionPeriod.bigNumberValue!,
          provider
        ),
        timelockPeriod: await getEstimatedNumberOfBlocks(
          freezeGuard.timelockPeriod.bigNumberValue!,
          provider
        ),
        freezeVotesThreshold: freezeGuard.freezeVotesThreshold.bigNumberValue!,
        freezeProposalPeriod: await getEstimatedNumberOfBlocks(
          freezeGuard.freezeProposalPeriod.bigNumberValue!,
          provider
        ),
        freezePeriod: await getEstimatedNumberOfBlocks(
          freezeGuard.freezePeriod.bigNumberValue!,
          provider
        ),
      };
    },
    [provider]
  );

  const checkVotesToken = useCallback(
    async (address: string) => {
      try {
        const votesContract = IVotes__factory.connect(address, provider);
        await votesContract.delegates('0x0000000000000000000000000000000000000001');
        await votesContract.getVotes('0x0000000000000000000000000000000000000001');
        return true;
      } catch (error) {
        return false;
      }
    },
    [provider]
  );

  const prepareMultisigFormData = useCallback(
    async ({
      trustedAddresses,
      freezeGuard,
      ...rest
    }: SafeMultisigDAO & FreezeGuardConfigParam) => {
      const resolvedAddresses = await Promise.all(
        trustedAddresses.map(async inputValue => {
          if (couldBeENS(inputValue)) {
            const resolvedAddress = await signer!.resolveName(inputValue);
            return resolvedAddress;
          }
          return inputValue;
        })
      );
      let freezeGuardData: Partial<DAOFreezeGuardConfig> = {};
      if (freezeGuard) {
        freezeGuardData = await prepareFreezeGuardData(freezeGuard);
      }
      return {
        trustedAddresses: resolvedAddresses,
        ...freezeGuardData,
        ...rest,
      };
    },
    [signer, prepareFreezeGuardData]
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
    }: AzoriusERC20DAO<BigNumberValuePair> & FreezeGuardConfigParam): Promise<AzoriusERC20DAO> => {
      const resolvedTokenAllocations = await Promise.all(
        tokenAllocations.map(async allocation => {
          let address = allocation.address;
          if (couldBeENS(address)) {
            address = await signer!.resolveName(allocation.address);
          }
          return { amount: allocation.amount.bigNumberValue!, address: address };
        })
      );
      let freezeGuardData: Partial<DAOFreezeGuardConfig> = {};
      if (freezeGuard) {
        freezeGuardData = await prepareFreezeGuardData(freezeGuard);
      }
      const isTokenImported =
        tokenCreationType === TokenCreationType.IMPORTED && !!tokenImportAddress;
      let isVotesToken = false;
      if (isTokenImported) {
        isVotesToken = await checkVotesToken(tokenImportAddress);
      }
      return {
        tokenSupply: tokenSupply.bigNumberValue!,
        parentAllocationAmount: parentAllocationAmount?.bigNumberValue!,
        quorumPercentage: quorumPercentage.bigNumberValue!,
        timelock: await getEstimatedNumberOfBlocks(timelock.bigNumberValue!, provider),
        executionPeriod: await getEstimatedNumberOfBlocks(
          executionPeriod.bigNumberValue!,
          provider
        ),
        votingPeriod: await getEstimatedNumberOfBlocks(votingPeriod.bigNumberValue!, provider),
        tokenAllocations: resolvedTokenAllocations,
        tokenImportAddress,
        tokenCreationType,
        isTokenImported,
        isVotesToken,
        ...freezeGuardData,
        ...rest,
      };
    },
    [signer, checkVotesToken, provider, prepareFreezeGuardData]
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
    }: AzoriusERC721DAO<BigNumberValuePair> &
      FreezeGuardConfigParam): Promise<AzoriusERC721DAO> => {
      let freezeGuardData: Partial<DAOFreezeGuardConfig> = {};
      if (freezeGuard) {
        freezeGuardData = await prepareFreezeGuardData(freezeGuard);
      }

      const resolvedNFTs = await Promise.all(
        nfts.map(async nft => {
          let address = nft.tokenAddress;
          if (couldBeENS(address)) {
            address = await signer!.resolveName(nft.tokenAddress);
          }
          return {
            tokenAddress: address,
            tokenWeight: nft.tokenWeight.bigNumberValue!,
          };
        })
      );

      return {
        quorumPercentage: quorumPercentage.bigNumberValue!,
        timelock: await getEstimatedNumberOfBlocks(timelock.bigNumberValue!, provider),
        executionPeriod: await getEstimatedNumberOfBlocks(
          executionPeriod.bigNumberValue!,
          provider
        ),
        votingPeriod: await getEstimatedNumberOfBlocks(votingPeriod.bigNumberValue!, provider),
        nfts: resolvedNFTs,
        quorumThreshold: quorumThreshold.bigNumberValue!,
        ...freezeGuardData,
        ...rest,
      };
    },
    [prepareFreezeGuardData, provider, signer]
  );
  return {
    prepareMultisigFormData,
    prepareAzoriusERC20FormData,
    prepareAzoriusERC721FormData,
    checkVotesToken,
  };
}
