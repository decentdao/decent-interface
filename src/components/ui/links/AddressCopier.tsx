import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { CopySimple } from '@phosphor-icons/react';
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
      py="0.25rem"
      px="0.75rem"
      gap="0.25rem"
      cursor="pointer"
      color="celery-0"
      textStyle="button-base"
      {...rest}
    >
      <EtherscanLinkAddress address={address}>
        <Text>{accountSubstring}</Text>
      </EtherscanLinkAddress>
      <CopySimple fill="currentColor" />
    </Flex>
  );
}
