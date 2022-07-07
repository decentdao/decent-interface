import EtherscanLink from './EtherscanLink';

function EtherscanLinkToken({
  address,
  children,
}: {
  address: string | undefined | null;
  tokenId?: string;
  children: React.ReactNode;
}) {
  return (
    <EtherscanLink
      linkType="token"
      address={address}
    >
      {children}
    </EtherscanLink>
  );
}

export default EtherscanLinkToken;
