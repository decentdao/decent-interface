import { Link } from '@chakra-ui/next-js';
import { Flex, Text } from '@chakra-ui/react';
import { ArrowAngleUp, Copy } from '@decent-org/fractal-ui';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';

function EtherscanLinkAddress({
  path = 'address',
  address,
  showCopyButton,
  children,
}: {
  path?: string;
  showCopyButton?: boolean;
  address?: string | null;
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
          onClick={() => copyToClipboard(address)}
          boxSize="1.5rem"
          cursor="pointer"
          ml={1}
        />
      )}
    </>
  );
}

export default EtherscanLinkAddress;
