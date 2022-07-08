import { useState, useEffect } from 'react';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';

function useSubDomain(address: string | undefined) {
  let {
    state: { network },
  } = useWeb3Provider();
  const [subdomain, setSubdomain] = useState('');

  useEffect(() => {
    if (!network || ['localhost', 'homestead'].includes(network)) {
      setSubdomain('');
      return;
    }

    setSubdomain(`${network}.`);
  }, [network]);

  if (!network || !address) {
    return <div></div>;
  }
  return subdomain;
}

export default useSubDomain;
