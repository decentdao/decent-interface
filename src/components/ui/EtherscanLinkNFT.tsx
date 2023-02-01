import { Link } from '@chakra-ui/react';
import { useEtherscanDomain } from '../../hooks/utils/useChainData';

function EtherscanLinkNFT({
  address,
  tokenId,
  children,
}: {
  address: string;
  tokenId: string;
  children: React.ReactNode;
}) {
  const domain = useEtherscanDomain();
  return (
    <Link
      href={`${domain}/nft/${address}/${tokenId}`}
      isExternal
    >
      {children}
    </Link>
  );
}

export default EtherscanLinkNFT;
