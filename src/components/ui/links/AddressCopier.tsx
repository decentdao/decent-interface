import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { Copy } from '@decent-org/fractal-ui';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from './EtherscanLinkAddress';

interface Props extends FlexProps {
  address: string;
}

/**
 * A component that displays a truncated address, along with the "copy to clipboard"
 * icon to the right of it.
 */
export default function AddressCopier({ address, ...rest }: Props) {
  const { accountSubstring } = useDisplayName(address);
  const copyToClipboard = useCopyText();

  return (
    <Flex
      alignItems="center"
      onClick={() => copyToClipboard(address)}
      gap="0.5rem"
      cursor="pointer"
      w="fit-content"
      color="grayscale.100"
      _hover={{ color: 'gold.500-hover' }}
      {...rest}
    >
      <EtherscanLinkAddress address={address}>
        <Text textStyle="text-base-mono-regular">{accountSubstring}</Text>
      </EtherscanLinkAddress>
      <Copy
        boxSize="1.5rem"
        fill="currentColor"
      />
    </Flex>
  );
}
