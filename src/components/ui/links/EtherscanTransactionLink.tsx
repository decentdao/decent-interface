import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';

/**
 * A transaction link to Etherscan.
 *
 * For most use cases, you probably want to use DisplayTransaction,
 * to add proper styling.
 */
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
