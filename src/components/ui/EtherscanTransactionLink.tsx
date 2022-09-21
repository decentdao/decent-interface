import useSubDomain from '../../hooks/useSubDomain';

function EtherscanTransactionLink({
  txHash,
  children,
}: {
  txHash: string | undefined;
  children: React.ReactNode;
}) {
  const subdomain = useSubDomain();
  return (
    <a
      href={`https://${subdomain}etherscan.io/tx/${txHash}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanTransactionLink;
