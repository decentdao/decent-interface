import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';

function EtherscanTransactionLink({
  txHash,
  children,
}: {
  txHash: string | undefined;
  children: React.ReactNode;
}) {
  const { etherscanBaseURL } = useNetworkConfg();
  return (
    <a
      href={`${etherscanBaseURL}/tx/${txHash}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default EtherscanTransactionLink;
