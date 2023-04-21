import { ERC20Votes__factory } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import { useProvider, useSigner } from 'wagmi';
import {
  GnosisDAO,
  DAOVetoGuardConfig,
  BigNumberValuePair,
  TokenGovernanceDAO,
  TokenCreationType,
} from '../../../types';

export function usePrepareFormData() {
  const { data: signer } = useSigner();
  const provider = useProvider();

  const checkVotesToken = useCallback(
    async (address: string) => {
      try {
        const votesContract = new ethers.Contract(address, ERC20Votes__factory.abi, provider);
        await votesContract.estimateGas.delegate('0x0000000000000000000000000000000000000001');
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
          executionPeriod: vetoGuard.executionPeriod.bigNumberValue!,
          timelockPeriod: vetoGuard.timelockPeriod.bigNumberValue!,
          vetoVotesThreshold: vetoGuard.vetoVotesThreshold.bigNumberValue!,
          freezeVotesThreshold: vetoGuard.freezeVotesThreshold.bigNumberValue!,
          freezeProposalPeriod: vetoGuard.freezeProposalPeriod.bigNumberValue!,
          freezePeriod: vetoGuard.freezePeriod.bigNumberValue!,
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

  const prepareGnosisAzoriusFormData = useCallback(
    async ({
      tokenSupply,
      tokenAllocations,
      parentAllocationAmount,
      quorumPercentage,
      timelock,
      votingPeriod,
      vetoGuard,
      tokenImportAddress,
      tokenCreationType,
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
          return { amount: allocation.amount.bigNumberValue!, address: address };
        })
      );
      let vetoGuardData: Partial<DAOVetoGuardConfig> = {};
      if (vetoGuard) {
        vetoGuardData = {
          executionPeriod: vetoGuard.executionPeriod.bigNumberValue!,
          timelockPeriod: vetoGuard.timelockPeriod.bigNumberValue!,
          vetoVotesThreshold: vetoGuard.vetoVotesThreshold.bigNumberValue!,
          freezeVotesThreshold: vetoGuard.freezeVotesThreshold.bigNumberValue!,
          freezeProposalPeriod: vetoGuard.freezeProposalPeriod.bigNumberValue!,
          freezePeriod: vetoGuard.freezePeriod.bigNumberValue!,
        };
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
        timelock: timelock.bigNumberValue!,
        votingPeriod: votingPeriod.bigNumberValue!,
        tokenAllocations: resolvedTokenAllocations,
        tokenImportAddress,
        tokenCreationType,
        isTokenImported,
        isVotesToken,
        ...vetoGuardData,
        ...rest,
      };
    },
    [signer, checkVotesToken]
  );
  return { prepareMultisigFormData, prepareGnosisAzoriusFormData, checkVotesToken };
}
