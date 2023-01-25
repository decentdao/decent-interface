import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';

const useAddress = (addressInput: string | undefined) => {
  const provider = useProvider();

  const [address, setAddress] = useState<string>();
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const [isAddressLoading, setIsAddressLoading] = useState<boolean>(false);

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
          setAddress(addressInput);
          setIsValidAddress(false);
        } else {
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
  }, [provider, addressInput]);

  return { address, isValidAddress, isAddressLoading };
};

export default useAddress;
