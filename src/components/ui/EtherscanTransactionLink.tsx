import useSubDomain from '../../hooks/useSubDomain';

function EtherscanTransactionLink({
  address,
  children,
}: {
  address: string | undefined;
  children: React.ReactNode;
}) {
  const subdomain = useSubDomain();
  return (
    <a
      href={`https://${subdomain}etherscan.io/transaction/${address}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanTransactionLink;
