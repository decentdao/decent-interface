import { useState, useEffect } from 'react';

import { useWeb3 } from '../../contexts/web3Data';

function EtherscanLink({ address, children }: {
  address: string | undefined,
  children: React.ReactNode,
}) {
  let [{ networkName }] = useWeb3();
  const [subdomain, setSubdomain] = useState("");

  useEffect(() => {
    if (!networkName || ["localhost", "homestead"].includes(networkName)) {
      setSubdomain("");
      return;
    }

    setSubdomain(`${networkName}.`);
  }, [networkName]);

  if (!networkName || !address) {
    return (
      <div>{children}</div>
    );
  }

  return (
    <a href={`https://${subdomain}etherscan.io/address/${address}`} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default EtherscanLink;
