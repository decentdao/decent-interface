import { Link } from '@chakra-ui/next-js';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';

function EtherscanLinkAddress({
  path = 'address',
  address,
  children,
}: {
  path?: string;
  address?: string | null;
  children: React.ReactNode;
}) {
  const { etherscanBaseURL } = useNetworkConfg();
  if (!address) {
    return null;
  }

  const href = `${etherscanBaseURL}/${path}/${address}`;

  return (
    <Link
      href={href}
      target="_blank"
    >
      {children}
    </Link>
  );
}

export default EtherscanLinkAddress;
