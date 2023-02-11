import { useCallback } from 'react';
import { useSigner } from 'wagmi';
import { DAOEssentials, GnosisConfiguration } from '../types';
type GnosisMultisigData = DAOEssentials & GnosisConfiguration;

export function usePrepareFormData() {
  const { data: signer } = useSigner();

  const prepareMultisigFormData = useCallback(
    async ({ trustedAddresses, ...rest }: GnosisMultisigData) => {
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
  return { prepareMultisigFormData };
}
