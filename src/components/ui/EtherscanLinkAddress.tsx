import { Link } from '@chakra-ui/react';
import { useEtherscanDomain } from '../../hooks/utils/useChainData';

function EtherscanLinkAddress({
  path = 'address',
  address,
  children,
}: {
  path?: string;
  address?: string;
  children: React.ReactNode;
}) {
  const domain = useEtherscanDomain();
  const href = address ? `${domain}/${path}/${address}` : undefined;

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
