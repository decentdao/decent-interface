import { IVotes__factory } from '@fractal-framework/fractal-contracts';

import { useCallback } from 'react';
import { useProvider, useSigner } from 'wagmi';
import {
  SafeMultisigDAO,
  DAOVetoGuardConfig,
  BigNumberValuePair,
  AzoriusGovernanceDAO,
  TokenCreationType,
} from '../../../types';
import { getEstimatedNumberOfBlocks } from '../../../utils/contract';

export function usePrepareFormData() {
  const { data: signer } = useSigner();
  const provider = useProvider();

  // Helper function to prepare freezeGuard data
  const prepareFreezeGuardData = useCallback(
    async (freezeGuard: DAOVetoGuardConfig<BigNumberValuePair>): Promise<DAOVetoGuardConfig> => {
      return {
        executionPeriod: await getEstimatedNumberOfBlocks(
          freezeGuard.executionPeriod.bigNumberValue!,
          provider
        ),
        timelockPeriod: await getEstimatedNumberOfBlocks(
          freezeGuard.timelockPeriod.bigNumberValue!,
          provider
        ),
        vetoVotesThreshold: freezeGuard.vetoVotesThreshold.bigNumberValue!,
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
    }: SafeMultisigDAO & { freezeGuard?: DAOVetoGuardConfig<BigNumberValuePair> }) => {
      const resolvedAddresses = await Promise.all(
        trustedAddresses.map(async inputValue => {
          if (inputValue.endsWith('.eth')) {
            const resolvedAddress = await signer!.resolveName(inputValue);
            return resolvedAddress;
          }
          return inputValue;
        })
      );
      let vetoGuardData: Partial<DAOVetoGuardConfig> = {};
      if (freezeGuard) {
        vetoGuardData = await prepareFreezeGuardData(freezeGuard);
      }
      return {
        trustedAddresses: resolvedAddresses,
        ...vetoGuardData,
        ...rest,
      };
    },
    [signer, prepareFreezeGuardData]
  );

  const prepareAzoriusFormData = useCallback(
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
    }: AzoriusGovernanceDAO<BigNumberValuePair> & {
      freezeGuard?: DAOVetoGuardConfig<BigNumberValuePair>;
    }): Promise<AzoriusGovernanceDAO> => {
      const resolvedTokenAllocations = await Promise.all(
        tokenAllocations.map(async allocation => {
          let address = allocation.address;
          if (address.endsWith('.eth')) {
            address = await signer!.resolveName(allocation.address);
          }
          return { amount: allocation.amount.bigNumberValue!, address: address };
        })
      );
      let vetoGuardData: Partial<DAOVetoGuardConfig> = {};
      if (freezeGuard) {
        vetoGuardData = await prepareFreezeGuardData(freezeGuard);
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
        ...vetoGuardData,
        ...rest,
      };
    },
    [signer, checkVotesToken, provider, prepareFreezeGuardData]
  );
  return { prepareMultisigFormData, prepareAzoriusFormData, checkVotesToken };
}
