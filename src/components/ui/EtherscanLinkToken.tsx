import useEtherscanLink from '../../hooks/useSubDomain';

function EtherscanLinkToken({ address, children }: { address: string; children: React.ReactNode }) {
  const subdomain = useEtherscanLink(address);
  return (
    <a
      href={`https://${subdomain}etherscan.io/token/${address}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanLinkToken;
