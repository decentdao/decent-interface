import { Link } from '@chakra-ui/react';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';

function EtherscanLinkAddress({
  path = 'address',
  address,
  children,
}: {
  path?: string;
  address?: string;
  children: React.ReactNode;
}) {
  const { etherscanBaseURL } = useNetworkConfg();
  const href = address ? `${etherscanBaseURL}/${path}/${address}` : undefined;

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
