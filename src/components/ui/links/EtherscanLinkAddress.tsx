import { Link } from '@chakra-ui/next-js';
import { LinkProps } from '@chakra-ui/react';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';

interface Props extends LinkProps {
  address?: string | null;
  children: React.ReactNode;
}

/**
 * An address link to Etherscan.
 *
 * For most use cases, you probably want to use DisplayAddress,
 * to add proper styling.
 */
export default function EtherscanLinkAddress({ address, children, ...rest }: Props) {
  const { etherscanBaseURL } = useNetworkConfg();

  if (!address) {
    return null;
  }

  return (
    <Link
      href={`${etherscanBaseURL}/address/${address}`}
      target="_blank"
      {...rest}
    >
      {children}
    </Link>
  );
}
