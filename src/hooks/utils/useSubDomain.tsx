import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';

function useSubDomain() {
  const provider = useProvider();
  const [subdomain, setSubdomain] = useState('');

  useEffect(() => {
    if (['localhost', 'homestead', 'mainnet'].includes(provider.network.name)) {
      setSubdomain('');
      return;
    }

    setSubdomain(`${provider.network.name}.`);
  }, [provider]);

  return subdomain;
}

export default useSubDomain;
