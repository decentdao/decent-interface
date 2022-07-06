import { useState, useEffect } from 'react';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';

function EtherscanLink({
  linkType,
  address,
  tokenId,
  children,
}: {
  linkType?: 'address' | 'nft' | 'token';
  address: string | undefined | null;
  tokenId?: string;
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
      href={`https://${subdomain}etherscan.io/${!linkType ? 'address' : linkType}/${address}${
        !tokenId ? '' : `/${tokenId}`
      }`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanLink;
