import { useEffect, useState } from 'react';
import { getAddress, isAddress } from 'viem';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { couldBeENS } from '../../utils/url';

const useAddress = (addressInput: string | undefined) => {
  const provider = useEthersProvider();

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

    if (isAddress(addressInput)) {
      setAddress(getAddress(addressInput));
      setIsValidAddress(true);
      setIsAddressLoading(false);
      return;
    }

    // if it can't be an ENS address, validation is false
    if (!couldBeENS(addressInput)) {
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
  }, [addressInput, provider]);

  return { address, isValidAddress, isAddressLoading };
};

export default useAddress;
