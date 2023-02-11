import { useCallback } from 'react';
import { useSigner } from 'wagmi';
import { BigNumberValuePair, GnosisDAO, TokenGovernanceDAO } from '../types';

export function usePrepareFormData() {
  const { data: signer } = useSigner();

  const prepareMultisigFormData = useCallback(
    async ({ trustedAddresses, ...rest }: GnosisDAO) => {
      const resolvedAddresses = await Promise.all(
        trustedAddresses.map(async inputValue => {
          if (inputValue.endsWith('.eth')) {
            const resolvedAddress = await signer!.resolveName(inputValue);
            return resolvedAddress;
          }
          return inputValue;
        })
      );
      return {
        trustedAddresses: resolvedAddresses,
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
      ...rest
    }: TokenGovernanceDAO<BigNumberValuePair>): Promise<TokenGovernanceDAO> => {
      const resolvedTokenAllocations = await Promise.all(
        tokenAllocations.map(async allocation => {
          let address = allocation.address;
          if (address.endsWith('.eth')) {
            address = await signer!.resolveName(allocation.address);
          }
          return { amount: allocation.amount.bigNumberValue, address: address };
        })
      );
      return {
        tokenSupply: tokenSupply.bigNumberValue,
        parentAllocationAmount: parentAllocationAmount?.bigNumberValue,
        quorumPercentage: quorumPercentage.bigNumberValue,
        timelock: timelock.bigNumberValue,
        votingPeriod: votingPeriod.bigNumberValue,
        tokenAllocations: resolvedTokenAllocations,
        ...rest,
      };
    },
    [signer]
  );
  return { prepareMultisigFormData, prepareGnosisUsulFormData };
}
