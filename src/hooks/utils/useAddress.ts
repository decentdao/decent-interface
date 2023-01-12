import { constants, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { logError } from '../../helpers/errorLogging';

const useAddress = (addressInput: string | undefined) => {
  const provider = useProvider();

  const [address, setAddress] = useState<string>();
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const [isAddressLoading, setIsAddressLoading] = useState<boolean>();

  useEffect(() => {
    setIsAddressLoading(true);
    if (addressInput === undefined) {
      setAddress(addressInput);
      setIsValidAddress(false);
      setIsAddressLoading(false);
      return;
    }

    if (!provider || addressInput.trim() === '') {
      setAddress(addressInput);
      setIsValidAddress(undefined);
      setIsAddressLoading(undefined);
      return;
    }

    if (addressInput === constants.AddressZero) {
      setAddress(addressInput);
      setIsValidAddress(false);
      setIsAddressLoading(false);
      return;
    }

    if (ethers.utils.isAddress(addressInput)) {
      setAddress(ethers.utils.getAddress(addressInput));
      setIsValidAddress(true);
      setIsAddressLoading(false);
      return;
    }

    provider
      .resolveName(addressInput)
      .then(resolvedAddress => {
        if (!resolvedAddress) {
          setAddress(addressInput);
          setIsValidAddress(false);
          setIsAddressLoading(false);
          return;
        }
        setAddress(resolvedAddress);
        setIsValidAddress(true);
        setIsAddressLoading(false);
      })
      .catch(() => {
        setAddress(addressInput);
        setIsValidAddress(false);
        setIsAddressLoading(false);
      });
  }, [provider, addressInput]);

  return { address, isValidAddress, isAddressLoading };
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
