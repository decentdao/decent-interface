import { Link } from '@chakra-ui/react';
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
    <Link
      href={href}
      isExternal
    >
      {children}
    </Link>
  );
}

export default EtherscanLinkAddress;
