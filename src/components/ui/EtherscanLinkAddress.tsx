import useSubDomain from '../../hooks/useSubDomain';

function EtherscanLinkAddress({
  address,
  children,
}: {
  address?: string;
  children: React.ReactNode;
}) {
  const subdomain = useSubDomain();
  const href = address ? `https://${subdomain}etherscan.io/address/${address}` : undefined;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanLinkAddress;
