import { Link } from '@chakra-ui/next-js';
import { Copy } from '@decent-org/fractal-ui';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';

function EtherscanLinkAddress({
  path = 'address',
  address,
  showCopyButton,
  children,
}: {
  path?: string;
  address?: string;
  showCopyButton?: boolean;
  children: React.ReactNode;
}) {
  const { etherscanBaseURL } = useNetworkConfg();
  const copyToClipboard = useCopyText();

  if (!address) {
    return null;
  }

  const href = `${etherscanBaseURL}/${path}/${address}`;

  return (
    <>
      <Link
        href={href}
        target="_blank"
      >
        {children}
      </Link>
      {showCopyButton && (
        <Copy
          onClick={() => copyToClipboard(safeAddress)}
          boxSize="1.5rem"
        />
      )}
    </>
  );
}

export default EtherscanLinkAddress;
