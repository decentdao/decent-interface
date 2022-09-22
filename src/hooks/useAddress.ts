import { useState, useEffect } from 'react';
import { ethers, constants } from 'ethers';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../helpers/errorlogging';

const useAddress = (addressInput: string | undefined) => {
  const {
    state: { provider },
  } = useWeb3Provider();

  const [address, setAddress] = useState<string>();
  const [validAddress, setValidAddress] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    setLoading(true);

    if (addressInput === undefined) {
      setAddress(undefined);
      setValidAddress(false);
      setLoading(false);
      return;
    }

    if (!provider || addressInput.trim() === '') {
      return;
    }

    if (addressInput === constants.AddressZero) {
      setAddress('');
      setValidAddress(false);
      setLoading(false);
      return;
    }

    if (ethers.utils.isAddress(addressInput)) {
      setAddress(ethers.utils.getAddress(addressInput));
      setValidAddress(true);
      setLoading(false);
      return;
    }

    provider
      .resolveName(addressInput)
      .then(resolvedAddress => {
        if (!resolvedAddress) {
          setAddress('');
          setValidAddress(false);
          setLoading(false);
          return;
        }
        setAddress(resolvedAddress);
        setValidAddress(true);
        setLoading(false);
      })
      .catch(() => {
        setAddress('');
        setValidAddress(false);
        setLoading(false);
      });
  }, [provider, addressInput]);

  return [address, validAddress, loading] as const;
};

export const checkAddress = async (provider: any, addressInput?: string): Promise<boolean> => {
  if (!addressInput || !addressInput.trim()) {
    return false;
  }

  if (addressInput === constants.AddressZero) {
    return false;
  }

  if (ethers.utils.isAddress(addressInput)) {
    return true;
  }

  // check if it's a registered ENS name (e.g. blah.eth)
  // note that if provider is undefined here, we don't actually know, but will return false
  try {
    const resolvedAddress = await provider.resolveName(addressInput);
    if (!resolvedAddress) {
      return false;
    }
    return true;
  } catch (e) {
    logError(e);
    return false;
  }
};

export default useAddress;
