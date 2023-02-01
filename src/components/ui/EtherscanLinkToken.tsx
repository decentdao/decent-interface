import { ethers } from 'ethers';
import { useEtherscanDomain } from '../../hooks/utils/useChainData';

function EtherscanLinkToken({ address, children }: { address: string; children: React.ReactNode }) {
  const domain = useEtherscanDomain();
  return (
    <a
      href={`${domain}/${address === ethers.constants.AddressZero ? '' : 'token/'}${address}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanLinkToken;
