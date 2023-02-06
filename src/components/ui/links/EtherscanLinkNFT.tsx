import { Link } from '@chakra-ui/react';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';

function EtherscanLinkNFT({
  address,
  tokenId,
  children,
}: {
  address: string;
  tokenId: string;
  children: React.ReactNode;
}) {
  const { etherscanBaseURL } = useNetworkConfg();
  return (
    <Link
      href={`${etherscanBaseURL}/${address}/${tokenId}`}
      isExternal
    >
      {children}
    </Link>
  );
}

export default EtherscanLinkNFT;
