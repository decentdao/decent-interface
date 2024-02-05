import { LinkProps } from '@chakra-ui/react';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import EtherscanLinkBase from './EtherscanLinkBase';

interface Props extends LinkProps {
  blockNumber?: string | null;
  children: React.ReactNode;
}

/**
 * A transaction link to Etherscan.
 *
 * For most use cases, you probably want to use DisplayTransaction,
 * to add proper styling.
 */
export default function EtherscanLinkBlock({ blockNumber, children, ...rest }: Props) {
  const { etherscanBaseURL } = useNetworkConfig();

  if (!blockNumber) {
    return null;
  }

  return (
    <EtherscanLinkBase
      href={`${etherscanBaseURL}/block/${blockNumber}`}
      {...rest}
    >
      {children}
    </EtherscanLinkBase>
  );
}
