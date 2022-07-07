import EtherscanLink from './EtherscanLink';

function EtherscanLinkNFT({
  address,
  tokenId,
  children,
}: {
  address: string | undefined | null;
  tokenId?: string;
  children: React.ReactNode;
}) {
  return (
    <EtherscanLink
      linkType="nft"
      address={address}
      tokenId={tokenId}
    >
      {children}
    </EtherscanLink>
  );
}

export default EtherscanLinkNFT;
