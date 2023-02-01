import { useEtherscanDomain } from '../../hooks/utils/useChainData';

function EtherscanTransactionLink({
  txHash,
  children,
}: {
  txHash: string | undefined;
  children: React.ReactNode;
}) {
  const domain = useEtherscanDomain();
  return (
    <a
      href={`${domain}/tx/${txHash}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanTransactionLink;
