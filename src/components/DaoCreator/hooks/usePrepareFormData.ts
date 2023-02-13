import { useCallback } from 'react';
import { useSigner } from 'wagmi';
import { BigNumberValuePair, DAOVetoGuardConfig, GnosisDAO, TokenGovernanceDAO } from '../types';

export function usePrepareFormData() {
  const { data: signer } = useSigner();

  const prepareMultisigFormData = useCallback(
    async ({
      trustedAddresses,
      vetoGuard,
      ...rest
    }: GnosisDAO & { vetoGuard?: DAOVetoGuardConfig<BigNumberValuePair> }) => {
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
      if (vetoGuard) {
        vetoGuardData = {
          executionPeriod: vetoGuard.executionPeriod.bigNumberValue,
          timelockPeriod: vetoGuard.timelockPeriod.bigNumberValue,
          vetoVotesThreshold: vetoGuard.vetoVotesThreshold.bigNumberValue,
          freezeVotesThreshold: vetoGuard.freezeVotesThreshold.bigNumberValue,
          freezeProposalPeriod: vetoGuard.freezeProposalPeriod.bigNumberValue,
          freezePeriod: vetoGuard.freezePeriod.bigNumberValue,
        };
      }
      return {
        trustedAddresses: resolvedAddresses,
        ...vetoGuardData,
        ...rest,
      };
    },
    [signer]
  );

  const prepareGnosisUsulFormData = useCallback(
    async ({
      tokenSupply,
      tokenAllocations,
      parentAllocationAmount,
      quorumPercentage,
      timelock,
      votingPeriod,
      vetoGuard,
      ...rest
    }: TokenGovernanceDAO<BigNumberValuePair> & {
      vetoGuard?: DAOVetoGuardConfig<BigNumberValuePair>;
    }): Promise<TokenGovernanceDAO> => {
      const resolvedTokenAllocations = await Promise.all(
        tokenAllocations.map(async allocation => {
          let address = allocation.address;
          if (address.endsWith('.eth')) {
            address = await signer!.resolveName(allocation.address);
          }
          return { amount: allocation.amount.bigNumberValue, address: address };
        })
      );
      let vetoGuardData: Partial<DAOVetoGuardConfig> = {};
      if (vetoGuard) {
        vetoGuardData = {
          executionPeriod: vetoGuard.executionPeriod.bigNumberValue,
          timelockPeriod: vetoGuard.timelockPeriod.bigNumberValue,
          vetoVotesThreshold: vetoGuard.vetoVotesThreshold.bigNumberValue,
          freezeVotesThreshold: vetoGuard.freezeVotesThreshold.bigNumberValue,
          freezeProposalPeriod: vetoGuard.freezeProposalPeriod.bigNumberValue,
          freezePeriod: vetoGuard.freezePeriod.bigNumberValue,
        };
      }
      return {
        tokenSupply: tokenSupply.bigNumberValue,
        parentAllocationAmount: parentAllocationAmount?.bigNumberValue,
        quorumPercentage: quorumPercentage.bigNumberValue,
        timelock: timelock.bigNumberValue,
        votingPeriod: votingPeriod.bigNumberValue,
        tokenAllocations: resolvedTokenAllocations,
        ...vetoGuardData,
        ...rest,
      };
    },
    [signer]
  );
  return { prepareMultisigFormData, prepareGnosisUsulFormData };
}
