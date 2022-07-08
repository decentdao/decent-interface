import useEtherscanLink from '../../hooks/useSubDomain';

function EtherscanLinkAddress({
  address,
  children,
}: {
  address: string | undefined;
  children: React.ReactNode;
}) {
  const subdomain = useEtherscanLink(address);
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

export default EtherscanLinkAddress;
