import { LinkProps } from '@chakra-ui/react';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import EtherscanLinkBase from './EtherscanLinkBase';

interface Props extends LinkProps {
  txHash?: string | null;
  children: React.ReactNode;
}

/**
 * A transaction link to Etherscan.
 *
 * For most use cases, you probably want to use DisplayTransaction,
 * to add proper styling.
 */
export default function EtherscanLinkTransaction({ txHash, children, ...rest }: Props) {
  const { etherscanBaseURL } = useNetworkConfg();

  if (!txHash) {
    return null;
  }

  return (
    <EtherscanLinkBase
      href={`${etherscanBaseURL}/tx/${txHash}`}
      {...rest}
    >
      {children}
    </EtherscanLinkBase>
  );
}
