import { useState, useEffect } from 'react';
import { ethers, constants } from 'ethers';
import { useWeb3 } from '../web3';

const useAddress = (addressInput: string | undefined) => {
  const { provider } = useWeb3();

  const [address, setAddress] = useState<string>();
  const [validAddress, setValidAddress] = useState<boolean>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAddress(undefined);
    setValidAddress(undefined);
    setLoading(true);

    if (addressInput === undefined) {
      setAddress(undefined);
      setValidAddress(undefined);
      setLoading(false);
      return;
    }

    if (!provider || addressInput.trim() === "") {
      return;
    }

    if (addressInput === constants.AddressZero) {
      setAddress(undefined);
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

    setAddress(undefined);
    setValidAddress(undefined);

    const timeout = setTimeout(() => {
      provider.resolveName(addressInput)
        .then(resolvedAddress => {
          if (!resolvedAddress) {
            setAddress(undefined);
            setValidAddress(false);
            setLoading(false);
            return;
          }
          setAddress(resolvedAddress);
          setValidAddress(true);
          setLoading(false);
        })
        .catch(() => {
          setAddress(undefined);
          setValidAddress(false);
          setLoading(false);
        });
    }, 500);

    return () => {
      clearTimeout(timeout);
    }
  }, [provider, addressInput]);

  return [address, validAddress, loading] as const;
}

export default useAddress;