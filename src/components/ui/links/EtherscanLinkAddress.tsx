import { Link } from '@chakra-ui/react';
import useSubDomain from '../../../hooks/utils/useSubDomain';

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
    <Link
      href={href}
      isExternal
    >
      {children}
    </Link>
  );
}

export default EtherscanLinkAddress;
