import useEtherscanLink from '../../hooks/useSubDomain';

function EtherscanLinkNFT({
  address,
  tokenId,
  children,
}: {
  address: string;
  tokenId: string;
  children: React.ReactNode;
}) {
  const subdomain = useEtherscanLink(address);
  return (
    <a
      href={`https://${subdomain}etherscan.io/nft/${address}/${tokenId}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanLinkNFT;
