import { LinkProps } from '@chakra-ui/react';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import EtherscanLinkBase from './EtherscanLinkBase';

interface Props extends LinkProps {
  address?: string | null;
  tokenId?: string | null;
  children: React.ReactNode;
}

export default function EtherscanLinkERC721({ address, tokenId, children, ...rest }: Props) {
  const { etherscanBaseURL } = useNetworkConfig();

  if (!address || !tokenId) {
    return null;
  }

  return (
    <EtherscanLinkBase
      href={`${etherscanBaseURL}/token/${address}/?a=${tokenId}`}
      {...rest}
    >
      {children}
    </EtherscanLinkBase>
  );
}
