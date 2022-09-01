import useSubDomain from '../../hooks/useSubDomain';
import { ethers } from 'ethers';

function EtherscanLinkToken({ address, children }: { address: string; children: React.ReactNode }) {
  const subdomain = useSubDomain();
  return (
    <a
      href={`https://${subdomain}etherscan.io/${
        address === ethers.constants.AddressZero ? '' : 'token/'
      }${address}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanLinkToken;
