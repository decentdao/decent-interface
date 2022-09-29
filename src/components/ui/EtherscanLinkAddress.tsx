import useDisplayName from '../../hooks/useDisplayName';
import useSubDomain from '../../hooks/useSubDomain';

function EtherscanLinkAddress({
  address,
  children,
  showDisplayName,
}: {
  address: string | undefined;
  children?: React.ReactNode;
  showDisplayName?: boolean;
}) {
  const subdomain = useSubDomain();
  const displayName = useDisplayName();

  if (!address) {
    return null;
  }

  return (
    <a
      href={`https://${subdomain}etherscan.io/address/${address}`}
      target="_blank"
      rel="noreferrer"
    >
      {showDisplayName ? displayName : children}
    </a>
  );
}

export default EtherscanLinkAddress;
