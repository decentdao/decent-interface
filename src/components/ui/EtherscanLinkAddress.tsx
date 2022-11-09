import useSubDomain from '../../hooks/useSubDomain';

function EtherscanLinkAddress({
  path = 'address',
  address,
  children,
}: {
  path?: string;
  address?: string;
  children: React.ReactNode;
}) {
  const subdomain = useSubDomain();
  const href = address ? `https://${subdomain}etherscan.io/${path}/${address}` : undefined;

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
