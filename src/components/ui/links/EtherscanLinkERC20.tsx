import { LinkProps } from '@chakra-ui/react';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import EtherscanLinkBase from './EtherscanLinkBase';

interface Props extends LinkProps {
  address?: string | null;
  children: React.ReactNode;
}

function EtherscanLinkERC20({ address, children, ...rest }: Props) {
  const { etherscanBaseURL } = useNetworkConfig();

  if (!address) {
    return null;
  }

  return (
    <EtherscanLinkBase
      href={`${etherscanBaseURL}/token/${address}`}
      {...rest}
    >
      {children}
    </EtherscanLinkBase>
  );
}

export default EtherscanLinkERC20;
