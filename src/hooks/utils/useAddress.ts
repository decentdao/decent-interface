import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { CacheExpiry, CacheKeys, useLocalStorage } from './useLocalStorage';

const useAddress = (addressInput: string | undefined) => {
  const provider = useProvider();

  const [address, setAddress] = useState<string>();
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const [isAddressLoading, setIsAddressLoading] = useState<boolean>(false);
  const { setValue, getValue } = useLocalStorage();

  useEffect(() => {
    setIsAddressLoading(true);

    // handles the initial state of usages of useAddress,
    // which could be undefined until the intended address
    // is determined
    if (addressInput === undefined) {
      setAddress(undefined);
      setIsValidAddress(undefined);
      return;
    }

    if (!addressInput || addressInput.trim() === '') {
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

    if (!addressInput.includes('.') || addressInput.length - addressInput.indexOf('.') === 2) {
      setAddress(addressInput);
      setIsValidAddress(false);
      setIsAddressLoading(false);
      return;
    }

    // check our cache for a potential resolved address (name.eth -> 0x0)
    const cachedResolvedAddress = getValue(addressInput);
    if (cachedResolvedAddress) {
      setAddress(cachedResolvedAddress);
      setIsValidAddress(true);
      setIsAddressLoading(false);
      return;
    } else if (cachedResolvedAddress === undefined) {
      // a previous lookup did not resolve
      setAddress(addressInput);
      setIsValidAddress(false);
      setIsAddressLoading(false);
      return;
    }

    if (!provider) {
      setAddress(addressInput);
      setIsValidAddress(undefined);
      setIsAddressLoading(false);
      return;
    }

    provider
      .resolveName(addressInput)
      .then(resolvedAddress => {
        if (!resolvedAddress) {
          // cache an unresolved address as 'undefined' for 20 minutes
          setValue(CacheKeys.ENS_RESOLVE_PREFIX + addressInput, undefined, 20);
          setAddress(addressInput);
          setIsValidAddress(false);
        } else {
          // cache a resolved address for a week
          setValue(
            CacheKeys.ENS_RESOLVE_PREFIX + addressInput,
            resolvedAddress,
            CacheExpiry.ONE_WEEK
          );
          setAddress(resolvedAddress);
          setIsValidAddress(true);
        }
      })
      .catch(() => {
        setAddress(addressInput);
        setIsValidAddress(false);
      })
      .finally(() => {
        setIsAddressLoading(false);
      });
  }, [provider, addressInput, getValue, setValue]);

  return { address, isValidAddress, isAddressLoading };
};

export default useAddress;
