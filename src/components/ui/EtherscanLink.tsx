import { useState, useEffect } from 'react';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';

function EtherscanLink({
  address,
  children,
}: {
  address: string | undefined | null;
  children: React.ReactNode;
}) {
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
    return <div>{children}</div>;
  }

  return (
    <a
      href={`https://${subdomain}etherscan.io/address/${address}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanLink;
