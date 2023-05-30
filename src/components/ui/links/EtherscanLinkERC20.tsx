import { LinkProps } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import EtherscanLinkBase from './EtherscanLinkBase';

interface Props extends LinkProps {
  address?: string | null;
  children: React.ReactNode;
}

function EtherscanLinkERC20({ address, children, ...rest }: Props) {
  const { etherscanBaseURL } = useNetworkConfg();

  if (!address) {
    return null;
  }

  return (
    <EtherscanLinkBase
      href={`${etherscanBaseURL}/${
        address === ethers.constants.AddressZero ? '' : 'token/'
      }${address}`}
      {...rest}
    >
      {children}
    </EtherscanLinkBase>
  );
}

export default EtherscanLinkERC20;
