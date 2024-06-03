import { useEffect, useState } from 'react';
import { Address, getAddress, isAddress } from 'viem';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';

const useAddress = (addressInput: string) => {
  const provider = useEthersProvider();

  const [address, setAddress] = useState<Address>();
  const [isValid, setIsValid] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setAddress(undefined);
    setIsValid(undefined);
    setIsLoading(false);

    if (addressInput === '') {
      return;
    }

    setIsLoading(true);

    if (isAddress(addressInput)) {
      setAddress(getAddress(addressInput));
      setIsValid(true);
      setIsLoading(false);
      return;
    }

    if (!provider) {
      setAddress(undefined);
      setIsValid(undefined);
      setIsLoading(false);
      return;
    }

    provider
      .resolveName(addressInput)
      .then(resolvedAddress => {
        if (resolvedAddress) {
          setAddress(getAddress(resolvedAddress));
          setIsValid(true);
        } else {
          setAddress(undefined);
          setIsValid(false);
        }
      })
      .catch(() => {
        setAddress(undefined);
        setIsValid(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [addressInput, provider]);

  return { address, isValid, isLoading };
};

export default useAddress;
