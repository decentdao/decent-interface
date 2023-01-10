import { useEffect, useState } from 'react';
import { useNetwork } from 'wagmi';

function useSubDomain() {
  const { chain } = useNetwork();
  const [subdomain, setSubdomain] = useState('');

  useEffect(() => {
    if (!chain || ['localhost', 'homestead'].includes(chain.network)) {
      setSubdomain('');
      return;
    }

    setSubdomain(`${chain.network}.`);
  }, [chain]);

  return subdomain;
}

export default useSubDomain;
